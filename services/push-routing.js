export function parseNotificationPayload(value) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch { return null }
}

// uni.onPushMessage documents both string and object callback data.
export function parseNotificationMessage(value) {
  const message = parseNotificationPayload(value)
  return message ? { ...message, payload: parseNotificationPayload(message.payload) } : null
}

// The API remains authoritative. This also suppresses an already queued message
// on the phone after account/server changes, before displaying private content.
export function acceptsNotification(payload, binding, session) {
  return notificationRejectionReason(payload, binding, session) === null
}

// Only return reason codes: never put tokens, CIDs or message content in logs.
export function notificationRejectionReason(payload, binding, session) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return 'invalid_payload'
  if (!binding) return 'missing_binding'
  if (binding.session !== session) return 'session_mismatch'
  if (typeof payload.user_id !== 'string' || !payload.user_id ||
      typeof payload.tenant_id !== 'string' || !payload.tenant_id) return 'missing_recipient_scope'
  if (payload.tenant_id !== binding.tenantId) return 'tenant_mismatch'
  if (payload.user_id !== binding.userId) return 'user_mismatch'
  return null
}
