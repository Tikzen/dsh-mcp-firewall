import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createAuditStore } from './audit.mjs'
import { approvalKey, createApprovalQueue } from './approval.mjs'
import { analyzeWithDsh } from './analysis.mjs'
import { analyzePolicy, buildConversations, buildInventory, dashboardStats, decorateAudit, normalizeConfig, repairPolicyConflicts, safetyReport, setToolAction } from './dashboard.mjs'
import { evaluateDecision, hardGuard } from './policy.mjs'
import { defaultConfig, extractHost, isMcpTool, redactSensitive, summarizeArguments } from './shared.mjs'

export const API_ROOT = '/api/plugins/dsh-mcp-firewall'
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const safeError = error => error instanceof Error ? error.message : String(error)

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 256 * 1024) throw new HttpError(413, '请求体不能超过 256 KB')
    chunks.push(buffer)
  }
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new HttpError(400, '请求体不是有效 JSON') }
}

function respond(res, status, body) {
  res.writeHead(status, JSON_HEADERS)
  res.end(JSON.stringify(body))
}

function respondText(res, status, body, filename) {
  res.writeHead(status, {
    'content-type': 'text/markdown; charset=utf-8',
    'content-disposition': `attachment; filename="${filename}"`,
    'cache-control': 'no-store',
  })
  res.end(body)
}

function publicConfig(config) {
  return {
    enabled: config.enabled,
    defaultAction: config.defaultAction,
    injectionAction: config.injectionAction,
    approvalTimeoutEnabled: config.approvalTimeoutEnabled,
    approvalTimeoutMs: config.approvalTimeoutMs,
    allowTools: config.allowTools,
    askTools: config.askTools,
    denyTools: config.denyTools,
    argRules: config.argRules,
    hostRules: config.hostRules,
  }
}

export const inject = ['tools', 'webServer']

