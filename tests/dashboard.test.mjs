import { test } from 'node:test'
import assert from 'node:assert/strict'

import { analyzePolicy, buildConversations, buildInventory, dashboardStats, decorateAudit, normalizeConfig, repairPolicyConflicts, safetyReport, setToolAction } from '../src/dashboard.mjs'
import { defaultConfig, redactSensitive } from '../src/shared.mjs'

test('审核超时策略默认开启并限制在可用范围', () => {
  const defaults = defaultConfig()
  assert.equal(normalizeConfig({}, defaults).approvalTimeoutMs, 10 * 60_000)
  assert.equal(normalizeConfig({}, defaults).approvalTimeoutEnabled, true)
  assert.equal(normalizeConfig({ approvalTimeoutEnabled: false, approvalTimeoutMs: 60_000 }, defaults).approvalTimeoutEnabled, false)
  assert.equal(normalizeConfig({ approvalTimeoutMs: 1000 }, defaults).approvalTimeoutMs, 10 * 60_000)
})

test('工具策略切换保持 allow/ask/deny 互斥', () => {
  const name = 'mcp__filesystem__write_file'
  let config = normalizeConfig({ ...defaultConfig(), allowTools: [name] })
  config = setToolAction(config, name, 'ask')
  assert.deepEqual(config.allowTools, [])
  assert.deepEqual(config.askTools, [name])
  assert.deepEqual(config.denyTools, [])

  config = setToolAction(config, name, 'inherit')
  assert.deepEqual(config.askTools, [])
})

test('权限地图按 MCP server 分组并识别能力', () => {
  const tools = buildInventory([
    { name: 'local_tool', description: 'ignored', parameters: { properties: {} } },
    { name: 'mcp__filesystem__write_file', description: 'Write a file', parameters: { properties: { path: {}, content: {} } } },
    { name: 'mcp__web__fetch', description: 'Fetch a URL', parameters: { properties: { url: {} } } },
  ], defaultConfig())
  assert.equal(tools.length, 2)
  assert.equal(tools[0].server, 'filesystem')
  assert.ok(tools[0].capabilities.includes('write'))
  assert.ok(tools[1].capabilities.includes('network'))
})

test('MCP Server 离线后仍可从真实审计恢复工具资产', () => {
  const tools = buildInventory([], defaultConfig(), [
    { phase: 'pre-execute', name: 'mcp__database__query', arguments: { query: 'select 1' } },
    { phase: 'pre-execute', name: 'mcp__safety_demo__fetch', simulated: true, arguments: { url: 'https://example.com' } },
  ])
  assert.equal(tools.length, 1)
  assert.equal(tools[0].name, 'mcp__database__query')
  assert.equal(tools[0].connected, false)
})

test('审计投影关联审批结果并脱敏秘密字段', () => {
  const callId = 'call-1'
  const rows = decorateAudit([
    { id: 'a', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId, name: 'mcp__web__fetch', kind: 'ask', risk: 'network', reason: '未知主机', arguments: { url: 'https://example.com', apiKey: 'secret-value' } },
    { id: 'b', phase: 'approval', time: '2026-08-24T00:00:01Z', callId, outcome: 'allowed-once' },
    { id: 'c', phase: 'result', time: '2026-08-24T00:00:02Z', callId, isError: false },
  ])
  assert.equal(rows[0].approval, 'allowed-once')
  assert.equal(rows[0].result, 'success')
  assert.match(rows[0].argumentSummary, /\[redacted\]/)
  assert.doesNotMatch(rows[0].argumentSummary, /secret-value/)
  assert.deepEqual(rows[0].timeline.map(item => item.phase), ['request', 'decision', 'approval', 'result'])
})

test('审计按具体对话聚合并兼容旧 agentId', () => {
  const events = decorateAudit([
    { id: 'a', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId: '1', agentId: 'session-legacy-123', name: 'mcp__fs__read', kind: 'allow', risk: 'read', arguments: { path: 'README.md' } },
    { id: 'b', phase: 'pre-execute', time: '2026-08-24T00:01:00Z', callId: '2', sessionId: 'session-release', sessionTitle: '发布前检查', cwd: 'D:\\repo', turn: 2, step: 3, name: 'mcp__fs__write', kind: 'deny', risk: 'denied', arguments: { path: 'C:\\Windows\\hosts' } },
  ])
  const conversations = buildConversations(events)
  assert.equal(conversations.length, 2)
  assert.equal(events.find(item => item.id === 'a').sessionId, 'session-legacy-123')
  assert.equal(conversations.find(item => item.id === 'session-release').title, '发布前检查')
  assert.equal(conversations.find(item => item.id === 'session-release').denied, 1)
})

