const OUTCOMES = new Set(['allowed-once', 'rejected', 'cancelled', 'unavailable'])

export function approvalKey(sessionId, callId) {
  const session = String(sessionId || '').trim()
  const call = String(callId || '').trim()
  return session && call ? `${session}\u0000${call}` : ''
}

export function createApprovalQueue(options = {}) {
  let timeoutMs = normalizeTimeoutMs(options.timeoutMs)
  const now = options.now || (() => Date.now())
  const schedule = options.schedule || setTimeout
  const cancelSchedule = options.cancelSchedule || clearTimeout
  const onSettled = options.onSettled || (() => undefined)
  const pending = new Map()

  function wait(request, context = {}) {
    const sessionId = String(context.sessionId || request?.agent?.session?.id || request?.agent?.id || '')
    const callId = String(request?.callId || '')
    const key = approvalKey(sessionId, callId)
    if (!key) return Promise.resolve('unavailable')
    if (pending.has(key)) return pending.get(key).promise

    const createdMs = now()
    let finish
    const promise = new Promise(resolve => { finish = resolve })
    const entry = {
      key,
      sessionId,
      callId,
      toolName: String(request?.toolName || ''),
      reason: String(request?.reason || ''),
      createdAt: new Date(createdMs).toISOString(),
      createdMs,
      expiresAt: null,
      expiresMs: null,
      promise,
      request,
      context,
      timer: null,
      onAbort: null,
      processing: false,
      processingAction: null,
    }
    applyDeadline(entry)
    entry.settle = (outcome, metadata = {}) => {
      if (!OUTCOMES.has(outcome) || pending.get(key) !== entry) return false
      pending.delete(key)
      if (entry.timer) cancelSchedule(entry.timer)
      request?.signal?.removeEventListener?.('abort', entry.onAbort)
      try { onSettled({ entry: publicEntry(entry), request, context, outcome, metadata }) } catch { /* audit must not strand the tool call */ }
      finish(outcome)
      return true
    }
    entry.onAbort = () => entry.settle('cancelled', { source: 'abort', action: 'cancelled' })
    pending.set(key, entry)
    arm(entry)
    if (request?.signal?.aborted) entry.onAbort()
    else request?.signal?.addEventListener?.('abort', entry.onAbort, { once: true })
    return promise
  }

  function settle(key, outcome, metadata = {}) {
    return pending.get(key)?.settle(outcome, metadata) ?? false
  }

  async function decide(key, outcome, metadata = {}, prepare = () => undefined) {
    const entry = pending.get(key)
    if (!entry || entry.processing || !OUTCOMES.has(outcome)) return false
    entry.processing = true
    entry.processingAction = String(metadata.action || '')
    pause(entry)
    try {
      await prepare(publicEntry(entry))
    } catch (error) {
      if (pending.get(key) === entry) {
        entry.processing = false
        entry.processingAction = null
        if (entry.request?.signal?.aborted) entry.settle('cancelled', { source: 'abort', action: 'cancelled' })
        else resume(entry)
      }
      throw error
    }
    if (pending.get(key) !== entry) return false
    if (entry.request?.signal?.aborted) {
      entry.processing = false
      entry.processingAction = null
      entry.settle('cancelled', { source: 'abort', action: 'cancelled' })
      return false
    }
    return entry.settle(outcome, metadata)
  }

  function list() {
    return [...pending.values()].map(publicEntry)
  }

  function get(key) {
    const entry = pending.get(key)
    return entry ? publicEntry(entry) : undefined
  }

  function dispose() {
    for (const entry of [...pending.values()]) entry.settle('cancelled', { source: 'dispose', action: 'cancelled' })
  }

  function setTimeoutMs(value) {
    timeoutMs = normalizeTimeoutMs(value)
    for (const entry of [...pending.values()]) {
      if (entry.timer !== null) cancelSchedule(entry.timer)
      entry.timer = null
      applyDeadline(entry)
      if (entry.processing) continue
      if (entry.expiresMs !== null && entry.expiresMs <= now()) {
        entry.settle('rejected', { source: 'timeout', action: 'timeout' })
      } else {
        arm(entry)
      }
    }
    return timeoutMs
  }

  function pause(entry) {
    if (entry.timer !== null) cancelSchedule(entry.timer)
    entry.timer = null
    entry.request?.signal?.removeEventListener?.('abort', entry.onAbort)
  }

  function applyDeadline(entry) {
    entry.expiresMs = timeoutMs > 0 ? entry.createdMs + timeoutMs : null
    entry.expiresAt = entry.expiresMs === null ? null : new Date(entry.expiresMs).toISOString()
  }

  function arm(entry) {
    if (entry.expiresMs === null) return
    const remaining = Math.max(0, entry.expiresMs - now())
    const expectedExpiry = entry.expiresMs
    entry.timer = schedule(() => {
      if (pending.get(entry.key) === entry && !entry.processing && entry.expiresMs === expectedExpiry) {
        entry.settle('rejected', { source: 'timeout', action: 'timeout' })
      }
    }, remaining)
  }

  function resume(entry) {
    arm(entry)
    entry.request?.signal?.addEventListener?.('abort', entry.onAbort, { once: true })
  }

  return { wait, settle, decide, list, get, dispose, setTimeoutMs, size: () => pending.size, timeoutMs: () => timeoutMs }
}

function normalizeTimeoutMs(value) {
  return Number.isFinite(value) && value >= 0 ? value : 10 * 60_000
}

function publicEntry(entry) {
  return {
    key: entry.key,
    sessionId: entry.sessionId,
    callId: entry.callId,
    toolName: entry.toolName,
    reason: entry.reason,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    processing: entry.processing,
    processingAction: entry.processingAction,
  }
}
