import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const body = fs.readFileSync('pages/dashboard/search.vue','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm,'')
const pending=[]
let destination=''
const c=vm.runInNewContext(body.replace('export default','globalThis.c =')+'; c',{AppSearch:{},setTimeout,clearTimeout,createBoardsClient:()=>({dashboards:params=>new Promise((resolve,reject)=>pending.push({params,resolve,reject}))}),uni:{navigateTo:options=>destination=options.url}})
const s={...c.data()};for(const [k,v]of Object.entries(c.methods))s[k]=v.bind(s)
const old=s.load(true);s.keyword='环境';const current=s.load(true)
assert.equal(pending[1].params.keyword,'环境');assert.equal(pending[1].params.projectId,undefined)
pending[1].resolve({data:[{id:'a',name:'环境'}],meta:{total:21,totalPages:2}});await current
pending[0].resolve({data:[{id:'stale'}],meta:{total:1,totalPages:1}});await old
assert.equal(s.rows[0].id,'a')
const more=s.load(false);pending[2].reject(new Error('offline'));await more;assert.equal(s.page,1);assert.equal(s.rows.length,1)
const retry=s.load(false);pending[3].resolve({data:[{id:'b'}],meta:{total:21,totalPages:2}});await retry;assert.equal(s.rows.length,2)
s.openBoard({id:'a/b',name:'A & B'});assert.ok(destination.includes('id=a%2Fb'));assert.ok(destination.includes('name=A%20%26%20B'))
const last=s.load(true);c.onUnload.call(s);pending[4].resolve({data:[{id:'late'}]});await last;assert.equal(s.rows.length,0)
console.log('Search: name query, stale responses, incremental retry, encoded navigation and unload passed.')
