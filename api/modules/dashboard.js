import api from '@/api/request'

export const getDeviceTrend = (params) => api.apiRequest('/api/v1/board/trend', params, 'GET')

export const getGroupStatistics = (id) => api.apiRequest(`/api/v1/device/group/detail/${encodeURIComponent(id)}`, null, 'GET')

// 当前登录账号的资料（含 authority 角色字段），首页据此决定分组模块是否可见
export const getUserProfile = () => api.apiRequest('/api/v1/board/user/info', null, 'GET')
