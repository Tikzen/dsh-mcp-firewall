import { classifyRisk, collectTargets, extractHost, parseMcpName, redactSensitive, summarizeArguments } from './shared.mjs'

const TOOL_ACTIONS = new Set(['allow', 'ask', 'deny'])

export function normalizeConfig(input = {}, defaults = {}) {
  const merged = { ...defaults, ...input }
  merged.allowTools = uniqueStrings(merged.allowTools)
  merged.askTools = uniqueStrings(merged.askTools)
  merged.denyTools = uniqueStrings(merged.denyTools)
  merged.argRules = normalizeRules(merged.argRules, 'args')
  merged.hostRules = normalizeRules(merged.hostRules, 'host')
  if (!TOOL_ACTIONS.has(merged.defaultAction)) merged.defaultAction = 'allow'
  if (!TOOL_ACTIONS.has(merged.injectionAction)) merged.injectionAction = 'ask'
  merged.enabled = merged.enabled !== false
  merged.approvalTimeoutEnabled = merged.approvalTimeoutEnabled !== false
  const timeout = Number(merged.approvalTimeoutMs)
  const fallbackTimeout = Number(defaults.approvalTimeoutMs) || 10 * 60_000
  merged.approvalTimeoutMs = Number.isFinite(timeout) && timeout >= 60_000 && timeout <= 7 * 24 * 60 * 60_000
    ? Math.round(timeout)
    : fallbackTimeout
  return merged
}

export function setToolAction(config, name, action) {
  if (!String(name).startsWith('mcp__')) throw new Error('只能调整 MCP 工具')
  if (![...TOOL_ACTIONS, 'inherit'].includes(action)) throw new Error('无效的工具策略')
  const next = normalizeConfig(config)
  for (const key of ['allowTools', 'askTools', 'denyTools']) next[key] = next[key].filter(item => item !== name)
  if (action !== 'inherit') next[action === 'deny' ? 'denyTools' : `${action}Tools`].push(name)
  return next
}

export function analyzePolicy(config) {
  const issues = []
  const toolGroups = new Map()
  for (const [action, key] of [['allow', 'allowTools'], ['ask', 'askTools'], ['deny', 'denyTools']]) {
    for (const name of config?.[key] ?? []) addAction(toolGroups, String(name), action)
  }
  for (const [name, actions] of toolGroups) {
    if (actions.size < 2) continue
    const winner = highestAction(actions)
    issues.push({
      id: `tool:${name}`, severity: 'high', kind: 'conflict', repairable: true,
      title: `工具 ${name} 同时配置了多种策略`,
      detail: `当前按安全优先级实际执行“${actionText(winner)}”，其余配置不会生效。`,
    })
  }

  collectRuleConflicts(config?.hostRules, rule => `${rule.tool || '*'}|${String(rule.host || '').toLowerCase()}`, '主机', issues)
  collectRuleConflicts(config?.argRules, rule => `${rule.tool || '*'}|${stableJson(rule.args || {})}`, '参数', issues)

  for (const [type, rules] of [['主机', config?.hostRules], ['参数', config?.argRules]]) {
    for (const rule of rules ?? []) {
      if (rule.action === 'deny' || !rule.tool || !matches(rule.tool, config?.denyTools)) continue
      const identity = type === '主机' ? rule.host : stableJson(rule.args || {})
      issues.push({
        id: `shadowed:${type}:${rule.tool}:${identity}:${rule.action}`, severity: 'medium', kind: 'shadowed', repairable: false,
        title: `${type}规则被工具级阻止遮蔽`,
        detail: `${rule.tool} 已被整体阻止，这条“${actionText(rule.action)}”边界目前不会生效；保留它可用于日后恢复工具策略。`,
      })
    }
  }
  return issues
}

export function repairPolicyConflicts(config, defaults = {}) {
  const next = normalizeConfig(structuredClone(config), defaults)
  const toolWinner = new Map()
  for (const [action, key] of [['allow', 'allowTools'], ['ask', 'askTools'], ['deny', 'denyTools']]) {
    for (const name of next[key]) {
      const current = toolWinner.get(name)
      if (!current || actionRank(action) > actionRank(current)) toolWinner.set(name, action)
    }
  }
  next.allowTools = next.allowTools.filter(name => toolWinner.get(name) === 'allow')
  next.askTools = next.askTools.filter(name => toolWinner.get(name) === 'ask')
  next.denyTools = next.denyTools.filter(name => toolWinner.get(name) === 'deny')
  next.hostRules = repairRuleList(next.hostRules, rule => `${rule.tool || '*'}|${String(rule.host || '').toLowerCase()}`)
  next.argRules = repairRuleList(next.argRules, rule => `${rule.tool || '*'}|${stableJson(rule.args || {})}`)
  return normalizeConfig(next, defaults)
}

