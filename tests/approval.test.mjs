import { test } from 'node:test'
import assert from 'node:assert/strict'

import { approvalKey, createApprovalQueue } from '../src/approval.mjs'

function request(signal) {
  return { toolName: 'mcp__web__fetch', callId: 'call-1', reason: '未知主机', signal, agent: { id: 'agent-1' } }
}

test('仅本次同意会恢复当前调用并清空待审队列', async () => {
  const settled = []
  const queue = createApprovalQueue({ timeoutMs: 0, onSettled: event => settled.push(event) })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  const key = approvalKey('session-1', 'call-1')
  assert.equal(queue.size(), 1)
  assert.equal(queue.settle(key, 'allowed-once', { action: 'allow-once', source: 'dashboard' }), true)
  assert.equal(await outcome, 'allowed-once')
  assert.equal(queue.size(), 0)
  assert.equal(settled[0].metadata.action, 'allow-once')
})

test('拒绝只终止当前调用，后续由工具管线把拒绝结果交回 Agent', async () => {
  const queue = createApprovalQueue({ timeoutMs: 0 })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  assert.equal(queue.settle(approvalKey('session-1', 'call-1'), 'rejected', { action: 'reject' }), true)
  assert.equal(await outcome, 'rejected')
})

test('等待超时会自动拒绝，避免会话永久挂起', async () => {
  let scheduled
  const queue = createApprovalQueue({
    timeoutMs: 600_000,
    now: () => Date.parse('2026-08-24T00:00:00Z'),
    schedule: callback => { scheduled = callback; return 1 },
    cancelSchedule: () => undefined,
  })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  scheduled()
  assert.equal(await outcome, 'rejected')
  assert.equal(queue.size(), 0)
})

test('关闭自动拒绝会取消现有倒计时并保留待审调用', async () => {
  let scheduled
  const queue = createApprovalQueue({
    timeoutMs: 600_000,
    now: () => Date.parse('2026-08-24T00:00:00Z'),
    schedule: callback => { scheduled = callback; return 1 },
    cancelSchedule: () => undefined,
  })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  const key = approvalKey('session-1', 'call-1')
  queue.setTimeoutMs(0)
  assert.equal(queue.get(key).expiresAt, null)
  scheduled()
  assert.equal(queue.size(), 1)
  queue.settle(key, 'rejected', { action: 'reject' })
  assert.equal(await outcome, 'rejected')
})

test('缩短策略时长会立即拒绝已经超过新时限的待审调用', async () => {
  let current = Date.parse('2026-08-24T00:00:00Z')
  const settled = []
  const queue = createApprovalQueue({
    timeoutMs: 600_000,
    now: () => current,
    schedule: () => 1,
    cancelSchedule: () => undefined,
    onSettled: event => settled.push(event),
  })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  current += 6 * 60_000
  queue.setTimeoutMs(5 * 60_000)
  assert.equal(await outcome, 'rejected')
  assert.equal(settled[0].metadata.action, 'timeout')
  assert.equal(settled[0].metadata.source, 'timeout')
})

test('调用取消会关闭对应审批，迟到操作不能再次处理', async () => {
  const controller = new AbortController()
  const queue = createApprovalQueue({ timeoutMs: 0 })
  const outcome = queue.wait(request(controller.signal), { sessionId: 'session-1' })
  controller.abort()
  assert.equal(await outcome, 'cancelled')
  assert.equal(queue.settle(approvalKey('session-1', 'call-1'), 'allowed-once'), false)
})

test('并发审批只有第一个操作能占用并完成请求', async () => {
  let release
  const gate = new Promise(resolve => { release = resolve })
  const queue = createApprovalQueue({ timeoutMs: 0 })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  const key = approvalKey('session-1', 'call-1')
  const first = queue.decide(key, 'rejected', { action: 'reject-tool' }, () => gate)
  assert.equal(queue.get(key).processing, true)
  assert.equal(queue.get(key).processingAction, 'reject-tool')
  assert.equal(await queue.decide(key, 'allowed-once', { action: 'allow-once' }), false)
  release()
  assert.equal(await first, true)
  assert.equal(await outcome, 'rejected')
})

test('策略保存失败会释放占用并让审批继续可用', async () => {
  const queue = createApprovalQueue({ timeoutMs: 0 })
  const outcome = queue.wait(request(), { sessionId: 'session-1' })
  const key = approvalKey('session-1', 'call-1')
  await assert.rejects(queue.decide(key, 'rejected', { action: 'reject-tool' }, () => { throw new Error('disk full') }), /disk full/)
  assert.equal(queue.get(key).processing, false)
  assert.equal(await queue.decide(key, 'allowed-once', { action: 'allow-once' }), true)
  assert.equal(await outcome, 'allowed-once')
})