export function apply(ctx, inputConfig = {}) {
  const defaults = defaultConfig()
  const stateDir = resolve(String(inputConfig.stateDir || inputConfig.auditDir || join(process.cwd(), '.dsh-mcp-firewall')))
  const policyFile = join(stateDir, 'policy.json')
  const audit = createAuditStore({ auditDir: stateDir })
  let config = normalizeConfig(inputConfig, defaults)
  let saveChain = Promise.resolve()
  let policyChain = Promise.resolve()
  const analysisCache = new Map()
  const sessionGrants = new Map()
  const sessionGrantTtlMs = Number(inputConfig.sessionGrantTtlMs) || 60 * 60_000
  const approvals = createApprovalQueue({
    timeoutMs: effectiveApprovalTimeout(config),
    onSettled: ({ request, context, outcome, metadata }) => {
      audit.approval(request, outcome, {
        ...context,
        approvalAction: metadata.action,
        resolutionSource: metadata.source,
      })
      if (context.simulated) {
        audit.record({
          phase: 'result', callId: request.callId, agentId: request.agent?.id, name: request.toolName,
          ...context, isError: outcome !== 'allowed-once',
          ...(outcome !== 'allowed-once' ? { errorName: 'UserRejectedError', resultSummary: '安全演练中的拒绝结果已返回 Agent。' } : {}),
        })
      }
    },
  })

  const hydrated = Promise.all([
    readFile(policyFile, 'utf8').then(text => {
      config = normalizeConfig({ ...config, ...JSON.parse(text) }, defaults)
    }).catch(error => {
      if (error?.code !== 'ENOENT') throw error
    }),
    audit.ready,
  ]).then(() => {
    approvals.setTimeoutMs(effectiveApprovalTimeout(config))
    return persistConfig()
  })

  function persistConfig() {
    const snapshot = JSON.stringify(publicConfig(config), null, 2)
    saveChain = saveChain.catch(() => undefined).then(async () => {
      await mkdir(stateDir, { recursive: true })
      await writeFile(policyFile, `${snapshot}\n`, 'utf8')
    })
    return saveChain
  }

  function changePolicy(build) {
    const operation = policyChain.then(async () => {
      const before = config
      const draft = structuredClone(config)
      const change = build(draft) || {}
      config = normalizeConfig(change.config || draft, defaults)
      try {
        await persistConfig()
      } catch (error) {
        config = before
        throw error
      }
      const auditEntry = typeof change.audit === 'function' ? change.audit(config, before) : change.audit
      if (auditEntry) audit.policy(auditEntry)
      return config
    })
    policyChain = operation.catch(() => undefined)
    return operation
  }

  function state() {
    const records = audit.memory()
    const tools = buildInventory(ctx.tools.schemas(), config, records)
    const pending = new Map(approvals.list().map(item => [item.key, item]))
    const events = decorateAudit(records).map(event => {
      const approval = pending.get(approvalKey(event.sessionId, event.callId))
      return {
        ...event,
        approvalPending: Boolean(approval),
        approvalExpiresAt: approval?.expiresAt ?? null,
        approvalProcessing: approval?.processing ?? false,
        approvalProcessingAction: approval?.processingAction ?? null,
      }
    })
    const stats = dashboardStats(events, tools)
    return {
      config: publicConfig(config),
      tools,
      events: events.slice(0, 1000),
      conversations: buildConversations(events),
      grants: activeSessionGrants(),
      policyIssues: analyzePolicy(config),
      stats: { ...stats, unresolved: approvals.size() },
      meta: { stateDir, auditFile: audit.file, version: '0.6.0', approvalTimeoutMs: effectiveApprovalTimeout(config), sessionGrantTtlMs },
    }
  }

  function activeSessionGrants(sessionId) {
    const time = Date.now()
    for (const [id, grant] of sessionGrants) if (Date.parse(grant.expiresAt) <= time) sessionGrants.delete(id)
    return [...sessionGrants.values()].filter(grant => !sessionId || grant.sessionId === sessionId)
  }

  function addSessionGrant(event) {
    const target = String(event.target || '').trim()
    if (!target) throw new HttpError(400, '这次调用没有可用于临时授权的目标')
    let host
    try { host = new URL(target).hostname.toLowerCase() } catch { host = undefined }
    const existing = activeSessionGrants(event.sessionId).find(grant => grant.toolName === event.name && grant.host === host && grant.target === (host ? undefined : target))
    const grant = {
      id: existing?.id || randomUUID(), sessionId: event.sessionId, sessionTitle: event.sessionTitle, toolName: event.name,
      ...(host ? { host } : { target }), createdAt: existing?.createdAt || new Date().toISOString(),
      expiresAt: new Date(Date.now() + sessionGrantTtlMs).toISOString(),
    }
    sessionGrants.set(grant.id, grant)
    audit.policy({ change: existing ? 'session-grant-renewed' : 'session-grant-created', grant })
    return grant
  }

  ctx.on('tools/pre-execute', async (exec, next) => {
    await hydrated
    if (!config.enabled || !isMcpTool(exec?.name)) return next()
    const context = conversationContext(ctx, exec?.agent, exec?.callId)
    const decision = evaluateDecision(exec, { ...config, sessionGrants: activeSessionGrants(context.sessionId) })
    audit.decision(exec, decision, context)
    if (decision.kind === 'allow') return next()
    return { kind: decision.kind, reason: decision.reason }
  })

  ctx.effect(() => ctx.tools.guard(exec => {
    if (!config.enabled || !isMcpTool(exec?.name)) return undefined
    return hardGuard(exec, config)
  }), 'mcp-firewall: deny guard')

  ctx.on('tools/result', (exec, result) => {
    if (isMcpTool(exec?.name)) audit.result(exec, result, conversationContext(ctx, exec?.agent, exec?.callId))
  })

  ctx.on('approval/request', async (request, next) => {
    if (!isMcpTool(request?.toolName)) return next()
    return approvals.wait(request, conversationContext(ctx, request?.agent, request?.callId))
  }, { prepend: true })

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix', path: API_ROOT,
    handler: async (req, res) => {
      try {
        await hydrated
        const url = new URL(req.url ?? '/', 'http://dsh.internal')
        const method = String(req.method ?? 'GET').toUpperCase()
        const suffix = url.pathname.slice(API_ROOT.length) || '/'

        if (method === 'GET' && suffix === '/state') {
          respond(res, 200, state()); return
        }

        if (method === 'POST' && suffix === '/simulate') {
          const body = await readJsonBody(req)
          const name = String(body.name || '').trim()
          if (!isMcpTool(name)) throw new HttpError(400, '请输入完整的 MCP 工具名，例如 mcp__server__tool')
          const args = body.arguments == null ? {} : body.arguments
          if (!args || typeof args !== 'object' || Array.isArray(args)) throw new HttpError(400, '调用参数必须是 JSON 对象')
          const simulationConfig = { ...config, sessionGrants: body.sessionId ? activeSessionGrants(String(body.sessionId)) : [] }
          const decision = evaluateDecision({ name, arguments: args }, simulationConfig)
          respond(res, 200, {
            simulation: {
              name, decision, host: extractHost(args),
              argumentSummary: summarizeArguments(redactSensitive(args), 1200),
              note: '仅执行本地策略计算，没有调用 MCP Server，也不会写入审计。',
            },
          }); return
        }

        if (method === 'PATCH' && suffix === '/settings') {
          const body = await readJsonBody(req)
          await changePolicy(draft => {
            if (body.enabled !== undefined) draft.enabled = Boolean(body.enabled)
            if (body.defaultAction !== undefined) draft.defaultAction = normalizeAction(body.defaultAction)
            if (body.injectionAction !== undefined) draft.injectionAction = normalizeAction(body.injectionAction)
            if (body.approvalTimeoutEnabled !== undefined) draft.approvalTimeoutEnabled = Boolean(body.approvalTimeoutEnabled)
            if (body.approvalTimeoutMs !== undefined) draft.approvalTimeoutMs = normalizeApprovalTimeoutMs(body.approvalTimeoutMs)
            return { audit: next => ({ change: 'settings', value: publicConfig(next) }) }
          })
          approvals.setTimeoutMs(effectiveApprovalTimeout(config))
          respond(res, 200, state()); return
        }

        const toolMatch = /^\/tools\/(.+)$/.exec(suffix)
        if (method === 'PATCH' && toolMatch) {
          const name = decodeURIComponent(toolMatch[1])
          const body = await readJsonBody(req)
          await changePolicy(draft => ({
            config: setToolAction(draft, name, String(body.action ?? 'inherit')),
            audit: { change: 'tool-action', name, action: body.action },
          }))
          respond(res, 200, state()); return
        }

        if (method === 'POST' && suffix === '/rules') {
          const body = await readJsonBody(req)
          const action = normalizeAction(body.action)
          const tool = body.tool ? String(body.tool) : undefined
          const reason = body.reason ? String(body.reason).slice(0, 300) : undefined
          await changePolicy(draft => {
            if (body.type === 'host') {
              const host = normalizeHost(body.host)
              const candidate = { ...(tool ? { tool } : {}), host, action, ...(reason ? { reason } : {}) }
              if (!draft.hostRules.some(rule => rule.tool === candidate.tool && rule.host === host && rule.action === action)) {
                draft.hostRules = [...draft.hostRules, candidate]
              }
            } else if (body.type === 'argument') {
              const key = String(body.key ?? '$target').trim()
              const value = String(body.value ?? '').trim()
              if (!key || !value) throw new HttpError(400, '参数规则需要字段和值')
              const candidate = { ...(tool ? { tool } : {}), args: { [key]: value }, action, ...(reason ? { reason } : {}) }
              if (!draft.argRules.some(rule => rule.tool === candidate.tool && rule.action === action && rule.args?.[key] === value)) {
                draft.argRules = [...draft.argRules, candidate]
              }
            } else throw new HttpError(400, '规则类型必须是 host 或 argument')
            return { audit: { change: 'rule-created', rule: body } }
          })
          respond(res, 201, state()); return
        }

        const ruleMatch = /^\/rules\/(host|argument)\/(\d+)$/.exec(suffix)
        if (method === 'DELETE' && ruleMatch) {
          const key = ruleMatch[1] === 'host' ? 'hostRules' : 'argRules'
          const index = Number(ruleMatch[2])
          await changePolicy(draft => {
            if (!draft[key][index]) throw new HttpError(404, '规则不存在')
            const [removed] = draft[key].splice(index, 1)
            return { audit: { change: 'rule-deleted', rule: removed } }
          })
          respond(res, 200, state()); return
        }

        if (method === 'POST' && suffix === '/policy/repair') {
          const issues = analyzePolicy(config)
          const repairable = issues.filter(issue => issue.repairable)
          if (!repairable.length) throw new HttpError(409, '没有可自动清理的精确冲突')
          await changePolicy(draft => ({
            config: repairPolicyConflicts(draft, defaults),
            audit: { change: 'policy-conflicts-repaired', issueIds: repairable.map(issue => issue.id) },
          }))
          respond(res, 200, state()); return
        }

        const grantMatch = /^\/grants\/([^/]+)$/.exec(suffix)
        if (method === 'DELETE' && grantMatch) {
          const id = decodeURIComponent(grantMatch[1])
          const grant = sessionGrants.get(id)
          if (!grant) throw new HttpError(404, '临时授权不存在或已经过期')
          sessionGrants.delete(id)
          audit.policy({ change: 'session-grant-revoked', grant })
          respond(res, 200, state()); return
        }

        if (method === 'POST' && suffix === '/approvals') {
          const body = await readJsonBody(req)
          if (!['reject-all', 'reject-session'].includes(body.action)) throw new HttpError(400, '批量审核操作无效')
          const sessionId = body.action === 'reject-session' ? String(body.sessionId || '') : ''
          if (body.action === 'reject-session' && !sessionId) throw new HttpError(400, '缺少对话 ID')
          const entries = approvals.list().filter(item => !item.processing && (!sessionId || item.sessionId === sessionId))
          const results = await Promise.all(entries.map(item => approvals.decide(item.key, 'rejected', { action: body.action, source: 'dashboard' })))
          respond(res, 200, { ...state(), bulkResolved: results.filter(Boolean).length }); return
        }

        const approvalMatch = /^\/approvals\/([^/]+)$/.exec(suffix)
        if (method === 'POST' && approvalMatch) {
          const eventId = decodeURIComponent(approvalMatch[1])
          const body = await readJsonBody(req)
          const action = normalizeApprovalAction(body.action)
          const snapshot = state()
          const event = snapshot.events.find(item => item.id === eventId)
          if (!event) throw new HttpError(404, '找不到这次 MCP 调用')
          const key = approvalKey(event.sessionId, event.callId)
          if (!event.approvalPending || !approvals.get(key)) throw new HttpError(409, '这条审批已经结束或不再属于运行中的任务')

          const outcome = action === 'allow-once' || action === 'allow-session' ? 'allowed-once' : 'rejected'
          const decided = await approvals.decide(key, outcome, { action, source: 'dashboard' }, async () => {
            if (action === 'reject-tool') {
              await changePolicy(draft => ({
                config: setToolAction(draft, event.name, 'deny'),
                audit: { change: 'approval-reject-tool', name: event.name, sessionId: event.sessionId, callId: event.callId },
              }))
            } else if (action === 'reject-target') {
              await changePolicy(draft => ({
                audit: addTargetDenyRule(draft, event),
              }))
            }
          })
          if (!decided) throw new HttpError(409, '这条审批刚刚已由其他窗口处理')
          if (action === 'allow-session') addSessionGrant(event)
          respond(res, 200, state()); return
        }

        if (method === 'POST' && suffix === '/demo') {
          seedDemo(audit, approvals)
          await audit.flush()
          respond(res, 201, state()); return
        }

        if (method === 'POST' && suffix === '/analyze') {
          const body = await readJsonBody(req)
          const eventId = String(body.eventId || '')
          const snapshot = state()
          const event = snapshot.events.find(item => item.id === eventId)
          if (!event) throw new HttpError(404, '找不到这次 MCP 调用')
          let analysis = analysisCache.get(eventId)
          if (!analysis || body.refresh === true) {
            const relatedCalls = snapshot.events.filter(item => item.sessionId === event.sessionId).sort((a, b) => String(a.time).localeCompare(String(b.time)))
            analysis = await analyzeWithDsh(ctx, event, relatedCalls)
            analysisCache.set(eventId, analysis)
            if (analysisCache.size > 100) analysisCache.delete(analysisCache.keys().next().value)
          }
          respond(res, 200, { eventId, analysis })
          return
        }

        if (method === 'GET' && suffix === '/report') {
          const snapshot = state()
          respondText(res, 200, safetyReport(snapshot.events, snapshot.tools, config), `dsh-safety-report-${localDateStamp()}.md`)
          return
        }

        throw new HttpError(404, '接口不存在')
      } catch (error) {
        respond(res, Number(error?.status) || 500, { error: safeError(error) })
      }
    },
  }), 'mcp-firewall: HTTP API')

  ctx.effect(() => async () => {
    approvals.dispose()
    await persistConfig()
    await audit.flush()
  }, 'mcp-firewall: flush state')
}

