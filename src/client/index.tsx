import { useCallback, useEffect, useMemo, useState } from 'react'
import { FIREWALL_CSS } from './styles'

const API_ROOT = '/api/plugins/dsh-mcp-firewall'
const OPEN_EVENT = 'dsh-mcp-firewall:open'
type Action = 'allow' | 'ask' | 'deny'
type View = 'overview' | 'review' | 'policy' | 'audit'

interface ToolItem {
  name: string; server: string; tool: string; description: string; risk: string
  action: Action | 'inherit'; effectiveAction: Action; capabilities: string[]; parameterKeys: string[]; connected: boolean
}
interface AuditEvent {
  id: string; time: string; name: string; server: string; tool: string; kind: Action; risk: string
  reason: string; target: string; argumentSummary: string; approval: string | null; result: string | null; simulated?: boolean
  sessionId: string; sessionTitle: string; cwd?: string; parentSession?: string; origin?: string; delegationDepth?: number
  agentPreset?: string; provider?: string; model?: string; turn?: number; step?: number; rootCallId?: string; callId?: string
  requestedAt?: string; errorName?: string | null; resultSummary?: string | null; violation: boolean
  approvalAction?: string | null; approvalPending?: boolean; approvalExpiresAt?: string | null; resolutionSource?: string | null
  approvalProcessing?: boolean; approvalProcessingAction?: string | null; policySource?: string
  timeline: Array<{ phase: string; time: string; label: string; status: string }>
}
interface Conversation {
  id: string; title: string; cwd: string; agentPreset: string; provider: string; model: string; origin: string
  firstAt: string; lastAt: string; callCount: number; denied: number; asked: number; errors: number; eventIds: string[]
}
interface AnalysisResult {
  source: 'ai' | 'local'; model?: string; note?: string; summary: string; intent: string; finding: string; risk: string; nextSteps: string[]
}
interface PolicyIssue { id: string; severity: string; kind: string; repairable: boolean; title: string; detail: string }
interface SessionGrant { id: string; sessionId: string; sessionTitle: string; toolName: string; host?: string; target?: string; createdAt: string; expiresAt: string }
interface SimulationResult { name: string; decision: { kind: Action; reason: string; risk: string; source: string }; host?: string | null; argumentSummary: string; note: string }
interface FirewallState {
  config: { enabled: boolean; defaultAction: Action; injectionAction: Action; approvalTimeoutEnabled: boolean; approvalTimeoutMs: number; allowTools: string[]; askTools: string[]; denyTools: string[]; argRules: any[]; hostRules: any[] }
  tools: ToolItem[]; events: AuditEvent[]; conversations: Conversation[]; grants: SessionGrant[]; policyIssues: PolicyIssue[]
  stats: { tools: number; connected: number; servers: number; allowed: number; asked: number; denied: number; unresolved: number; conversations: number; simulated: number }
  meta: { stateDir: string; auditFile: string; version: string; approvalTimeoutMs?: number; sessionGrantTtlMs?: number }
}
type Mutate = (work: () => Promise<FirewallState>) => Promise<boolean>

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers || {}) } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `请求失败 (${response.status})`)
  return body
}

