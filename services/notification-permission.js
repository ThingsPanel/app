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

let boundSession = '', binding = null
export async function registerNotificationDevice() {
  const session = `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`
  if (!uni.getStorageSync('access_token') || boundSession === session) return
  if (binding) { await binding; if (boundSession === session) return }
  binding = new Promise((resolve, reject) => uni.getPushClientId({
      async success(result) {
        try {
          if (!result.cid) throw new Error('Empty push CID')
          if (session !== `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`) return resolve()
          if (result.cid && uni.getStorageSync('access_token')) {
            const response = await api.apiRequest('/api/v1/message_push', {
              pushId: result.cid, deviceType: uni.getSystemInfoSync().platform
            }, 'post')
            if (Number(response?.code) !== 200) throw new Error(response?.message || 'Push binding failed')
            uni.setStorageSync('push_id', result.cid)
            logPushDebug('bind.success', { cid: result.cid })
            boundSession = session
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
