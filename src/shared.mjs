// dsh-mcp-firewall — shared constants and pure helpers.
//
// Everything here is side-effect free and unit-testable without a Cordis
// context. Policy (allow/ask/block) and audit both build on these primitives.

/** The model-facing public name prefix DSH's MCP client assigns to every MCP tool. */
export const MCP_NAME_PREFIX = 'mcp__'

/** Actions the firewall can decide on a single pending tool call. */
export const ACTIONS = Object.freeze(['allow', 'ask', 'deny'])

/** Risk tiers attached to a decision, used to pick a human-readable reason. */
export const RISK_TIERS = Object.freeze(['safe', 'read', 'network', 'destructive', 'injection', 'denied'])

/** Default plugin configuration, overridable through cordis.patch.yml. */
export function defaultConfig() {
  return {
    /** Master switch. When false the plugin records nothing and blocks nothing. */
    enabled: true,
    /**
     * Fallback for tools that match no rule. `allow` keeps the default DSH
     * behavior; `ask` routes every unmatched MCP call through approval; `deny`
     * is a strict allowlist stance. Default is `allow` so the skeleton is
     * non-invasive until rules are configured.
     */
    defaultAction: 'allow',
    /** Whether unanswered approvals are automatically rejected. */
    approvalTimeoutEnabled: true,
    /** Time an approval may remain unanswered before automatic rejection. */
    approvalTimeoutMs: 10 * 60_000,
    /** Explicitly denied tool names (public names, e.g. `mcp__git__rm`). */
    denyTools: [],
    /** Explicitly allowed tool names, evaluated before risk classification. */
    allowTools: [],
    /** Tool names that always require one-time human approval. */
    askTools: [],
    /** Risk keywords matched against tool name + serialized arguments. */
    riskPatterns: {
      destructive: ['write', 'edit', 'rm', 'remove', 'delete', 'truncate', 'shell', 'bash', 'exec', 'run', 'install', 'deploy', 'drop', 'apply', 'patch'],
      network: ['fetch', 'http', 'https', 'curl', 'url', 'download', 'upload', 'browse', 'web', 'request', 'api', 'host', 'endpoint'],
      secret: ['token', 'key', 'secret', 'password', 'credential', 'api_key', 'apikey', 'authorization', 'cookie'],
    },
    /**
     * Per-argument rules: `[{ tool?, args: { key: value }, action, reason? }]`.
     * `tool` is optional (any tool); `args` must all match (string values are
     * substring-matched, everything else compared strictly). First match wins;
     * `deny` rules are evaluated before the allow list, `ask` rules after it.
     */
    argRules: [],
    /**
     * Per-host rules for network calls: `[{ tool?, host, action, reason? }]`.
     * `host` matches exactly or as a subdomain suffix. Applied to the URL host
     * extracted from common argument keys (`url`, `endpoint`, `host`, ...).
     */
    hostRules: [],
    /** How a detected prompt-injection signal is treated. Auxiliary signal — never a promise to catch everything. */
    injectionAction: 'ask',
    /** Suspicious instruction phrasing matched against tool name + serialized arguments. */
    injectionPatterns: [
      'ignore previous instructions',
      'ignore all previous',
      'ignore the above',
      'disregard prior',
      'disregard previous',
      'forget everything',
      'system prompt',
      'you are now',
      'you are a',
      'act as',
      'jailbreak',
      'hidden instruction',
      'secret instruction',
      'do not tell the user',
      'do not reveal',
      'new instructions',
    ],
    /** Directory that receives audit JSONL (resolved relative to cwd unless absolute). */
    auditDir: '.dsh-mcp-firewall',
  }
}

/**
 * Split an MCP public name (`mcp__server__tool`) back into its server and raw
 * tool identity. Returns null for non-MCP tool names. This mirrors the naming
 * contract in `@deepseek-ai/dsh-mcp-client` (`publicToolName`): the public name
 * is the stable identity and is never parsed to recover the raw name on the
 * wire — here it is only read back for *classification and display*, never to
 * reconstruct a wire call.
 */
export function parseMcpName(name) {
  const value = String(name ?? '')
  if (!value.startsWith(MCP_NAME_PREFIX)) return null
  const rest = value.slice(MCP_NAME_PREFIX.length)
  const split = rest.indexOf('__')
  if (split <= 0) return { server: '', tool: rest }
  return { server: rest.slice(0, split), tool: rest.slice(split + 2) }
}

