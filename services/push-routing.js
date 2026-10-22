export function parseNotificationPayload(value) {
  try { return typeof value === 'string' ? JSON.parse(value) : value } catch { return null }
}

// The API remains authoritative. This also suppresses an already queued message
// on the phone after account/server changes, before displaying private content.
export function acceptsNotification(payload, binding, session) {
  if (!payload || !binding || binding.session !== session) return false
  return Boolean(payload.user_id && payload.tenant_id &&
    payload.user_id === binding.userId && payload.tenant_id === binding.tenantId)
}
