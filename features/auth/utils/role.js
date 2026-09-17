// 角色来自用户资料里的 authority 字段：
//   TENANT_USER  普通用户（无设备分组数据，首页分组模块只会是空态）
//   TENANT_ADMIN 租户管理员 / SYS_ADMIN 系统管理员
const NORMAL_USER_AUTHORITY = 'TENANT_USER'
const ADMIN_AUTHORITIES = new Set(['SYS_ADMIN', 'TENANT_ADMIN'])

/**
 * 是否为普通用户。
 *
 * 取不到角色（空值、未知值、接口失败）时一律按「非普通用户」处理：
 * 宁可多显示一个模块，也不要因为拿不到角色就误隐藏管理员的数据。
 */
export function isNormalUser(authority) {
  return String(authority ?? '').trim().toUpperCase() === NORMAL_USER_AUTHORITY
}

/**
 * 是否为管理员（系统管理员 / 租户管理员）。
 *
 * 与 isNormalUser 相反，这里取不到角色时按「非管理员」处理（fail-closed）：
 * 管理员专属入口不能因为资料还没回来就先对普通用户露出来。
 */
export function isAdmin(authority, roles) {
  const matches = value => ADMIN_AUTHORITIES.has(String(value ?? '').trim().toUpperCase())
  if (matches(authority)) return true
  return Array.isArray(roles) && roles.some(matches)
}