/** True when the tool name belongs to the MCP namespace. */
export function isMcpTool(name) {
  return String(name ?? '').startsWith(MCP_NAME_PREFIX)
}

/** Lossless-JSON-safe projection of a tool's parsed arguments for logging. */
export function snapshotArguments(args) {
  if (args === undefined) return {}
  try {
    const json = JSON.stringify(args ?? null)
    return json === undefined ? {} : JSON.parse(json)
  } catch {
    return { __unserializable__: true }
  }
}

/** Recursively redact common credential fields and inline secret forms before persistence. */
export function redactSensitive(value, key = '', depth = 0) {
  if (depth > 6) return '[truncated]'
  if (/token|secret|password|credential|authorization|cookie|api[_-]?key/i.test(key)) return '[redacted]'
  if (Array.isArray(value)) return value.map(item => redactSensitive(item, key, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redactSensitive(child, childKey, depth + 1)]))
  }
  if (typeof value === 'string') {
    return value
      .replace(/(bearer\s+)[a-z0-9._~+\/-]+/gi, '$1[redacted]')
      .replace(/((?:api[_-]?key|token|password|secret)\s*[=:]\s*)[^\s&;]+/gi, '$1[redacted]')
  }
  return value
}

/** Depth-limited, human-facing summary of arguments for audit display. */
export function summarizeArguments(args, maxLen = 500) {
  let text
  try {
    text = JSON.stringify(args ?? null)
  } catch {
    text = String(args ?? '')
  }
  if (typeof text !== 'string') text = String(text)
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
}

/** Collect a tool call's searchable text: name plus serialized arguments. */
export function searchableText(name, args) {
  const body = summarizeArguments(args, 4096).toLocaleLowerCase()
  return `${String(name ?? '').toLocaleLowerCase()} ${body}`
}

/** Extract the URL host from a tool call's arguments, if any recognizable key carries one. */
export function extractHost(args) {
  for (const { key, value } of collectTargetEntries(args)) {
    if (!['url', 'uri', 'endpoint', 'host', 'baseurl', 'base_url', 'link', 'href', 'target'].includes(key.toLowerCase())) continue
    try {
      return new URL(value).hostname.toLowerCase()
    } catch {
      /* not an absolute URL — fall through to the bare-hostname check */
    }
    if (/^[\w.-]+\.[a-z]{2,}$/i.test(value)) return value.toLowerCase()
  }
  return null
}

/** Collect common URL, path, host and command targets from nested MCP arguments. */
export function collectTargets(args) {
  return [...new Set(collectTargetEntries(args).map(entry => entry.value))]
}

function collectTargetEntries(value, depth = 0, output = []) {
  if (!value || typeof value !== 'object' || depth > 4) return output
  const keys = new Set(['path', 'file_path', 'directory', 'cwd', 'target', 'url', 'uri', 'endpoint', 'host', 'baseurl', 'base_url', 'link', 'href', 'command', 'cmd'])
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'string' && child && keys.has(key.toLowerCase())) output.push({ key, value: child })
    else if (child && typeof child === 'object') collectTargetEntries(child, depth + 1, output)
  }
  return output
}

/** Naive prompt-injection signal: suspicious instruction phrasing inside a tool call. */
export function detectInjection(name, args, patterns) {
  const text = searchableText(name, args)
  return (patterns ?? []).some(p => text.includes(String(p).toLocaleLowerCase()))
}

/** Naive but deterministic risk tier for a tool call. The rule engine (task 2) replaces this. */
export function classifyRisk(name, args, patterns) {
  const text = searchableText(name, args)
  const hits = kind => (patterns?.[kind] ?? []).some(keyword => text.includes(String(keyword).toLocaleLowerCase()))
  if (hits('destructive')) return 'destructive'
  if (hits('network')) return 'network'
  if (hits('secret')) return 'destructive'
  return 'read'
}

/** Human-readable, explainable reason for a decision. */
export function explain(action, name, risk, detail = '') {
  const label = String(name ?? '(unknown tool)')
  switch (action) {
    case 'deny':
      return detail || `「${label}」被防火墙拒绝：命中 deny 规则（风险等级 ${risk}）`
    case 'ask':
      if (risk === 'injection') return detail || `「${label}」的参数疑似包含注入指令，已拦下等待人工确认`
      return detail || `「${label}」是高${risk === 'destructive' ? '风险（破坏性）' : '风险'}调用，需要人工审批`
    case 'allow':
      return `「${label}」通过防火墙检查`
    default:
      return ''
  }
}
