const fs = require('node:fs'); const vm = require('node:vm'); const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../services/push-routing.js'),'utf8').replace(/export /g,'');
const scope={};vm.runInNewContext(source,scope);
const payload={user_id:'u1',tenant_id:'t1',alarm_id:'alarm'}; const binding={userId:'u1',tenantId:'t1',session:'local|token'};
assert.equal(scope.acceptsNotification(payload,binding,'local|token'),true);
for(const [p,b,s] of [[payload,binding,'other|token'],[{...payload,user_id:'u2'},binding,'local|token'],[{...payload,tenant_id:'t2'},binding,'local|token'],[payload,null,'local|token'],[{},binding,'local|token']]) assert.equal(scope.acceptsNotification(p,b,s),false);
assert.equal(scope.parseNotificationPayload('{'),null);
assert.equal(scope.parseNotificationPayload(JSON.stringify(payload)).alarm_id,'alarm');
console.log('PASS notification account/server/tenant isolation and invalid payload');
