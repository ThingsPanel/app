const fs = require('node:fs'); const vm = require('node:vm'); const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../services/push-routing.js'),'utf8').replace(/export /g,'');
const scope={};vm.runInNewContext(source,scope);
const payload={user_id:'u1',tenant_id:'t1',alarm_id:'alarm'}; const binding={userId:'u1',tenantId:'t1',session:'local|token'};
assert.equal(scope.acceptsNotification(payload,binding,'local|token'),true);
for(const [p,b,s] of [[payload,binding,'other|token'],[{...payload,user_id:'u2'},binding,'local|token'],[{...payload,tenant_id:'t2'},binding,'local|token'],[payload,null,'local|token'],[{},binding,'local|token']]) assert.equal(scope.acceptsNotification(p,b,s),false);
assert.equal(scope.parseNotificationPayload('{'),null);
assert.equal(scope.parseNotificationPayload(JSON.stringify(payload)).alarm_id,'alarm');
for (const value of [null, 'null', '[]', '42', '"text"', [], false]) assert.equal(scope.parseNotificationPayload(value), null);
for (const inner of [payload, JSON.stringify(payload)]) {
  const data = {title:'New tenant test', content:'fixture', payload:inner};
  for (const outer of [data, JSON.stringify(data)]) {
    const message = scope.parseNotificationMessage(outer);
    assert.equal(message.title, data.title);
    assert.equal(message.content, data.content);
    assert.equal(scope.acceptsNotification(message.payload, binding, 'local|token'), true);
    assert.equal(scope.acceptsNotification(message.payload, {...binding,tenantId:'other'}, 'local|token'), false);
    assert.equal(scope.acceptsNotification(message.payload, {...binding,userId:'other'}, 'local|token'), false);
    assert.equal(scope.acceptsNotification(message.payload, binding, 'other|token'), false);
  }
}
assert.equal(scope.parseNotificationMessage('{'), null);
assert.equal(scope.notificationRejectionReason(null,binding,'local|token'),'invalid_payload');
assert.equal(scope.notificationRejectionReason(payload,null,'local|token'),'missing_binding');
assert.equal(scope.notificationRejectionReason(payload,binding,'other|token'),'session_mismatch');
assert.equal(scope.notificationRejectionReason({},binding,'local|token'),'missing_recipient_scope');
assert.equal(scope.notificationRejectionReason({...payload,tenant_id:'t2'},binding,'local|token'),'tenant_mismatch');
assert.equal(scope.notificationRejectionReason({...payload,user_id:'u2'},binding,'local|token'),'user_mismatch');
console.log('PASS notification account/server/tenant isolation and invalid payload');