export function toolAction(config, name) {
  if (matches(name, config?.denyTools)) return 'deny'
  if (matches(name, config?.allowTools)) return 'allow'
  if (matches(name, config?.askTools)) return 'ask'
  return 'inherit'
}

export function buildInventory(schemas, config, observed = []) {
  const live = (schemas ?? []).filter(schema => String(schema?.name ?? '').startsWith('mcp__')).map(schema => ({ ...schema, connected: true }))
  const seen = new Set(live.map(schema => schema.name))
  const historical = []
  for (const row of observed ?? []) {
    if (row?.simulated || row?.phase !== 'pre-execute' || !String(row?.name ?? '').startsWith('mcp__') || seen.has(row.name)) continue
    seen.add(row.name)
    historical.push({
      name: row.name, description: '最近审计中出现，当前 MCP Server 未连接', connected: false,
      parameters: { properties: Object.fromEntries(Object.keys(row.arguments || {}).map(key => [key, {}])) },
      observedArguments: row.arguments,
    })
  }
  return [...live, ...historical].map(schema => {
    const parsed = parseMcpName(schema.name) ?? { server: '', tool: schema.name }
    const risk = classifyRisk(schema.name, schema.observedArguments || { description: schema.description }, config?.riskPatterns)
    return {
      name: schema.name,
      server: parsed.server || 'unknown',
      tool: parsed.tool,
      description: schema.description || '',
      connected: schema.connected !== false,
      risk,
      action: toolAction(config, schema.name),
      effectiveAction: effectiveToolAction(config, schema.name, risk),
      capabilities: inferCapabilities(schema),
      parameterKeys: Object.keys(schema?.parameters?.properties ?? {}),
    }
  }).sort((a, b) => a.server.localeCompare(b.server) || riskRank(b.risk) - riskRank(a.risk) || a.tool.localeCompare(b.tool))
}

export function decorateAudit(records) {
  const approvals = new Map()
  const results = new Map()
  for (const row of records ?? []) {
    if (row.phase === 'approval' && row.callId) approvals.set(auditCallKey(row), row)
    if (row.phase === 'result' && row.callId) results.set(auditCallKey(row), row)
  }
  return (records ?? []).filter(row => row.phase === 'pre-execute').map(row => {
    const approval = approvals.get(auditCallKey(row))
    const result = results.get(auditCallKey(row))
    const sessionId = String(row.sessionId || row.agentId || 'unknown-session')
    const sessionTitle = row.sessionTitle || (sessionId === 'demo-agent' ? '安全演练' : `未命名对话 · ${shortId(sessionId)}`)
    const dispatched = row.kind === 'allow' || approval?.outcome === 'allowed-once'
    const resultState = result ? (!dispatched ? 'blocked' : result.isError ? 'error' : 'success') : null
    const timeline = [
      { phase: 'request', time: row.requestedAt || row.time, label: 'Agent 发起 MCP 调用', status: 'neutral' },
      { phase: 'decision', time: row.time, label: decisionLabel(row.kind), status: row.kind },
      ...(approval ? [{ phase: 'approval', time: approval.time, label: approvalLabel(approval.outcome, approval.approvalAction), status: approval.outcome === 'allowed-once' ? 'allow' : 'deny' }] : []),
      ...(result ? [{ phase: 'result', time: result.time, label: !dispatched ? '拒绝结果已返回 Agent' : result.isError ? 'MCP 执行失败' : 'MCP 返回成功', status: result.isError ? 'deny' : 'allow' }] : []),
    ].sort((a, b) => String(a.time).localeCompare(String(b.time)))
    return {
      ...row,
      sessionId,
      sessionTitle,
      server: parseMcpName(row.name)?.server || 'unknown',
      tool: parseMcpName(row.name)?.tool || row.name,
      target: extractTarget(row.arguments),
      argumentSummary: summarizeArguments(redactSensitive(row.arguments), 600),
      approval: approval?.outcome ?? null,
      approvalReason: approval?.reason ?? null,
      approvalAction: approval?.approvalAction ?? null,
      resolutionSource: approval?.resolutionSource ?? null,
      result: resultState,
      errorName: result?.errorName ?? null,
      resultSummary: result?.resultSummary ?? null,
      timeline,
      violation: row.kind === 'deny' || row.risk === 'injection' || Boolean(result?.isError),
    }
  }).sort((a, b) => String(b.time).localeCompare(String(a.time)))
}

