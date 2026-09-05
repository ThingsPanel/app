import api from '@/api/request'

export const getDeviceTrend = (params) => api.apiRequest('/api/v1/board/trend', params, 'GET')

export const getGroupStatistics = (id) => api.apiRequest(`/api/v1/device/group/detail/${encodeURIComponent(id)}`, null, 'GET')
