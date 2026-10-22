const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../uniCloud-aliyun/cloudfunctions/push-message-v2/index.js'), 'utf8');
async function check(name, body, provider, expected, count, authorization = "Bearer " + "x".repeat(32)) {
  let calls = 0;
  const scope = { exports: {}, require: name => name === "./config.private.json" ? {appId:"fixture-app",cloudToken:"x".repeat(32)} : require(name), uniCloud: { getPushManager: () => ({ sendMessage: async request => {
    calls++;
    assert.equal(request.push_clientid, 'fixture-cid');
    assert.equal(request.payload.alarm_id, 'fixture-alarm');
    return provider();
  } }) } };
  vm.runInNewContext(source, scope);
  const result = await scope.exports.main({ body, headers: {authorization} }, { APPID: 'fixture-app' });
  assert.equal(result.code, expected, name);
  assert.equal(calls, count, name);
  console.log(`PASS ${name}`);
}
(async () => {
  const body = JSON.stringify({ push_clientid: 'fixture-cid', title: 'local only', content: 'fixture', alarm_id: 'fixture-alarm' });
  await check('missing credential', body, () => { throw Error('must not send'); }, 401, 0, '');
  await check('wrong credential', body, () => { throw Error('must not send'); }, 401, 0, 'Bearer invalid');
  await check('batch CID', JSON.stringify({push_clientid:'a,b'}), () => { throw Error('must not send'); }, 400, 0);
  await check('accepted', body, () => ({ errCode: 0 }), 200, 1);
  await check('provider rejection', body, () => ({ errCode: 1001 }), 502, 1);
  await check('provider exception', body, () => { throw Error('fixture'); }, 500, 1);
  await check('missing provider confirmation', body, () => ({}), 502, 1);
  await check('missing CID', '{}', () => { throw Error('must not send'); }, 400, 0);
  await check('malformed JSON', '{', () => { throw Error('must not send'); }, 400, 0);
  await check('null JSON', 'null', () => { throw Error('must not send'); }, 400, 0);
})().catch(error => { console.error(error); process.exitCode = 1; });
