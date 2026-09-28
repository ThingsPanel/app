import api from '@/api/request'

/** 获取通知组列表。告警规则只能关联已存在的通知组。 */
export const getNotificationGroups = (params) => {
  return api.apiRequest('/api/v1/notification_group/list', params, 'GET')
}
