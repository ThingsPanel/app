import assert from 'node:assert/strict'
import fs from 'node:fs'

async function loadModule(relativePath) {
  const source = fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8')
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
}

const { isNormalUser, isAdmin } = await loadModule('../features/auth/utils/role.js')
const { recentDevices } = await loadModule('../features/dashboard/metrics.js')

// 角色判断：只有 TENANT_USER 算普通用户，大小写与空格不影响结果
assert.equal(isNormalUser('TENANT_USER'), true)
assert.equal(isNormalUser(' tenant_user '), true)
assert.equal(isNormalUser('TENANT_ADMIN'), false)
assert.equal(isNormalUser('SYS_ADMIN'), false)
// 取不到角色时按非普通用户处理，避免误隐藏管理员的模块
for (const value of ['', '   ', null, undefined, 'UNKNOWN_ROLE']) {
  assert.equal(isNormalUser(value), false)
}

// 管理员判断：与 isNormalUser 相反，取不到角色时按非管理员处理（fail-closed），
// 否则「服务配置」入口会先对普通用户露出来再消失。
assert.equal(isAdmin('TENANT_ADMIN'), true)
assert.equal(isAdmin(' sys_admin '), true)
assert.equal(isAdmin('TENANT_USER'), false)
for (const value of ['', '   ', null, undefined, 'UNKNOWN_ROLE']) {
  assert.equal(isAdmin(value), false)
}
// roles 数组里带管理员角色也算
assert.equal(isAdmin('TENANT_USER', ['SYS_ADMIN']), true)
assert.equal(isAdmin('', ['tenant_admin']), true)
assert.equal(isAdmin('', ['EDITOR']), false)
assert.equal(isAdmin('', 'SYS_ADMIN'), false)

// 常用设备：ts 越大越靠前
const devices = [
  { id: 'a', ts: 100 },
  { id: 'b', ts: 300 },
  { id: 'c', ts: 200 }
]
assert.deepEqual(recentDevices(devices, 3).map(item => item.id), ['b', 'c', 'a'])
// 没有 ts（或 ts 非法）的设备排在后面，并保持接口原顺序
const mixed = [
  { id: 'no-ts-1' },
  { id: 'old', ts: 1 },
  { id: 'no-ts-2', ts: 'not-a-date' },
  { id: 'new', ts: '1970-01-01T00:00:10.000Z' }
]
assert.deepEqual(recentDevices(mixed, 4).map(item => item.id), ['new', 'old', 'no-ts-1', 'no-ts-2'])
// 截断与容错
assert.equal(recentDevices(devices, 2).length, 2)
assert.equal(recentDevices(devices, 0).length, 0)
assert.deepEqual(recentDevices(null, 3), [])
assert.deepEqual(recentDevices('oops', 3), [])
// 不修改入参顺序
assert.deepEqual(devices.map(item => item.id), ['a', 'b', 'c'])

console.log('Dashboard home checks passed: normal-user role detection and common-device ordering')
