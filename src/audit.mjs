// Session-level, append-only MCP audit trail.

import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { redactSensitive, snapshotArguments, summarizeArguments } from './shared.mjs'

const nowIso = () => new Date().toISOString()

export function createAuditStore(config = {}) {
  const stateDir = resolve(String(config.auditDir || '.dsh-mcp-firewall'))
  const file = join(stateDir, 'audit.jsonl')
  const memory = []
  let chain = Promise.resolve()
  const ready = readFile(file, 'utf8').then(text => {
    for (const line of text.split(/\r?\n/).filter(Boolean).slice(-5000)) {
      try { memory.push(JSON.parse(line)) } catch { /* keep valid records */ }
    }
  }).catch(error => {
    if (error?.code !== 'ENOENT') throw error
  })

  function record(entry) {
    const record = {
      id: randomUUID(),
      time: nowIso(),
      ...entry,
    }
    memory.push(record)
    if (memory.length > 5000) memory.shift()
    chain = chain.catch(() => undefined).then(async () => {
      await ready
      await mkdir(stateDir, { recursive: true })
      await appendFile(file, `${JSON.stringify(record)}\n`, 'utf8')
    })
    return record
  }

  /** Record a pre-execute decision for one pending tool call. */
  function decision(exec, decisionValue, conversation = {}) {
    return record({
      phase: 'pre-execute',
      callId: exec?.callId,
      rootCallId: exec?.rootCallId,
      agentId: exec?.agent?.id,
      name: exec?.name,
      arguments: redactSensitive(snapshotArguments(exec?.arguments)),
      kind: decisionValue?.kind,
      risk: decisionValue?.risk,
      reason: decisionValue?.reason,
      policySource: decisionValue?.source,
      ...conversation,
    })
  }

  /** Record the frozen final outcome of an executed tool call. */
  function result(exec, resultValue, conversation = {}) {
    const resultSummary = summarizeArguments(redactSensitive({
      error: resultValue?.error?.message || resultValue?.error?.name,
      content: resultValue?.isError ? resultValue?.content : undefined,
    }), 1200)
    return record({
      phase: 'result',
      callId: exec?.callId,
      rootCallId: exec?.rootCallId,
      agentId: exec?.agent?.id,
      name: exec?.name,
      isError: Boolean(resultValue?.isError),
      errorName: resultValue?.error?.name,
      ...(resultValue?.isError ? { resultSummary } : {}),
      ...conversation,
    })
  }

  /** Record the user's exact answer to an approval request. */
  function approval(request, outcome, conversation = {}) {
    return record({
      phase: 'approval',
      callId: request?.callId,
      agentId: request?.agent?.id,
      name: request?.toolName,
      outcome,
      reason: request?.reason,
      ...conversation,
    })
  }

  /** Record a policy edit so permission changes are reviewable too. */
  function policy(change) {
    return record({ phase: 'policy', ...change })
  }

  /** Reconstruct one session's `tool/call` → `tool/result` pairs from persistence. */
  async function exportSession(sessionPersistence, sessionId) {
    const inspection = await sessionPersistence.inspect(sessionId)
    const calls = new Map()
    const rows = []
    for (const event of inspection.events) {
      if (event.type === 'tool/call') {
        calls.set(event.data.callId, {
          callId: event.data.callId,
          name: event.data.name,
          arguments: event.data.arguments,
          turn: event.data.turn,
          step: event.data.step,
        })
      } else if (event.type === 'tool/result') {
        const call = calls.get(event.data?.message?.source?.callId ?? event.data?.message?.toolCallId ?? event.data?.callId)
        rows.push({
          ...(call ?? {}),
          resultError: event.data?.error,
          resultMeta: event.data?.meta,
        })
      }
    }
    return rows
  }

  async function flush() {
    await ready
    await chain
  }

  return {
    file,
    memory: () => memory.slice(),
    record,
    decision,
    result,
    approval,
    policy,
    exportSession,
    flush,
    ready,
    summarizeArguments,
  }
}
