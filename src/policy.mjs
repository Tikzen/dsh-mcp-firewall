// dsh-mcp-firewall — allow/ask/block decision engine.
//
// Layered precedence (first match wins):
//   1. explicit deny list (`denyTools`)
//   2. per-argument deny rules (`argRules` with action `deny`)
//   3. per-host deny rules (`hostRules` with action `deny`)
//   4. prompt-injection signal (auxiliary, routed by `injectionAction`)
//   5. narrow, memory-only session grant for the same tool and target
//   6. specific argument / host ask or allow rules
//   7. explicit per-tool ask / allow policy
//   8. risk classification (destructive / network → `ask`)
//   9. fallback `defaultAction`
//
// The contract — one pending execution in, one {kind, reason, risk, mcp}
// decision out — is stable, so the interception layer never has to change.

import { ACTIONS, classifyRisk, collectTargets, detectInjection, explain, extractHost, isMcpTool } from './shared.mjs'

/**
 * Evaluate one pending tool call into a pre-execute decision.
 *
 * @param exec  the `tools/pre-execute` {@link ToolExecution}: has `name`,
 *              `arguments` (parsed JSON), `agent`, `callId`, `rootCallId`.
 * @param config the resolved plugin config (see `defaultConfig()`).
 * @returns {{ kind: 'allow' | 'ask' | 'deny', reason: string, risk: string, mcp: boolean }}
 */
export function evaluateDecision(exec, config) {
  const name = String(exec?.name ?? '')
  const args = exec?.arguments
  const mcp = isMcpTool(name)
  const risk = classifyRisk(name, args, config?.riskPatterns)

  // 1. Explicit deny list wins.
  if (matchPatterns(name, config?.denyTools)) {
    return { kind: 'deny', reason: explain('deny', name, risk), risk: 'denied', mcp, source: 'tool-deny' }
  }

  // 2. Per-argument deny rules (e.g. mcp__filesystem__write with path=/etc/passwd).
  const deniedArgRule = matchArgRules(name, args, config?.argRules, 'deny')
  if (deniedArgRule) {
    return { kind: 'deny', reason: deniedArgRule.reason || explain('deny', name, risk, `命中参数规则：${ruleSummary(deniedArgRule)}`), risk: 'denied', mcp, source: 'argument-deny' }
  }

  // 3. Per-host deny rules (e.g. any network call touching a blocked host).
  const deniedHostRule = matchHostRules(name, args, config?.hostRules, 'deny')
  if (deniedHostRule) {
    return { kind: 'deny', reason: deniedHostRule.reason || explain('deny', name, risk, `命中主机规则：${deniedHostRule.host}`), risk: 'denied', mcp, source: 'host-deny' }
  }

  // 4. Prompt-injection signal — auxiliary, never a claim to catch everything.
  if (detectInjection(name, args, config?.injectionPatterns)) {
    const action = ACTIONS.includes(config?.injectionAction) ? config.injectionAction : 'ask'
    if (action === 'deny') return { kind: 'deny', reason: explain('deny', name, 'injection', '参数疑似包含注入指令，按策略拒绝'), risk: 'injection', mcp, source: 'injection-signal' }
    if (action === 'ask') return { kind: 'ask', reason: explain('ask', name, 'injection'), risk: 'injection', mcp, source: 'injection-signal' }
  }

  // Session grants are narrow, memory-only exceptions. They never bypass the
  // deny and injection layers above, and must match this tool and target.
  const sessionGrant = matchSessionGrants(name, args, config?.sessionGrants)
  if (sessionGrant) {
    const scope = sessionGrant.host ? `主机 ${sessionGrant.host}` : `目标 ${sessionGrant.target}`
    return { kind: 'allow', reason: `本对话已临时允许「${name}」访问${scope}`, risk, mcp, source: 'session-grant' }
  }

  // 6. A narrow boundary rule wins over a broad tool-level policy.
  const askedArgRule = matchArgRules(name, args, config?.argRules, 'ask')
  if (askedArgRule) {
    return { kind: 'ask', reason: askedArgRule.reason || explain('ask', name, risk, `命中参数规则：${ruleSummary(askedArgRule)}`), risk, mcp, source: 'argument-ask' }
  }
  const askedHostRule = matchHostRules(name, args, config?.hostRules, 'ask')
  if (askedHostRule) {
    return { kind: 'ask', reason: askedHostRule.reason || explain('ask', name, risk, `命中主机规则：${askedHostRule.host}`), risk, mcp, source: 'host-ask' }
  }
  const allowedArgRule = matchArgRules(name, args, config?.argRules, 'allow')
  const allowedHostRule = matchHostRules(name, args, config?.hostRules, 'allow')
  if (allowedArgRule || allowedHostRule) {
    const matched = allowedArgRule || allowedHostRule
    return { kind: 'allow', reason: matched.reason || explain('allow', name, risk), risk, mcp, source: allowedArgRule ? 'argument-allow' : 'host-allow' }
  }

  // 7. Explicit per-tool policy short-circuits ordinary risk classification.
  if (matchPatterns(name, config?.askTools)) {
    return { kind: 'ask', reason: explain('ask', name, risk, '工具策略设置为「每次询问」'), risk, mcp, source: 'tool-ask' }
  }
  if (matchPatterns(name, config?.allowTools)) {
    return { kind: 'allow', reason: explain('allow', name, risk), risk, mcp, source: 'tool-allow' }
  }

  // 8. Risk rules: destructive calls require human approval; plain reads pass.
  //    (Network calls are intentionally `ask` too — the demo target.)
  if (risk === 'destructive' || risk === 'network') {
    return { kind: 'ask', reason: explain('ask', name, risk), risk, mcp, source: 'risk-default' }
  }

  // 9. Fallback for everything else.
  const fallback = ACTIONS.includes(config?.defaultAction) ? config.defaultAction : 'allow'
  if (fallback === 'deny') return { kind: 'deny', reason: explain('deny', name, risk, '未命中 allow 规则，按默认策略拒绝'), risk, mcp, source: 'global-default' }
  if (fallback === 'ask') return { kind: 'ask', reason: explain('ask', name, risk, '未命中 allow 规则，按默认策略需要审批'), risk, mcp, source: 'global-default' }
  return { kind: 'allow', reason: explain('allow', name, risk), risk, mcp, source: 'global-default' }
}