function normalizeAction(value) {
  const action = String(value)
  if (!['allow', 'ask', 'deny'].includes(action)) throw new HttpError(400, '策略必须是 allow、ask 或 deny')
  return action
}

function normalizeApprovalAction(value) {
  const action = String(value)
  if (!['allow-once', 'allow-session', 'reject', 'reject-tool', 'reject-target'].includes(action)) throw new HttpError(400, '审批操作无效')
  return action
}

function normalizeApprovalTimeoutMs(value) {
  const timeout = Number(value)
  if (!Number.isFinite(timeout) || timeout < 60_000 || timeout > 7 * 24 * 60 * 60_000) {
    throw new HttpError(400, '审核超时时长必须在 1 分钟到 7 天之间')
  }
  return Math.round(timeout)
}

function effectiveApprovalTimeout(config) {
  return config?.approvalTimeoutEnabled === false ? 0 : Number(config?.approvalTimeoutMs) || 10 * 60_000
}

function addTargetDenyRule(config, event) {
  const target = String(event.target || '').trim()
  if (!target) throw new HttpError(400, '这次调用没有可用于创建规则的主机或目标')
  try {
    const host = new URL(target).hostname.toLowerCase()
    const rule = { tool: event.name, host, action: 'deny', reason: '用户在待审核调用中拒绝并阻止此主机' }
    if (!config.hostRules.some(item => item.tool === rule.tool && item.host === host && item.action === 'deny')) config.hostRules = [...config.hostRules, rule]
    return { change: 'approval-reject-host', rule, sessionId: event.sessionId, callId: event.callId }
  } catch {
    const rule = { tool: event.name, args: { $target: target }, action: 'deny', reason: '用户在待审核调用中拒绝并阻止此目标' }
    if (!config.argRules.some(item => item.tool === rule.tool && item.action === 'deny' && item.args?.$target === target)) config.argRules = [...config.argRules, rule]
    return { change: 'approval-reject-target', rule, sessionId: event.sessionId, callId: event.callId }
  }
}

