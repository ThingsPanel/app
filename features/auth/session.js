export const SESSION_STORAGE_KEYS = ['access_token', 'userWxInfo', 'isAuth', 'wx_code', 'push_id', 'push_binding']

export function isSessionExpiredCode(code) {
  return [401, 40100, 40101, 40102].includes(Number(code))
}

export function clearSessionStorage(storage) {
  storage = storage || { removeStorageSync: key => uni.removeStorageSync(key) }
  SESSION_STORAGE_KEYS.forEach(key => storage.removeStorageSync(key))
}