export function buildConversations(events) {
  const groups = new Map()
  for (const event of events ?? []) {
    const id = event.sessionId || 'unknown-session'
    let group = groups.get(id)
    if (!group) {
      group = {
        id,
        title: event.sessionTitle || `未命名对话 · ${shortId(id)}`,
        cwd: event.cwd || '',
        agentPreset: event.agentPreset || '',
        provider: event.provider || '',
        model: event.model || '',
        origin: event.origin || 'user',
        firstAt: event.time,
        lastAt: event.time,
        callCount: 0,
        denied: 0,
        asked: 0,
        errors: 0,
        eventIds: [],
      }
      groups.set(id, group)
    }
    group.title = event.sessionTitle || group.title
    group.cwd = event.cwd || group.cwd
    group.agentPreset = event.agentPreset || group.agentPreset
    group.provider = event.provider || group.provider
    group.model = event.model || group.model
    group.firstAt = String(event.time) < String(group.firstAt) ? event.time : group.firstAt
    group.lastAt = String(event.time) > String(group.lastAt) ? event.time : group.lastAt
    group.callCount += 1
    group.denied += event.kind === 'deny' ? 1 : 0
    group.asked += event.kind === 'ask' ? 1 : 0
    group.errors += event.result === 'error' ? 1 : 0
    group.eventIds.push(event.id)
  }
  return [...groups.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

export function dashboardStats(events, tools) {
  const simulated = events.filter(row => row.simulated).length
  const recent = events.filter(row => !row.simulated).slice(0, 500)
  return {
    tools: tools.length,
    connected: tools.filter(tool => tool.connected !== false).length,
    servers: new Set(tools.map(tool => tool.server)).size,
    allowed: recent.filter(row => row.kind === 'allow').length,
    asked: recent.filter(row => row.kind === 'ask').length,
    denied: recent.filter(row => row.kind === 'deny').length,
    unresolved: recent.filter(row => row.approvalPending === true).length,
    conversations: new Set(recent.map(row => row.sessionId)).size,
    simulated,
  }
}

export function safetyReport(events, tools, config) {
  const stats = dashboardStats(events, tools)
  const lines = [
    '# DSH Agent Safety Report', '',
    `Generated: ${new Date().toISOString()}`, '',
    '## Overview', '',
    `- MCP servers: ${stats.servers}`,
    `- MCP tools: ${stats.tools}`,
    `- Allowed calls: ${stats.allowed}`,
    `- Approval requests: ${stats.asked}`,
    `- Pending approvals: ${stats.unresolved}`,
    `- Simulated calls excluded: ${stats.simulated}`,
    `- Blocked calls: ${stats.denied}`,
    `- Conversations: ${stats.conversations}`,
    `- Default action: ${config.defaultAction}`,
    '', '## High-risk activity', '',
  ]
  const risky = events.filter(row => !row.simulated && row.kind !== 'allow').slice(0, 100)
  if (!risky.length) lines.push('No approval or blocked events recorded.')
  for (const row of risky) {
    lines.push(`### ${row.kind.toUpperCase()} · ${row.name}`)
    lines.push(`- Conversation: ${row.sessionTitle || 'unnamed'} (${row.sessionId || 'unknown'})`)
    if (row.turn != null || row.step != null) lines.push(`- Turn / step: ${row.turn ?? '?'} / ${row.step ?? '?'}`)
    lines.push(`- Time: ${row.time}`)
    lines.push(`- Risk: ${row.risk}`)
    if (row.policySource) lines.push(`- Policy source: ${row.policySource}`)
    lines.push(`- Target: ${row.target || 'not declared'}`)
    lines.push(`- Reason: ${row.reason || 'none'}`)
    if (row.approvalPending) lines.push('- Approval: pending')
    if (row.approval) lines.push(`- Approval: ${row.approval}`)
    if (row.approvalAction) lines.push(`- Approval action: ${row.approvalAction}`)
    if (row.resolutionSource) lines.push(`- Resolution source: ${row.resolutionSource}`)
    if (row.result) lines.push(`- Result: ${row.result}`)
    lines.push('')
  }
  lines.push('## Policy snapshot', '')
  lines.push('```json', JSON.stringify({
    enabled: config.enabled,
    defaultAction: config.defaultAction,
    injectionAction: config.injectionAction,
    allowTools: config.allowTools,
    askTools: config.askTools,
    denyTools: config.denyTools,
    argRules: config.argRules,
    hostRules: config.hostRules,
  }, null, 2), '```', '')
  lines.push('Sensitive argument values are redacted in dashboard and report projections.')
  return lines.join('\n')
}

function decisionLabel(kind) {
  return kind === 'deny' ? '防火墙判定越权并阻止' : kind === 'ask' ? '防火墙要求人工审批' : '防火墙策略放行'
}

function approvalLabel(outcome, action) {
  if (action === 'allow-session') return '用户允许本对话访问相同目标'
  if (outcome === 'allowed-once') return '用户仅批准本次'
  if (action === 'timeout') return '等待审批超时，系统自动拒绝'
  if (action === 'reject-tool') return '用户拒绝并阻止此工具'
  if (action === 'reject-target') return '用户拒绝并阻止同类目标'
  if (action === 'reject-session') return '用户批量拒绝此对话的待审调用'
  if (action === 'reject-all') return '用户紧急拒绝全部待审调用'
  if (outcome === 'rejected') return '用户拒绝调用'
  if (outcome === 'cancelled') return '审批已取消'
  if (outcome === 'unavailable') return '审批通道不可用，默认拒绝'
  return `审批结果：${outcome || '未知'}`
}

function shortId(value) {
  const text = String(value || '')
  return text.length > 10 ? `${text.slice(0, 8)}…` : text
}

function collectRuleConflicts(rules, identity, label, issues) {
  const groups = new Map()
  for (const rule of rules ?? []) addAction(groups, identity(rule), rule.action)
  for (const [key, actions] of groups) {
    if (actions.size < 2) continue
    const winner = highestAction(actions)
    issues.push({
      id: `rule:${label}:${key}`, severity: 'high', kind: 'conflict', repairable: true,
      title: `${label}边界同时配置了多种策略`,
      detail: `${key.replace('|', ' · ')} 当前实际执行“${actionText(winner)}”；可清理不会生效的重复策略。`,
    })
  }
}

function repairRuleList(rules, identity) {
  const winners = new Map()
  for (const rule of rules ?? []) {
    const key = identity(rule)
    const current = winners.get(key)
    if (!current || actionRank(rule.action) > actionRank(current.action)) winners.set(key, rule)
  }
  return [...winners.values()]
}

function addAction(groups, key, action) {
  if (!groups.has(key)) groups.set(key, new Set())
  groups.get(key).add(action)
}

function highestAction(actions) {
  return [...actions].sort((a, b) => actionRank(b) - actionRank(a))[0]
}

function actionRank(action) {
  return ({ allow: 1, ask: 2, deny: 3 })[action] || 0
}

function actionText(action) {
  return ({ allow: '允许', ask: '询问', deny: '阻止' })[action] || action
}

function stableJson(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return JSON.stringify(value)
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
}

function auditCallKey(row) {
  return `${String(row?.sessionId || row?.agentId || '')}\u0000${String(row?.callId || '')}`
}

function inferCapabilities(schema) {
  const text = `${schema.name} ${schema.description || ''}`.toLowerCase()
  const keys = Object.keys(schema?.parameters?.properties ?? {}).map(value => value.toLowerCase())
  const output = []
  if (/read|list|search|find|get|inspect|view/.test(text)) output.push('read')
  if (/write|edit|create|update|patch|move|copy|upload/.test(text)) output.push('write')
  if (/delete|remove|rm|drop|truncate/.test(text)) output.push('delete')
  if (/shell|bash|exec|command|run/.test(text) || keys.some(key => /command|cmd|script/.test(key))) output.push('execute')
  if (/web|http|fetch|request|download|upload|network/.test(text) || keys.some(key => /url|host|endpoint|uri/.test(key))) output.push('network')
  return output.length ? [...new Set(output)] : ['read']
}

function extractTarget(args) {
  const target = collectTargets(args)[0]
  return target ? sanitizeTarget(redactSensitive(target)).slice(0, 240) : ''
}

function sanitizeTarget(value) {
  if (typeof value !== 'string') return String(value ?? '')
  if (!/^https?:\/\//i.test(value)) return value
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    return value
  }
}

function effectiveToolAction(config, name, risk) {
  const explicit = toolAction(config, name)
  if (explicit !== 'inherit') return explicit
  if (risk === 'destructive' || risk === 'network') return 'ask'
  return config?.defaultAction || 'allow'
}

function normalizeRules(list, requiredKey) {
  if (!Array.isArray(list)) return []
  const unique = new Map()
  for (const rule of list) {
    if (!rule || !TOOL_ACTIONS.has(rule.action) || rule[requiredKey] == null) continue
    const normalized = { ...rule }
    const identity = JSON.stringify([normalized.tool || '', normalized.action, normalized.host || '', normalized.args || {}])
    if (!unique.has(identity)) unique.set(identity, normalized)
  }
  return [...unique.values()]
}

function uniqueStrings(list) {
  return [...new Set((Array.isArray(list) ? list : []).map(String).filter(Boolean))]
}

function matches(name, patterns) {
  return (patterns ?? []).some(pattern => pattern === name || (String(pattern).endsWith('*') && name.startsWith(String(pattern).slice(0, -1))))
}

function riskRank(risk) {
  return ({ denied: 5, injection: 4, destructive: 3, network: 2, read: 1, safe: 0 })[risk] ?? 0
}
