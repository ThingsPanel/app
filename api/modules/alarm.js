import api from '@/api/request'
import { readAlarmHistory, readAlarmDeviceCount, readAlarmOccurrenceCount, scopedAlarmRequest } from '@/services/alarm-reading'
import { loadAlarmDetail } from '@/services/alarm-detail'

function requestForSession() {
  return scopedAlarmRequest(api.apiRequest, () => JSON.stringify([uni.getStorageSync('serverAddress'), uni.getStorageSync('access_token')]))
}
export const alarmOccurrenceCount = (range) => readAlarmOccurrenceCount(requestForSession(), range)
export const alarmDeviceCount = () => readAlarmDeviceCount(requestForSession())
export const alarmDetail = (id) => loadAlarmDetail(requestForSession(), id)

/** 创建告警规则 */
export const createAlarmRule = (params) => {
  return api.apiRequest('/api/v1/alarm/config', params, 'POST')
}

  /** 配置告警列表 */
export const getAlarmRules = (params) => {
  return api.apiRequest('/api/v1/alarm/config', params, 'GET')
}

  /** 告警配置编辑:启用停止 */
export const updateAlarmRule = (params) => {
  return api.apiRequest('/api/v1/alarm/config', params, 'PUT')
}

/** 删除告警规则 */
export const deleteAlarmRule = (id) => {
  return api.apiRequest(`/api/v1/alarm/config/${id}`, {}, 'DELETE')
}

  /** 告警信息列表 */
  export const infoList = (params) => {
    return api.apiRequest('/api/v1/alarm/info', params, 'GET');
  };

  /** 告警历史列表 */
  export const alarmHistory = (params) => {
    return readAlarmHistory(requestForSession(), params);
  };

  /** 告警信息处理 */
  export const processingOperation = (params) => {
    return api.apiRequest('/api/v1/alarm/info', params, 'PUT');
  };

  /** 告警信息批量处理 */
  export const batchProcessing = (params) => {
    return api.apiRequest('/api/v1/alarm/info/batch', params, 'PUT');
  };
