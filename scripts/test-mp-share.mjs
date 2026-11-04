import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../services/mp-share.js', import.meta.url), 'utf8')
const coverManifest = JSON.parse(fs.readFileSync(new URL('../static/mp-weixin/share/cover-manifest.json', import.meta.url), 'utf8'))
const copies = []
const wx = { env: { USER_DATA_PATH:'wxfile://usr' }, getFileSystemManager: () => ({ copyFile(options) { copies.push(options) } }) }
const create = () => vm.runInNewContext(source.replace(/^import .*$/gm, '').replaceAll('export ', '') + '; ({prepareShareImage, SHARE_IMAGES})', { wx, coverManifest })
const sharing = create()
const first = sharing.prepareShareImage(), second = sharing.prepareShareImage()
assert.equal(first, second, 'concurrent menu openings share one image preparation')
assert.equal(copies.length, 1)
assert.equal(copies[0].srcPath, 'static/mp-weixin/share/home-card.jpg')
assert.equal(copies[0].destPath, `wxfile://usr/thingspanel-share-message-${coverManifest.revision}.jpg`)
copies[0].success()
assert.equal(await first, copies[0].destPath)
await sharing.prepareShareImage()
assert.equal(copies.length, 1, 'a ready image does not need copying on every onShow')
const timeline = sharing.prepareShareImage('timeline')
assert.equal(copies[1].srcPath, 'static/mp-weixin/share/home-timeline.jpg')
assert.equal(copies[1].destPath, `wxfile://usr/thingspanel-share-timeline-${coverManifest.revision}.jpg`)
copies[1].success()
assert.equal(await timeline, copies[1].destPath, 'timeline has an independent square cover')

const retrying = create()
const failed = retrying.prepareShareImage()
copies[2].fail({ errMsg:'copy failed' })
assert.equal(await failed, retrying.SHARE_IMAGES.message, 'file errors preserve a usable packaged cover')
const retry = retrying.prepareShareImage()
assert.equal(copies.length, 4, 'failed preparation can be retried')
copies[3].success()
assert.equal(await retry, copies[3].destPath)
wx.getFileSystemManager = () => { throw new Error('unavailable') }
const unavailable = create()
assert.equal(await unavailable.prepareShareImage(), unavailable.SHARE_IMAGES.message, 'an unavailable file API cannot break the homepage')
console.log('Mini share: image preparation, concurrent requests, reuse, failure fallback and retry passed.')
