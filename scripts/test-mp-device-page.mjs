import assert from 'node:assert/strict'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { buildMiniDeviceUrl, checkMiniDeviceEntry } from '../utils/mp-device-url.js'

const options={deviceId:'device a',token:'test-only',platformWebBase:'https://example.test',thingsPanelApiBase:'https://example.test/api/v1'}
const url=new URL(buildMiniDeviceUrl(options))
assert.equal(url.pathname,'/mp-device/index.html')
assert.equal(url.search,'')
assert.equal(JSON.parse(new URLSearchParams(url.hash.slice(1)).get('launch')).deviceId,'device a')
assert.throws(()=>buildMiniDeviceUrl({...options,token:''}),/登录/)
assert.throws(()=>buildMiniDeviceUrl({...options,platformWebBase:'http://example.test'}),/HTTPS/)
assert.throws(()=>buildMiniDeviceUrl({...options,platformWebBase:'https://other.test'}),/同一服务/)

let probe
const deviceHtml = '<div id="mp-device"></div><script>window.__mpDeviceLaunch = location.hash.slice(1)</script>'
await checkMiniDeviceEntry(url.href, request => { probe=request; request.success({ statusCode:200, data:deviceHtml }) })
assert.equal(new URL(probe.url).hash, '')
assert.equal(new URL(probe.url).pathname, '/mp-device/index.html')
assert.ok(!probe.url.includes('test-only'))
assert.deepEqual(probe.header, { Accept:'text/html' })
for (const response of [{statusCode:200,data:'<div id="app"></div>'},{statusCode:404,data:deviceHtml},{statusCode:200,data:{code:401}}]) {
  await assert.rejects(checkMiniDeviceEntry(url.href, request => request.success(response)), /尚未更新/)
}
await assert.rejects(checkMiniDeviceEntry(url.href, request => request.fail()), /网络/)

function preprocess(source, platform) {
  const stack=[true]
  return source.split(/\r?\n/).filter(line=>{
    const directive=line.match(/(?:\/\/|<!--)\s*#(ifdef|ifndef|endif)\s*(.*?)(?:-->)?\s*$/)
    if(!directive)return stack.at(-1)
    if(directive[1]==='endif'){stack.pop();return false}
    const enabled=directive[2].trim().split(/\s*\|\|\s*/).some(name=>name===platform)
    stack.push(stack.at(-1) && (directive[1]==='ifdef'?enabled:!enabled));return false
  }).join('\n').replace(/,\s*}/g,'}').replace(/\s+/g,'')
}
for(const file of ['pages/devices/detail.vue','pages.json']) {
  const before=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'})
  const after=fs.readFileSync(file,'utf8')
  for(const platform of ['APP-PLUS','H5']) assert.equal(preprocess(after,platform),preprocess(before,platform),`${file}: existing ${platform} output must remain unchanged`)
}
console.log('PASS: mini launch URL validation; native App and original H5 detail/page registry unchanged after conditional compilation.')
