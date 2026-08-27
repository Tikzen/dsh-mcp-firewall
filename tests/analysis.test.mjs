import { test } from 'node:test'
import assert from 'node:assert/strict'

import { analyzeWithDsh, buildLocalAnalysis } from '../src/analysis.mjs'

test('本地分析能区分防火墙阻止和 MCP 执行报错', () => {
  const denied = buildLocalAnalysis({ name: 'mcp__filesystem__write_file', tool: 'write_file', target: 'C:\\Windows\\hosts', kind: 'deny', reason: '越界' })
  assert.match(denied.intent, /写入或修改/)
  assert.match(denied.finding, /尚未发出/)

  const failed = buildLocalAnalysis({ name: 'mcp__web__fetch', tool: 'fetch', target: 'https://example.com', kind: 'allow', result: 'error', resultSummary: '403 Forbidden' })
  assert.match(failed.intent, /访问网络目标/)
  assert.match(failed.finding, /403 Forbidden/)
})

test('没有模型服务时 AI 分析安全降级为本地分析', async () => {
  const result = await analyzeWithDsh({ get: () => undefined }, { name: 'mcp__fs__read_file', tool: 'read_file', target: 'README.md', kind: 'allow' })
  assert.equal(result.source, 'local')
  assert.match(result.note, /没有可用/)
})

test('对话原模型失效时会尝试 DSH 当前默认模型', async () => {
  const llm = {
    async *stream(options) {
      if (options.provider === 'old-provider') {
        yield { type: 'finish', reason: { kind: 'error', failure: { message: 'old route gone' } } }
        return
      }
      yield { type: 'text-delta', index: 0, text: JSON.stringify({ summary: '调用摘要', intent: '读取问题列表', finding: '没有报错', risk: '低风险', nextSteps: ['保持只读'] }) }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  const ctx = { get: name => name === 'llm' ? llm : name === 'agentDefaultModel' ? { currentSelection: () => ({ provider: 'current-provider', model: 'current-model' }) } : undefined }
  const result = await analyzeWithDsh(ctx, { provider: 'old-provider', model: 'old-model', name: 'mcp__github__list_issues', tool: 'list_issues', kind: 'allow' })
  assert.equal(result.source, 'ai')
  assert.equal(result.model, 'current-provider/current-model')
  assert.equal(result.intent, '读取问题列表')
})