function ActionControl({ value, includeInherit = false, onChange, disabled = false }: { value: string; includeInherit?: boolean; onChange: (value: any) => void; disabled?: boolean }) {
  const options = [...(includeInherit ? [{ value: 'inherit', label: '自动' }] : []), { value: 'allow', label: '允许' }, { value: 'ask', label: '询问' }, { value: 'deny', label: '阻止' }]
  return <div className="fw-segment">{options.map(option => <button key={option.value} type="button" data-action={option.value} data-selected={value === option.value} disabled={disabled} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
}

function Pill({ kind, children }: { kind: string; children?: any }) {
  const labels: Record<string, string> = { allow: '已允许', ask: '待审核', deny: '已阻止' }
  return <span className="fw-pill" data-kind={kind}>{children || labels[kind] || kind}</span>
}

function EventPill({ event }: { event: AuditEvent }) {
  if (event.kind !== 'ask') return <Pill kind={event.kind} />
  if (event.approvalProcessing) return <Pill kind="ask">处理中</Pill>
  if (event.approvalPending) return <Pill kind="ask">待审核</Pill>
  if (event.approval === 'allowed-once') return <Pill kind="allow">已批准</Pill>
  if (event.approval) return <Pill kind="deny">已拒绝</Pill>
  return <Pill kind="inactive">已失效</Pill>
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function groupTools(tools: ToolItem[]) {
  const groups = new Map<string, ToolItem[]>()
  for (const tool of tools) groups.set(tool.server, [...(groups.get(tool.server) || []), tool])
  return [...groups.entries()]
}

function Overview({ state, mutate, onReview }: { state: FirewallState; mutate: Mutate; onReview: (event?: AuditEvent) => void }) {
  const latest = state.events.find(event => event.approvalPending) || state.events.find(event => event.kind !== 'allow')
  const groups = groupTools(state.tools)
  const setAction = (tool: ToolItem, action: string) => mutate(() => api(`/tools/${encodeURIComponent(tool.name)}`, { method: 'PATCH', body: JSON.stringify({ action }) }))
  return <>
    <div className="fw-stats">
      <div className="fw-stat"><span className="fw-stat-label">工具资产</span><strong>{state.stats.tools}</strong><small>{state.stats.connected} 个在线 · {state.stats.simulated} 次演练</small></div>
      <div className="fw-stat" data-tone="good"><span className="fw-stat-label">已放行</span><strong>{state.stats.allowed}</strong><small>最近 500 次调用</small></div>
      <div className="fw-stat" data-tone="warn"><span className="fw-stat-label">需要审核</span><strong>{state.stats.asked}</strong><small>{state.stats.unresolved} 条待处理</small></div>
      <div className="fw-stat" data-tone="danger"><span className="fw-stat-label">越权阻止</span><strong>{state.stats.denied}</strong><small>策略已自动执行</small></div>
    </div>
    <section className="fw-band">
      <header className="fw-band-header"><h3>最近风险</h3><p>最需要你注意的一次工具调用</p></header>
      {latest ? <div className="fw-alert-row">
        <EventPill event={latest} />
        <div className="fw-alert-target"><strong>{latest.target || latest.name}</strong><p>{latest.sessionTitle} · {latest.reason}</p></div>
        <button className="fw-button" type="button" onClick={() => onReview(latest)}>定位越权</button>
      </div> : <Empty title="暂时没有风险事件" text="真实 MCP 调用会在这里显示；也可以运行一次安全演练检查界面。" />}
    </section>
    <section className="fw-band">
      <header className="fw-band-header"><h3>权限地图</h3><p>直接调整每个工具的执行策略</p><span className="fw-spacer" /><span className="fw-pill" data-kind={state.config.enabled ? 'allow' : 'deny'}>{state.config.enabled ? '防护中' : '已停用'}</span></header>
      {groups.length ? <table className="fw-inventory"><thead><tr><th className="fw-tool-cell">工具</th><th>能力范围</th><th>风险</th><th>策略</th></tr></thead><tbody>
        {groups.map(([server, tools]) => <FragmentGroup key={server} server={server} tools={tools} setAction={setAction} />)}
      </tbody></table> : <Empty title="还没有发现 MCP 工具" text="连接 MCP Server 后会自动生成权限地图。当前可先运行安全演练体验越权定位。" />}
    </section>
  </>
}

function FragmentGroup({ server, tools, setAction }: { server: string; tools: ToolItem[]; setAction: (tool: ToolItem, action: string) => void }) {
  return <>{<tr className="fw-server-row"><td colSpan={4}>{server} · {tools.length} 个工具</td></tr>}{tools.map(tool => <tr key={tool.name}>
    <td className="fw-tool-cell"><span className="fw-tool-name">{tool.tool}{!tool.connected ? <span className="fw-offline">离线</span> : null}</span><span className="fw-tool-desc">{tool.description || tool.name}</span></td>
    <td><div className="fw-cap-list">{tool.capabilities.map(cap => <span key={cap} className="fw-cap" data-cap={cap}>{cap}</span>)}</div></td>
    <td><Pill kind={tool.risk === 'read' ? 'allow' : tool.risk === 'network' ? 'ask' : 'deny'}>{riskLabel(tool.risk)}</Pill></td>
    <td><ActionControl value={tool.action} includeInherit onChange={action => setAction(tool, action)} /></td>
  </tr>)}</>
}

function Review({ state, initial, mutate }: { state: FirewallState; initial: AuditEvent | null; mutate: Mutate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sessionFilter, setSessionFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(initial?.id || state.events.find(event => event.approvalPending)?.id || state.events[0]?.id || null)
  const [feedback, setFeedback] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [decisionBusy, setDecisionBusy] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  useEffect(() => { if (initial?.id) setSelectedId(initial.id) }, [initial?.id])
  useEffect(() => { setFeedback(''); setAnalysis(null) }, [selectedId])
  useEffect(() => {
    if (!bulkConfirm) return
    const timer = window.setTimeout(() => setBulkConfirm(null), 5000)
    return () => window.clearTimeout(timer)
  }, [bulkConfirm])
  const events = useMemo(() => state.events.filter(event => {
    if (filter === 'ask' && !event.approvalPending) return false
    if (filter !== 'all' && filter !== 'ask' && event.kind !== filter) return false
    if (sessionFilter !== 'all' && event.sessionId !== sessionFilter) return false
    const text = `${event.name} ${event.target} ${event.reason} ${event.sessionTitle} ${event.sessionId}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  }).sort((a, b) => Number(Boolean(b.approvalPending)) - Number(Boolean(a.approvalPending)) || String(b.time).localeCompare(String(a.time))), [state.events, filter, sessionFilter, query])
  const selected = events.find(event => event.id === selectedId) || events[0]
  const sessionEvents = useMemo(() => selected ? state.events.filter(event => event.sessionId === selected.sessionId).sort((a, b) => String(a.time).localeCompare(String(b.time))) : [], [state.events, selected?.sessionId])
  const selectedConversation = selected ? state.conversations.find(item => item.id === selected.sessionId) : undefined
  const sessionPending = selected ? state.events.filter(event => event.sessionId === selected.sessionId && event.approvalPending).length : 0
  const toolBlocked = Boolean(selected && state.config.denyTools.includes(selected.name))
  let selectedHost = ''
  try { selectedHost = selected ? new URL(selected.target).hostname : '' } catch { selectedHost = '' }
  const hostRuleIndex = selected ? state.config.hostRules.findIndex(rule => rule.tool === selected.name && rule.host === selectedHost && rule.action === 'deny') : -1
  const runAction = async (message: string, work: () => Promise<FirewallState>) => {
    setFeedback('')
    if (await mutate(work)) setFeedback(message)
  }
  const toggleTool = () => selected && runAction(
    toolBlocked ? `已恢复 ${selected.tool} 的自动策略` : `已保存：今后阻止 ${selected.tool} 的调用`,
    () => api(`/tools/${encodeURIComponent(selected.name)}`, { method: 'PATCH', body: JSON.stringify({ action: toolBlocked ? 'inherit' : 'deny' }) }),
  )
  const toggleHost = () => {
    if (!selected || !selectedHost) return
    return hostRuleIndex >= 0
      ? runAction(`已移除 ${selectedHost} 的阻止规则`, () => api(`/rules/host/${hostRuleIndex}`, { method: 'DELETE' }))
      : runAction(`已保存：今后阻止访问 ${selectedHost}`, () => api('/rules', { method: 'POST', body: JSON.stringify({ type: 'host', tool: selected.name, host: selectedHost, action: 'deny', reason: '从越权审核中创建' }) }))
  }
  const decide = async (action: 'allow-once' | 'allow-session' | 'reject' | 'reject-tool' | 'reject-target') => {
    if (!selected?.approvalPending || selected.approvalProcessing || decisionBusy) return
    const messages = {
      'allow-once': '已仅批准本次；当前调用恢复执行，后续策略不变。',
      'allow-session': `已允许此对话访问相同${selectedHost ? '主机' : '目标'}；授权将在一小时后或 DSH 重启时失效。`,
      reject: '已拒绝本次；拒绝结果已返回 Agent，当前对话可以继续寻找其他方案。',
      'reject-tool': '已拒绝本次并阻止此工具；Agent 可继续对话，后续同一工具会自动阻止。',
      'reject-target': `已拒绝本次并阻止此${selectedHost ? '主机' : '目标'}；Agent 可继续对话，后续命中相同边界会自动阻止。`,
    }
    setDecisionBusy(true)
    try {
      await runAction(messages[action], () => api(`/approvals/${encodeURIComponent(selected.id)}`, { method: 'POST', body: JSON.stringify({ action }) }))
    } finally { setDecisionBusy(false) }
  }
  const rejectBulk = async (scope: 'all' | 'session') => {
    const count = scope === 'all' ? state.stats.unresolved : sessionPending
    if (!count || decisionBusy) return
    if (bulkConfirm !== scope) {
      setBulkConfirm(scope)
      setFeedback(`将拒绝${scope === 'all' ? '全部任务' : '此对话'}的 ${count} 条待审调用；再次点击确认。Agent 会收到拒绝结果并继续运行。`)
      return
    }
    setBulkConfirm(null)
    setDecisionBusy(true)
    try {
      await runAction(`已拒绝 ${count} 条待审调用；对应 Agent 可以继续寻找其他方案。`, () => api('/approvals', { method: 'POST', body: JSON.stringify({ action: scope === 'all' ? 'reject-all' : 'reject-session', sessionId: selected?.sessionId }) }))
    } finally { setDecisionBusy(false) }
  }
  const analyze = async () => {
    if (!selected) return
    setAnalyzing(true)
    setFeedback('')
    try {
      const response = await api<{ analysis: AnalysisResult }>('/analyze', { method: 'POST', body: JSON.stringify({ eventId: selected.id }) })
      setAnalysis(response.analysis)
    } catch (reason) {
      setFeedback(`分析失败：${String((reason as Error)?.message || reason)}`)
    } finally { setAnalyzing(false) }
  }
  return <>
    <div className="fw-toolbar">
      <input className="fw-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索工具、路径、主机、对话或命中理由" aria-label="搜索审核记录" />
      <select className="fw-session-select" value={sessionFilter} onChange={event => { setSessionFilter(event.target.value); setSelectedId(null) }} aria-label="按对话筛选">
        <option value="all">全部对话 ({state.conversations.length})</option>
        {state.conversations.map(item => <option key={item.id} value={item.id}>{item.title} · {item.callCount} 次</option>)}
      </select>
      <div className="fw-segment">{[['all','全部'],['ask','待审核'],['deny','已阻止'],['allow','已允许']].map(([value,label]) => <button key={value} data-selected={filter === value} data-action={value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {state.stats.unresolved ? <button className="fw-button fw-button-danger fw-bulk-action" type="button" disabled={decisionBusy} onClick={() => rejectBulk('all')}>{bulkConfirm === 'all' ? `再次确认拒绝 ${state.stats.unresolved} 条` : `拒绝全部待审 (${state.stats.unresolved})`}</button> : null}
    </div>
    <div className="fw-review-grid fw-resizable-y">
      <div className="fw-event-list fw-resizable-x">{events.length ? events.map(event => <button className="fw-event" key={event.id} data-selected={event.id === selected?.id} data-violation={event.violation} onClick={() => setSelectedId(event.id)}>
        <EventPill event={event} />
        <span className="fw-event-main"><small>{event.sessionTitle}</small><strong>{event.tool}</strong><span>{event.target || event.reason}</span></span>
        <time>{formatTime(event.time)}</time>
      </button>) : <Empty title="没有匹配记录" text="换一个关键词或筛选条件试试。" />}</div>
      {selected ? <aside className="fw-detail">
        <div className="fw-conversation-context" data-risk={selected.violation}>
          <span className="fw-detail-label">所属对话</span><strong>{selected.sessionTitle}</strong>
          <div><span>会话 {shortId(selected.sessionId)}</span><span>轮次 {selected.turn ?? '?'} / 步骤 {selected.step ?? '?'}</span><span>{selected.provider && selected.model ? `${selected.provider}/${selected.model}` : '模型未记录'}</span></div>
          {selected.cwd ? <code title={selected.cwd}>{selected.cwd}</code> : null}
        </div>
        <h3>{selected.name}</h3>
        <div className="fw-detail-meta"><EventPill event={selected} /><span className="fw-cap">{riskLabel(selected.risk)}</span>{selected.simulated ? <span className="fw-cap">演练</span> : null}</div>
        <div className="fw-detail-block"><span className="fw-detail-label">{selected.violation ? '越权 / 异常目标' : '调用目标'}</span><div className="fw-target" data-safe={!selected.violation}>{selected.target || '调用未声明明确目标'}</div></div>
        <div className="fw-detail-block"><span className="fw-detail-label">策略判断</span>{selected.policySource ? <span className="fw-policy-source">命中：{policySourceLabel(selected.policySource)}</span> : null}<p className="fw-reason">{selected.reason}</p></div>
        {selected.approvalPending ? <section className="fw-approval-panel" aria-label="待审核操作">
          <header><div><span className="fw-detail-label">{selected.approvalProcessing ? '正在提交决定' : '需要你的决定'}</span><strong>{selected.approvalProcessing ? '另一窗口正在处理，请勿重复操作' : '当前 MCP 调用已暂停，尚未触达 Server'}</strong></div><span className="fw-approval-expiry">{approvalExpiry(selected)}</span></header>
          <p>“仅同意本次”不修改策略；“本对话允许”只复用相同工具与目标，并在一小时后失效。拒绝不会结束整段任务：Agent 会收到“用户拒绝”，可以改用安全方案、调整参数或向你说明。</p>
          <div className="fw-approval-actions">
            <button className="fw-button fw-button-primary" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => decide('allow-once')}>仅同意本次</button>
            {selected.target ? <button className="fw-button" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => decide('allow-session')}>本对话允许此{selectedHost ? '主机' : '目标'}</button> : null}
            <button className="fw-button fw-button-danger" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => decide('reject')}>拒绝本次</button>
            <button className="fw-button fw-button-danger" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => decide('reject-tool')}>拒绝并阻止此工具</button>
            {selected.target ? <button className="fw-button fw-button-danger" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => decide('reject-target')}>拒绝并阻止此{selectedHost ? '主机' : '目标'}</button> : null}
            {sessionPending > 1 ? <button className="fw-button fw-button-danger" type="button" disabled={decisionBusy || selected.approvalProcessing} onClick={() => rejectBulk('session')}>{bulkConfirm === 'session' ? `再次确认拒绝 ${sessionPending} 条` : `拒绝此对话全部 (${sessionPending})`}</button> : null}
          </div>
        </section> : selected.kind === 'ask' && !selected.approval ? <section className="fw-approval-stale"><strong>这条审批已失效，无法事后批准</strong><p>原任务可能已取消、重启或超过等待时间。重新触发工具调用会生成新的待审请求；你仍可在下方调整今后的策略。</p></section> : null}
        <CallTimeline event={selected} />
        <div className="fw-detail-block"><span className="fw-detail-label">调用参数（已脱敏）</span><pre className="fw-code">{prettyArgs(selected.argumentSummary)}</pre></div>
        <div className="fw-detail-block"><span className="fw-detail-label">处理结果</span><p className="fw-reason">{outcomeLabel(selected)}</p></div>
        <div className="fw-detail-actions"><button className="fw-button fw-button-primary" onClick={analyze} disabled={analyzing}>{analyzing ? '正在分析…' : 'AI 分析这次调用'}</button><button className="fw-button" onClick={() => setExpanded(value => !value)}>{expanded ? '收起对话全链路' : `展开对话全链路 (${sessionEvents.length})`}</button>{!selected.approvalPending ? <button className={`fw-button ${toolBlocked ? '' : 'fw-button-danger'}`} onClick={toggleTool}>{toolBlocked ? '恢复自动策略' : '阻止此工具'}</button> : null}{!selected.approvalPending && isUrl(selected.target) ? <button className="fw-button" onClick={toggleHost}>{hostRuleIndex >= 0 ? '移除主机规则' : '阻止此主机'}</button> : null}</div>
        {feedback ? <div className="fw-action-feedback" role="status">{feedback}</div> : null}
        {analysis ? <AnalysisPanel analysis={analysis} /> : null}
        {expanded ? <SessionChain conversation={selectedConversation} events={sessionEvents} selectedId={selected.id} onSelect={setSelectedId} /> : null}
      </aside> : <Empty title="选择一条记录" text="调用目标和命中规则会显示在这里。" />}
    </div>
  </>
}

function CallTimeline({ event }: { event: AuditEvent }) {
  return <div className="fw-detail-block"><span className="fw-detail-label">本次调用全流程</span><div className="fw-timeline">{event.timeline.map((item, index) => <div className="fw-timeline-node" data-status={item.status} key={`${item.phase}-${index}`}><i /><div><strong>{item.label}</strong><time>{formatTime(item.time)}</time></div></div>)}</div></div>
}

function AnalysisPanel({ analysis }: { analysis: AnalysisResult }) {
  return <section className="fw-analysis fw-resizable-y">
    <header><strong>{analysis.source === 'ai' ? 'AI 安全分析' : '本地安全分析'}</strong><span>{analysis.model || '规则引擎'}</span></header>
    <h4>{analysis.summary}</h4>
    <dl><dt>正在做什么</dt><dd>{analysis.intent}</dd><dt>错误 / 阻止原因</dt><dd>{analysis.finding}</dd><dt>风险判断</dt><dd>{analysis.risk}</dd></dl>
    <ol>{analysis.nextSteps.map((item, index) => <li key={index}>{item}</li>)}</ol>
    {analysis.note ? <p className="fw-analysis-note">{analysis.note}</p> : null}
  </section>
}

function SessionChain({ conversation, events, selectedId, onSelect }: { conversation?: Conversation; events: AuditEvent[]; selectedId: string; onSelect: (id: string) => void }) {
  return <section className="fw-session-chain fw-resizable-y">
    <header><div><span className="fw-detail-label">对话全链路</span><strong>{conversation?.title || events[0]?.sessionTitle}</strong></div><span>{events.length} 次 MCP 调用 · {conversation?.denied || 0} 次越权 · {conversation?.errors || 0} 次报错</span></header>
    <div className="fw-chain-list">{events.map((event, index) => <button key={event.id} className="fw-chain-call" data-selected={event.id === selectedId} data-violation={event.violation} onClick={() => onSelect(event.id)}>
      <span className="fw-chain-index">{index + 1}</span><div className="fw-chain-main"><div><strong>{event.tool}</strong><EventPill event={event} /></div><p>{event.target || event.reason}</p><small>轮次 {event.turn ?? '?'} / 步骤 {event.step ?? '?'} · {event.timeline.map(item => item.label).join(' → ')}</small></div><time>{formatTime(event.time)}</time>
    </button>)}</div>
  </section>
}

function Policy({ state, mutate }: { state: FirewallState; mutate: Mutate }) {
  const [type, setType] = useState('host')
  const [value, setValue] = useState('')
  const [action, setAction] = useState<Action>('deny')
  const [repairConfirm, setRepairConfirm] = useState(false)
  const [simulationName, setSimulationName] = useState(state.tools[0]?.name || '')
  const [simulationArgs, setSimulationArgs] = useState('{\n  "url": "https://api.example.com/data"\n}')
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [simulationError, setSimulationError] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [timeoutMinutes, setTimeoutMinutes] = useState(String(Math.round(state.config.approvalTimeoutMs / 60_000)))
  const [timeoutSaving, setTimeoutSaving] = useState(false)
  useEffect(() => setTimeoutMinutes(String(Math.round(state.config.approvalTimeoutMs / 60_000))), [state.config.approvalTimeoutMs])
  useEffect(() => {
    if (!repairConfirm) return
    const timer = window.setTimeout(() => setRepairConfirm(false), 5000)
    return () => window.clearTimeout(timer)
  }, [repairConfirm])
  const settings = (patch: any) => mutate(() => api('/settings', { method: 'PATCH', body: JSON.stringify(patch) }))
  const parsedTimeoutMinutes = Number(timeoutMinutes)
  const timeoutValid = Number.isFinite(parsedTimeoutMinutes) && parsedTimeoutMinutes >= 1 && parsedTimeoutMinutes <= 10_080
  const timeoutDirty = timeoutValid && Math.round(parsedTimeoutMinutes * 60_000) !== state.config.approvalTimeoutMs
  const saveTimeout = async () => {
    if (!timeoutValid || !timeoutDirty) return
    setTimeoutSaving(true)
    await settings({ approvalTimeoutMs: Math.round(parsedTimeoutMinutes * 60_000) })
    setTimeoutSaving(false)
  }
  useEffect(() => {
    if (!timeoutDirty) return
    const timer = window.setTimeout(() => { void saveTimeout() }, 600)
    return () => window.clearTimeout(timer)
  }, [timeoutMinutes, state.config.approvalTimeoutMs])
  const addRule = async () => {
    const body = type === 'host' ? { type, host: value, action } : { type: 'argument', key: '$target', value, action }
    if (await mutate(() => api('/rules', { method: 'POST', body: JSON.stringify(body) }))) setValue('')
  }
  const rules = [
    ...state.config.hostRules.map((rule, index) => ({ type: 'host', index, label: rule.host, detail: `${rule.tool || '全部网络工具'} · ${actionLabel(rule.action)}` })),
    ...state.config.argRules.map((rule, index) => ({ type: 'argument', index, label: Object.entries(rule.args || {}).map(([key,val]) => `${key === '$target' ? '目标' : key} 包含 ${val}`).join(', '), detail: `${rule.tool || '全部工具'} · ${actionLabel(rule.action)}` })),
  ]
  const remove = (rule: any) => mutate(() => api(`/rules/${rule.type}/${rule.index}`, { method: 'DELETE' }))
  const repairable = state.policyIssues.filter(issue => issue.repairable).length
  const repair = async () => {
    if (!repairConfirm) { setRepairConfirm(true); return }
    setRepairConfirm(false)
    await mutate(() => api('/policy/repair', { method: 'POST', body: '{}' }))
  }
  const revokeGrant = (grant: SessionGrant) => mutate(() => api(`/grants/${encodeURIComponent(grant.id)}`, { method: 'DELETE' }))
  const simulate = async () => {
    setSimulationError('')
    setSimulation(null)
    let args
    try { args = JSON.parse(simulationArgs || '{}') } catch { setSimulationError('参数不是有效的 JSON。'); return }
    setSimulating(true)
    try {
      const response = await api<{ simulation: SimulationResult }>('/simulate', { method: 'POST', body: JSON.stringify({ name: simulationName, arguments: args }) })
      setSimulation(response.simulation)
    } catch (reason) { setSimulationError(String((reason as Error)?.message || reason)) } finally { setSimulating(false) }
  }
  return <>
    <section className="fw-policy-health" data-issues={state.policyIssues.length > 0}>
      <header><div><span className="fw-detail-label">策略健康</span><strong>{state.policyIssues.length ? `${state.policyIssues.length} 个需要注意的配置关系` : '没有发现互相矛盾的规则'}</strong></div>{repairable ? <button className="fw-button fw-button-danger" type="button" onClick={repair}>{repairConfirm ? `再次确认清理 ${repairable} 项` : `安全优先修复 (${repairable})`}</button> : <Pill kind="allow">正常</Pill>}</header>
      {state.policyIssues.length ? <div className="fw-policy-issues fw-resizable-y">{state.policyIssues.map(issue => <div className="fw-policy-issue" data-severity={issue.severity} key={issue.id}><div><strong>{issue.title}</strong><p>{issue.detail}</p></div><span>{issue.repairable ? '可修复' : '提示'}</span></div>)}</div> : null}
    </section>
    {state.grants.length ? <section className="fw-grants">
      <header><div><span className="fw-detail-label">本对话临时授权</span><strong>{state.grants.length} 条正在生效</strong></div><span>到期或 DSH 重启后自动清除</span></header>
      <div className="fw-grant-list">{state.grants.map(grant => <div className="fw-grant" key={grant.id}><div><strong>{grant.toolName}</strong><p>{grant.sessionTitle} · {grant.host || grant.target}</p></div><time>{new Date(grant.expiresAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 到期</time><button title="撤销临时授权" aria-label="撤销临时授权" onClick={() => revokeGrant(grant)}>×</button></div>)}</div>
    </section> : null}
    <div className="fw-policy-grid">
      <div>
        <div className="fw-section-head"><div><h2>全局策略</h2><p>设置未单独配置工具的默认行为</p></div></div>
        <div className="fw-settings">
          <div className="fw-setting"><div><strong>防火墙开关</strong><p>关闭后不拦截，也不记录新的 MCP 调用</p></div><button className="fw-toggle" aria-label="切换防火墙" data-on={state.config.enabled} onClick={() => settings({ enabled: !state.config.enabled })} /></div>
          <div className="fw-setting"><div><strong>默认策略</strong><p>工具没有单独规则时采用</p></div><ActionControl value={state.config.defaultAction} onChange={value => settings({ defaultAction: value })} /></div>
          <div className="fw-setting"><div><strong>注入风险信号</strong><p>仅作为辅助判断，不承诺识别所有攻击</p></div><ActionControl value={state.config.injectionAction} onChange={value => settings({ injectionAction: value })} /></div>
          <div className="fw-setting fw-setting-timeout"><div><strong>审核超时自动拒绝</strong><p>{state.config.approvalTimeoutEnabled ? '超过时限自动拒绝当前调用，Agent 可继续寻找安全方案' : '已关闭：调用会等待人工处理、任务取消或 DSH 重启'}</p></div><div className="fw-timeout-control"><button className="fw-toggle" aria-label="切换审核超时自动拒绝" data-on={state.config.approvalTimeoutEnabled} onClick={() => settings({ approvalTimeoutEnabled: !state.config.approvalTimeoutEnabled })} /><label><input type="number" min="1" max="10080" step="1" value={timeoutMinutes} aria-label="审核超时分钟数" onChange={event => setTimeoutMinutes(event.target.value)} onBlur={() => { void saveTimeout() }} onKeyDown={event => { if (event.key === 'Enter') void saveTimeout() }} /><span>分钟</span></label><span className="fw-timeout-status" data-error={!timeoutValid}>{!timeoutValid ? '范围 1–10080' : timeoutSaving || timeoutDirty ? '自动保存中' : '已保存'}</span></div></div>
        </div>
      </div>
      <div>
        <div className="fw-section-head"><div><h2>边界规则</h2><p>按主机或路径内容快速收紧权限</p></div></div>
        <div className="fw-rule-list">
          {rules.length ? rules.map(rule => <div className="fw-rule" key={`${rule.type}-${rule.index}`}><div><strong>{rule.label}</strong><span>{rule.detail}</span></div><button title="删除规则" aria-label="删除规则" onClick={() => remove(rule)}>×</button></div>) : <Empty title="没有细粒度规则" text="可以先添加一个禁止访问的主机或路径片段。" />}
          <div className="fw-rule-form">
            <select value={type} onChange={event => setType(event.target.value)}><option value="host">网络主机</option><option value="argument">路径片段</option></select>
            <input value={value} onChange={event => setValue(event.target.value)} placeholder={type === 'host' ? 'upload.example.com' : 'C:\\Windows\\System32'} />
            <select value={action} onChange={event => setAction(event.target.value as Action)}><option value="deny">阻止</option><option value="ask">询问</option><option value="allow">允许</option></select>
            <button className="fw-button fw-button-primary" disabled={!value.trim()} onClick={addRule}>添加</button>
          </div>
        </div>
      </div>
    </div>
    <section className="fw-simulator fw-resizable-y">
      <header><div><span className="fw-detail-label">策略试算</span><strong>预览一次调用会被如何处理</strong></div><span>不会执行工具</span></header>
      <div className="fw-simulator-grid">
        <label><span>完整工具名</span><input list="fw-tool-options" value={simulationName} onChange={event => setSimulationName(event.target.value)} placeholder="mcp__server__tool" /><datalist id="fw-tool-options">{state.tools.map(tool => <option key={tool.name} value={tool.name} />)}</datalist></label>
        <label><span>调用参数 JSON</span><textarea value={simulationArgs} onChange={event => setSimulationArgs(event.target.value)} spellCheck={false} /></label>
        <button className="fw-button fw-button-primary" type="button" disabled={!simulationName.trim() || simulating} onClick={simulate}>{simulating ? '计算中…' : '运行策略试算'}</button>
      </div>
      {simulationError ? <div className="fw-error">{simulationError}</div> : null}
      {simulation ? <div className="fw-simulation-result"><Pill kind={simulation.decision.kind}>{actionLabel(simulation.decision.kind)}</Pill><div><strong>{policySourceLabel(simulation.decision.source)}</strong><p>{simulation.decision.reason}</p><small>{simulation.note}</small></div></div> : null}
    </section>
  </>
}

function Audit({ state }: { state: FirewallState }) {
  return <section className="fw-band" style={{ marginTop: 0 }}>
    <header className="fw-band-header"><h3>本地审计</h3><p>{state.events.filter(event => !event.simulated).length} 次真实决策 · {state.events.filter(event => event.simulated).length} 次演练，敏感参数已脱敏</p></header>
    {state.events.length ? <table className="fw-inventory"><thead><tr><th>时间 / 对话</th><th className="fw-tool-cell">工具</th><th>目标</th><th>决策</th></tr></thead><tbody>{state.events.map(event => <tr key={event.id} data-violation={event.violation}><td>{new Date(event.time).toLocaleString('zh-CN')}<span className="fw-tool-desc" title={event.sessionId}>{event.sessionTitle}</span></td><td className="fw-tool-cell"><span className="fw-tool-name">{event.name}</span><span className="fw-tool-desc">轮次 {event.turn ?? '?'} / 步骤 {event.step ?? '?'}</span></td><td><span className="fw-tool-desc" title={event.target}>{event.target || '未声明'}</span></td><td><EventPill event={event} /></td></tr>)}</tbody></table> : <Empty title="尚无审计记录" text="MCP 工具调用发生后，决策和结果会保存在本机。" />}
  </section>
}

function Empty({ title, text }: { title: string; text: string }) {
  return <div className="fw-empty"><div><div className="fw-empty-mark">S</div><h3>{title}</h3><p>{text}</p></div></div>
}

function SafetyCockpit({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded)
  const [view, setView] = useState<View>('overview')
  const [state, setState] = useState<FirewallState | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [focusEvent, setFocusEvent] = useState<AuditEvent | null>(null)

  const load = useCallback(async () => {
    try { setState(await api<FirewallState>('/state')); setError('') } catch (reason) { setError(String((reason as Error)?.message || reason)) }
  }, [])
  const mutate = useCallback(async (work: () => Promise<FirewallState>) => {
    setBusy(true)
    try { setState(await work()); setError(''); return true } catch (reason) { setError(String((reason as Error)?.message || reason)); return false } finally { setBusy(false) }
  }, [])
  useEffect(() => {
    const listener = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, listener)
    return () => window.removeEventListener(OPEN_EVENT, listener)
  }, [])
  useEffect(() => {
    if (!open && !embedded) return
    load()
    const timer = window.setInterval(load, 3000)
    return () => window.clearInterval(timer)
  }, [open, embedded, load])

  const review = (event?: AuditEvent) => { setFocusEvent(event || null); setView('review') }
  const demo = () => mutate(() => api('/demo', { method: 'POST', body: '{}' }))
  const download = () => { window.location.href = `${API_ROOT}/report` }
  if (!embedded && !open) return null
  const labels: Record<View, [string,string]> = {
    overview: ['安全概览', '查看权限分布和需要立即处理的风险'], review: ['调用审核', '快速定位越权目标、命中规则和处理结果'],
    policy: ['策略中心', '调整默认行为和细粒度访问边界'], audit: ['审计记录', '本地保存每一次决策、批准和执行结果'],
  }
  const cockpit = <div className="fw-app">
    <aside className="fw-sidebar">
      <div className="fw-brand"><div className="fw-mark">S</div><div><strong>Safety Cockpit</strong><small>MCP 行动控制台</small></div></div>
      <nav className="fw-nav">
        {([['overview','概览','◫'],['review','审核','!'],['policy','策略','≡'],['audit','审计','↳']] as Array<[View,string,string]>).map(([id,label,icon]) => <button key={id} data-active={view === id} onClick={() => setView(id)}><span className="fw-nav-icon">{icon}</span><span>{label}</span>{id === 'review' && state?.stats.unresolved ? <span className="fw-nav-count">{state.stats.unresolved}</span> : null}</button>)}
      </nav>
      <div className="fw-health"><div className="fw-health-line"><span className="fw-health-dot" data-off={!state?.config.enabled} />{state?.config.enabled ? '运行中 · 本地审计' : '防护已停用'}</div><small>{state?.meta.auditFile || '正在连接服务'}</small></div>
    </aside>
    <main className="fw-main">
      <header className="fw-topbar"><div className="fw-title"><h1>{labels[view][0]}</h1><p>{labels[view][1]}</p></div><div className="fw-top-actions"><button className="fw-button" onClick={demo} disabled={busy}>安全演练</button><button className="fw-button fw-report-button" onClick={download}>导出报告</button>{!embedded ? <button className="fw-button fw-icon-button" title="关闭" aria-label="关闭" onClick={() => setOpen(false)}>×</button> : null}</div></header>
      <div className="fw-content">{error ? <div className="fw-error">{error}</div> : null}{!state ? <div className="fw-loading">正在读取安全状态…</div> : view === 'overview' ? <Overview state={state} mutate={mutate} onReview={review} /> : view === 'review' ? <Review state={state} initial={focusEvent} mutate={mutate} /> : view === 'policy' ? <Policy state={state} mutate={mutate} /> : <Audit state={state} />}</div>
    </main>
  </div>
  return embedded ? cockpit : <div className="fw-overlay">{cockpit}</div>
}

function FirewallLaunch() {
  const [pending, setPending] = useState(0)
  useEffect(() => {
    let active = true
    const loadPending = () => api<FirewallState>('/state').then(state => { if (active) setPending(state.stats.unresolved) }).catch(() => undefined)
    loadPending()
    const timer = window.setInterval(loadPending, 2000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])
  return <div className="fw-launch-row"><button className="fw-launch" data-pending={pending > 0} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} title={pending ? `${pending} 条 MCP 调用正在等待审核` : '打开 MCP 安全驾驶舱'}><span className="fw-launch-alert" />{pending ? 'MCP 待审核' : 'MCP 安全驾驶舱'}{pending ? <span className="fw-launch-count">{pending}</span> : null}</button></div>
}

function riskLabel(risk: string) { return ({ read: '只读', network: '网络', destructive: '高风险', injection: '注入信号', denied: '禁止' } as Record<string,string>)[risk] || risk }
function actionLabel(action: string) { return ({ allow: '允许', ask: '询问', deny: '阻止' } as Record<string,string>)[action] || action }
function policySourceLabel(source: string) {
  return ({
    'tool-deny': '工具级阻止', 'argument-deny': '参数阻止规则', 'host-deny': '主机阻止规则',
    'injection-signal': 'Prompt Injection 风险信号', 'session-grant': '本对话临时授权',
    'argument-ask': '参数询问规则', 'host-ask': '主机询问规则', 'argument-allow': '参数允许规则',
    'host-allow': '主机允许规则', 'tool-ask': '工具每次询问', 'tool-allow': '工具级允许',
    'risk-default': '内置风险分级', 'global-default': '全局默认策略',
  } as Record<string,string>)[source] || source
}
function isUrl(value: string) { try { return Boolean(new URL(value).hostname) } catch { return false } }
function prettyArgs(text: string) { try { return JSON.stringify(JSON.parse(text), null, 2) } catch { return text } }
function shortId(value: string) { return value.length > 13 ? `${value.slice(0, 11)}…` : value }
function approvalExpiry(event: AuditEvent) {
  if (event.approvalProcessing) return '正在保存决定'
  if (!event.approvalExpiresAt) return '不会自动拒绝'
  const seconds = Math.max(0, Math.ceil((new Date(event.approvalExpiresAt).valueOf() - Date.now()) / 1000))
  return seconds > 60 ? `${Math.ceil(seconds / 60)} 分钟后自动拒绝` : `${seconds} 秒后自动拒绝`
}
function outcomeLabel(event: AuditEvent) {
  if (event.kind === 'deny') return '调用已在执行前阻止，没有触达 MCP Server。'
  if (event.approvalPending) return event.approvalExpiresAt
    ? '当前工具调用已暂停，正在等待审核；超时会自动拒绝，不会让任务永久挂起。'
    : '当前工具调用已暂停，正在等待人工审核；自动拒绝已关闭，任务会等待到你处理或任务被取消。'
  if (event.approvalAction === 'allow-session') return `用户批准了本次调用，并临时允许此对话继续访问相同目标；授权一小时后或 DSH 重启时自动失效${event.result ? `，本次执行结果：${event.result}` : ''}。`
  if (event.approval === 'allowed-once') return `用户仅批准了这组参数，本次调用已恢复${event.result ? `，执行结果：${event.result}` : ''}；长期策略没有改变。`
  if (event.approvalAction === 'reject-tool') return '用户拒绝了本次调用并阻止此工具。拒绝结果已返回 Agent；当前对话可以继续，但后续同一工具会自动阻止。'
  if (event.approvalAction === 'reject-target') return '用户拒绝了本次调用并阻止同类目标。拒绝结果已返回 Agent；当前对话可以继续，但后续命中相同主机或目标会自动阻止。'
  if (event.approvalAction === 'reject-session') return '用户批量拒绝了此对话中的待审调用。每个拒绝结果都已返回对应 Agent，任务仍可继续寻找其他方案。'
  if (event.approvalAction === 'reject-all') return '用户执行了紧急清空，当前所有待审调用均被拒绝；各 Agent 会收到拒绝结果并继续运行。'
  if (event.approvalAction === 'timeout') return '等待审核超时，系统已自动拒绝当前调用并把结果返回 Agent；长期策略没有改变。'
  if (event.approval === 'rejected') return '用户只拒绝了当前工具调用，MCP Server 没有执行；拒绝结果已返回 Agent，当前对话可以继续尝试其他方案。'
  if (event.approval === 'cancelled') return '审批因任务取消、重启或页面链路中断而关闭，MCP Server 没有执行。'
  if (event.approval === 'unavailable') return '没有可用审批通道，系统已默认拒绝。'
  if (event.approval) return `审批结果：${event.approval}。`
  if (event.kind === 'ask') return '这条历史审批已不再关联运行中的工具调用，无法事后处理。'
  return event.result ? `已通过策略检查，执行结果：${event.result}。` : '已通过策略检查。'
}

export const inject = ['slots']
export function apply(ctx: any): void {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshMcpFirewall = ''
    style.textContent = FIREWALL_CSS
    document.head.append(style)
    return () => style.remove()
  }, 'mcp-firewall: styles')
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({ name: 'conversation.input.dock', id: 'mcp-firewall-launch', order: 4 }, FirewallLaunch))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'mcp-firewall-overlay', order: 45 }, SafetyCockpit))
  ctx.slots.inject('conversation.view', () => ctx.slots.register({ name: 'conversation.view', id: 'mcp-firewall', order: 4, label: '安全' }, () => <SafetyCockpit embedded />))
}
