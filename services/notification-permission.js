import api from '@/api/request'
import { logPushDebug, pushDebugError } from './push-debug'

export function notificationPermission() {
  try {
    const state = uni.getAppAuthorizeSetting().notificationAuthorized
    return ['authorized', 'denied', 'not determined'].includes(state) ? state : 'unknown'
  } catch { return 'unknown' }
}

export function canRegisterPushAutomatically() {
  // With iOS manual registration, retrieving CID can display the system prompt.
  // Let the user choose this from the notification guide instead of login.
  // #ifdef APP-PLUS
  if (uni.getSystemInfoSync().platform === 'ios') return notificationPermission() === 'authorized'
  // #endif
  return true
}

let boundSession = '', boundAt = 0, binding = null
export function resetNotificationBinding() { boundSession = ''; boundAt = 0; uni.removeStorageSync('push_binding') }
function installationId() {
 let id = uni.getStorageSync('push_installation_id')
 if (!id) { id = `install-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; uni.setStorageSync('push_installation_id', id) }
 return id
}
export async function registerNotificationDevice() {
  const session = `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`
  if (!uni.getStorageSync('access_token') || boundSession === session && Date.now() - boundAt < 60000) return
  if (binding) { await binding; if (boundSession === session && Date.now() - boundAt < 60000) return }
  binding = new Promise((resolve, reject) => uni.getPushClientId({
      async success(result) {
        try {
          if (!result.cid) throw new Error('Empty push CID')
          if (session !== `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`) return resolve()
          if (result.cid && uni.getStorageSync('access_token')) {
            const response = await api.apiRequest('/api/v1/message_push', {
              pushId: result.cid, deviceType: uni.getSystemInfoSync().platform, appId: '__UNI__71E31D5', installationId: installationId()
            }, 'post')
            if (Number(response?.code) !== 200) throw new Error(response?.message || 'Push binding failed')
            if (session !== `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`) return resolve()
            if (!response.data?.bindingId || !response.data?.userId || !response.data?.tenantId) throw new Error('Server does not support session-bound App notifications')
            uni.setStorageSync('push_id', result.cid)
            uni.setStorageSync('push_binding', { ...response.data, session })
            logPushDebug('bind.success', { bindingId: response.data?.bindingId })
            boundSession = session; boundAt = Date.now()
          }
          resolve()
        } catch (error) { reject(error) }
      }, fail: reject
    }))
  try { await binding } finally { binding = null }
}

export async function enableNotifications() {
  if (notificationPermission() === 'not determined') {
    await registerNotificationDevice()
  } else {
    await new Promise((resolve, reject) => uni.openAppAuthorizeSetting({ success: resolve, fail: reject }))
  }
}

export function logNotificationError(error) { logPushDebug('permission.failed', pushDebugError(error), 'error') }