function matchSessionGrants(name, args, grants) {
  if (!Array.isArray(grants)) return null
  const host = extractHost(args)
  const targets = commonTargets(args) || []
  for (const grant of grants) {
    if (!grant || !matchPatterns(name, [grant.toolName])) continue
    if (grant.host && host === grant.host) return grant
    if (grant.target && targets.includes(grant.target)) return grant
  }
  return null
}

/** True when `name` matches any entry of a tool-name list (exact or trailing `*`). */
function matchPatterns(name, list) {
  return (list ?? []).some(tool => {
    const pattern = String(tool)
    return pattern === name || wildcardMatch(name, pattern)
  })
}

/** First matching per-argument rule, or null. */
function matchArgRules(name, args, rules, action) {
  if (!Array.isArray(rules)) return null
  for (const rule of rules) {
    if (!rule || !rule.action) continue
    if (action && rule.action !== action) continue
    if (rule.tool && !matchPatterns(name, [rule.tool])) continue
    if (rule.args && !matchArgs(args, rule.args)) continue
    return rule
  }
  return null
}

/** Every key in `expected` must match the call's arguments (strings: substring; others: strict). */
function matchArgs(actual, expected) {
  if (!actual || typeof actual !== 'object') return false
  for (const [key, value] of Object.entries(expected)) {
    const got = key === '$target' ? commonTargets(actual) : actual[key]
    if (got === undefined) return false
    if (typeof value === 'string' && Array.isArray(got)) {
      if (!got.some(item => typeof item === 'string' && item.includes(value))) return false
    } else if (typeof value === 'string' && typeof got === 'string') {
      if (!got.includes(value)) return false
    } else if (got !== value) {
      return false
    }
  }
  return true
}

function commonTargets(args) {
  const values = collectTargets(args)
  return values.length ? values : undefined
}

/** First matching per-host rule when the call carries a URL, or null. */
function matchHostRules(name, args, rules, action) {
  if (!Array.isArray(rules)) return null
  const host = extractHost(args)
  if (!host) return null
  for (const rule of rules) {
    if (!rule || !rule.action) continue
    if (action && rule.action !== action) continue
    if (rule.tool && !matchPatterns(name, [rule.tool])) continue
    if (rule.host && host !== rule.host && !host.endsWith(`.${rule.host}`)) continue
    return rule
  }
  return null
}

/** Compact human-readable summary of a matched rule, for the audit reason. */
function ruleSummary(rule) {
  const bits = []
  if (rule.tool) bits.push(`tool=${rule.tool}`)
  if (rule.host) bits.push(`host=${rule.host}`)
  if (rule.args) bits.push(`args=${JSON.stringify(rule.args)}`)
  return bits.join(' ')
}

/** Minimal `*` wildcard at the end of a deny/allow pattern, e.g. `mcp__git__*`. */
function wildcardMatch(name, pattern) {
  if (!pattern.endsWith('*')) return false
  return name.startsWith(pattern.slice(0, -1))
}

/**
 * Monotonic deny-only guard for `tools.guard`. Unlike the pre-execute
 * decision (which can `ask`), a guard can only deny — this is the defense-in-
 * depth layer that stays effective even if another listener reorders policy.
 * Returns a denial reason, or undefined to leave the call allowed.
 */
export function hardGuard(exec, config) {
  const decision = evaluateDecision(exec, config)
  if (decision.kind === 'deny') return decision.reason
  return undefined
}