function normalizeHost(value) {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) throw new HttpError(400, '主机不能为空')
  try { return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname } catch { throw new HttpError(400, '主机格式无效') }
}

function localDateStamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function seedDemo(audit, approvals) {
  const time = Date.now()
  const calls = [
    {
      sessionId: 'demo-security-review', sessionTitle: '发布前安全检查', cwd: 'D:\\workspace\\release', turn: 2, step: 1,
      name: 'mcp__safety_demo__write_file', arguments: { path: 'C:\\Windows\\System32\\drivers\\etc\\hosts', content: '[redacted]' },
      kind: 'deny', risk: 'denied', reason: '路径超出工作区边界，命中系统目录禁止写入规则', simulated: true,
    },
    {
      sessionId: 'demo-security-review', sessionTitle: '发布前安全检查', cwd: 'D:\\workspace\\release', turn: 2, step: 2,
      name: 'mcp__safety_demo__fetch', arguments: { url: 'https://unknown-upload.example/collect', body: '[redacted]' },
      kind: 'ask', risk: 'network', reason: '目标主机不在允许列表，需要仅本次批准', simulated: true,
    },
    {
      sessionId: 'demo-repository-triage', sessionTitle: '整理 GitHub Issue', cwd: 'D:\\workspace\\dsh', turn: 1, step: 1,
      name: 'mcp__safety_demo__list_issues', arguments: { owner: 'deepseek-ai', repo: 'DSH' },
      kind: 'allow', risk: 'read', reason: '只读调用通过防火墙检查', simulated: true,
    },
  ]
  for (const [index, row] of calls.entries()) {
    const callId = `demo-${randomUUID()}`
    const requestedAt = new Date(time - (calls.length - index) * 37_000).toISOString()
    const decisionAt = new Date(new Date(requestedAt).valueOf() + 180).toISOString()
    audit.record({
      phase: 'pre-execute', callId, rootCallId: `safety-demo-${row.sessionId}`, agentId: row.sessionId,
      requestedAt, time: decisionAt, ...row,
    })
    if (row.kind === 'ask') {
      void approvals.wait({
        toolName: row.name, callId, reason: row.reason, agent: { id: row.sessionId }, simulated: true,
      }, {
        sessionId: row.sessionId, sessionTitle: row.sessionTitle, cwd: row.cwd, turn: row.turn, step: row.step, simulated: true,
      })
    } else if (row.kind === 'allow') {
      audit.record({ phase: 'result', callId, agentId: row.sessionId, sessionId: row.sessionId, sessionTitle: row.sessionTitle, time: new Date(new Date(decisionAt).valueOf() + 420).toISOString(), isError: false, simulated: true })
    }
  }
}

function conversationContext(ctx, agent, callId) {
  const session = agent?.session
  const sessionId = String(session?.id || agent?.id || 'unknown-session')
  const call = session?.events?.findLast?.(event => event?.type === 'tool/call' && String(event?.data?.callId) === String(callId))
  let title
  try { title = session ? ctx.get?.('sessionTitle')?.get?.(session)?.title : undefined } catch { title = undefined }
  let route
  try { route = session?.requestHeader?.()?.config } catch { route = undefined }
  return {
    sessionId,
    sessionTitle: title || `未命名对话 · ${sessionId.slice(0, 8)}`,
    cwd: session?.header?.cwd,
    parentSession: session?.header?.parentSession,
    origin: session?.header?.origin || 'user',
    delegationDepth: session?.header?.delegationDepth,
    agentPreset: session?.header?.agentPreset,
    provider: route?.provider || agent?.options?.provider,
    model: route?.model || agent?.options?.model,
    turn: call?.data?.turn,
    step: call?.data?.step,
    requestedAt: call?.time ? new Date(call.time).toISOString() : undefined,
  }
}

export default { name: 'mcp-firewall', inject, apply }