test('人工拒绝不会被误报成 MCP Server 执行失败', () => {
  const rows = decorateAudit([
    { id: 'a', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId: 'reject-1', sessionId: 's1', name: 'mcp__web__fetch', kind: 'ask', risk: 'network', reason: '未知主机', arguments: { url: 'https://example.com' } },
    { id: 'b', phase: 'approval', time: '2026-08-24T00:00:01Z', callId: 'reject-1', sessionId: 's1', outcome: 'rejected', approvalAction: 'reject-tool' },
    { id: 'c', phase: 'result', time: '2026-08-24T00:00:02Z', callId: 'reject-1', sessionId: 's1', isError: true },
  ])
  assert.equal(rows[0].result, 'blocked')
  assert.equal(rows[0].approvalAction, 'reject-tool')
  assert.equal(rows[0].timeline[2].label, '用户拒绝并阻止此工具')
  assert.equal(rows[0].timeline[3].label, '拒绝结果已返回 Agent')
})

test('相同 callId 在不同对话中不会串联审批结果', () => {
  const rows = decorateAudit([
    { id: 'a1', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId: 'same', sessionId: 's1', name: 'mcp__web__fetch', kind: 'ask', risk: 'network', arguments: { url: 'https://one.example' } },
    { id: 'a2', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId: 'same', sessionId: 's2', name: 'mcp__web__fetch', kind: 'ask', risk: 'network', arguments: { url: 'https://two.example' } },
    { id: 'b', phase: 'approval', time: '2026-08-24T00:00:01Z', callId: 'same', sessionId: 's2', outcome: 'rejected' },
  ])
  assert.equal(rows.find(row => row.sessionId === 's1').approval, null)
  assert.equal(rows.find(row => row.sessionId === 's2').approval, 'rejected')
})

test('安全报告包含风险目标但不包含敏感参数', () => {
  const events = [{ kind: 'deny', name: 'mcp__fs__write', time: '2026-08-24T00:00:00Z', risk: 'denied', target: '/outside', reason: '越界', argumentSummary: '{"token":"[redacted]"}', approval: 'rejected', approvalAction: 'reject-tool', resolutionSource: 'dashboard' }]
  const report = safetyReport(events, [], defaultConfig())
  assert.match(report, /\/outside/)
  assert.match(report, /Policy snapshot/)
  assert.match(report, /Approval action: reject-tool/)
  assert.match(report, /Resolution source: dashboard/)
  assert.doesNotMatch(report, /secret-value/)
})

test('安全演练不污染真实指标和正式报告', () => {
  const events = [
    { kind: 'deny', name: 'mcp__real__write', sessionId: 'real', time: '2026-08-24T00:00:00Z', target: '/outside', risk: 'denied', reason: '越界' },
    { kind: 'deny', name: 'mcp__safety_demo__write', sessionId: 'demo', time: '2026-08-24T00:00:01Z', target: '/demo-only', risk: 'denied', reason: '演练', simulated: true },
  ]
  const stats = dashboardStats(events, [])
  assert.equal(stats.denied, 1)
  assert.equal(stats.simulated, 1)
  assert.equal(stats.conversations, 1)
  const report = safetyReport(events, [], defaultConfig())
  assert.match(report, /Simulated calls excluded: 1/)
  assert.doesNotMatch(report, /demo-only/)
})

test('持久化前同时脱敏字段型和命令行型凭据', () => {
  const value = redactSensitive({
    apiKey: 'top-secret',
    command: 'curl -H "Authorization: Bearer abc.def" https://example.com?token=visible',
  })
  assert.equal(value.apiKey, '[redacted]')
  assert.doesNotMatch(value.command, /abc\.def|token=visible/)
  assert.match(value.command, /\[redacted\]/)
})

test('Windows 路径不会被当成 URL，重复规则会去重', () => {
  const events = decorateAudit([{ id: 'x', phase: 'pre-execute', time: '2026-08-24T00:00:00Z', callId: 'x', name: 'mcp__fs__write', kind: 'deny', risk: 'denied', arguments: { path: 'C:\\Windows\\System32\\hosts' } }])
  assert.equal(events[0].target, 'C:\\Windows\\System32\\hosts')
  const rule = { tool: 'mcp__web__fetch', host: 'example.com', action: 'deny' }
  const config = normalizeConfig({ ...defaultConfig(), hostRules: [rule, { ...rule }] })
  assert.equal(config.hostRules.length, 1)
})

test('策略诊断发现同一边界的矛盾并按安全优先级修复', () => {
  const config = normalizeConfig({
    ...defaultConfig(),
    allowTools: ['mcp__web__fetch'],
    denyTools: ['mcp__web__fetch'],
    hostRules: [
      { tool: 'mcp__web__fetch', host: 'example.com', action: 'allow' },
      { tool: 'mcp__web__fetch', host: 'example.com', action: 'deny' },
    ],
  })
  const issues = analyzePolicy(config)
  assert.equal(issues.filter(issue => issue.repairable).length, 2)
  assert.ok(issues.some(issue => issue.kind === 'shadowed'))
  const repaired = repairPolicyConflicts(config, defaultConfig())
  assert.deepEqual(repaired.allowTools, [])
  assert.deepEqual(repaired.denyTools, ['mcp__web__fetch'])
  assert.equal(repaired.hostRules.length, 1)
  assert.equal(repaired.hostRules[0].action, 'deny')
})
