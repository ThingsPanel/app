import assert from 'node:assert/strict'
import { buildMpBoardViewerUrl } from '../utils/mp-board-viewer.js'
const preview = { token: 'vis-test', platformToken: 'platform-test', addresses: {
  platformWebBase: 'https://example.test', thingsPanelApiBase: 'https://example.test/api/v1'
} }
const url = new URL(buildMpBoardViewerUrl('board-a', preview))
assert.equal(url.pathname, '/mp-device/index.html')
assert.equal(url.search, '')
assert.deepEqual(JSON.parse(new URLSearchParams(url.hash.slice(1)).get('launch')), {
  kind: 'board', boardId: 'board-a', title: '看板', token: 'platform-test', visToken: 'vis-test', lang: 'zh-CN'
})
assert.throws(() => buildMpBoardViewerUrl('a', { ...preview, platformToken: '' }), /认证/)
assert.throws(() => buildMpBoardViewerUrl('a', { ...preview, addresses: { ...preview.addresses, platformWebBase: 'https://other.test' } }), /同一服务/)
console.log('PASS: mini board opens authenticated host; credentials stay in fragment; cross-service mismatch rejected.')
