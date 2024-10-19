import api from '@/API/'

// 获取设备列表下拉菜单
export const deviceListAll = (params) => {
    return api.apiRequest('/api/v1/device/tenant/list', params, 'GET');
  };
  
  // 获取设备配置下拉菜单
  export const deviceConfigAll = (params) => {
    return api.apiRequest('/api/v1/device_config/menu', params, 'GET');
  };
  
  // 单个设备条件选择下拉菜单
  export const deviceMetricsConditionMenu = (params) => {
    return api.apiRequest('/api/v1/device/metrics/condition/menu', params, 'GET');
  };
  
  // 单类设备条件选择下拉菜单
  export const configMetricsConditionMenu = (params) => {
    return api.apiRequest('/api/v1/device_config/metrics/condition/menu', params, 'GET');
  };
  
  // 单个设备动作选择下拉菜单
  export const deviceMetricsMenu = (params) => {
    return api.apiRequest('/api/v1/device/metrics/menu', params, 'GET');
  };
  
  // 单类设备动作选择下拉菜单
  export const deviceConfigMetricsMenu = (params) => {
    return api.apiRequest('/api/v1/device_config/metrics/menu', params, 'GET');
  };
  
  // 创建场景
  export const sceneAdd = (params) => {
    return api.apiRequest('/api/v1/scene', params, 'POST');
  };
  
  // 修改场景
  export const sceneEdit = (params) => {
    return api.apiRequest('/api/v1/scene', params, 'PUT');
  };
  
  // 获取场景列表
  export const sceneGet = (params) => {
    return api.apiRequest('/api/v1/scene', params, 'GET');
  };
  
  // 删除场景
  export const sceneDel = (id) => {
    return api.apiRequest(`/api/v1/scene/${id}`, null, 'DELETE');
  };
  
  // 获取场景详情
  export const sceneInfo = (id) => {
    return api.apiRequest(`/api/v1/scene/detail/${id}`, null, 'GET');
  };
  
  // 获取场景日志
  export const sceneLog = (params) => {
    return api.apiRequest('/api/v1/scene/log', params, 'GET');
  };
  
  // 激活场景
  export const sceneActive = (id) => {
    return api.apiRequest(`/api/v1/scene/active/${id}`, null, 'POST');
  };
  
  // 创建自动化场景
  export const sceneAutomationsAdd = (params) => {
    return api.apiRequest('/api/v1/scene_automations', params, 'POST');
  };
  
  // 修改自动化场景
  export const sceneAutomationsEdit = (params) => {
    return api.apiRequest('/api/v1/scene_automations', params, 'PUT');
  };
  
  // 获取自动化场景列表
  export const sceneAutomationsGet = (params) => {
    return api.apiRequest('/api/v1/scene_automations/list', params, 'GET');
  };
  
  // 删除自动化场景
  export const sceneAutomationsDel = (id) => {
    return api.apiRequest(`/api/v1/scene_automations/${id}`, null, 'DELETE');
  };
  
  // 获取自动化场景详情
  export const sceneAutomationsInfo = (id) => {
    return api.apiRequest(`/api/v1/scene_automations/detail/${id}`, null, 'GET');
  };
  
  // 获取自动化场景日志
  export const sceneAutomationsLog = (params) => {
    return api.apiRequest('/api/v1/scene_automations/log', params, 'GET');
  };
  
  // 激活自动化场景
  export const sceneAutomationsSwitch = (id) => {
    return api.apiRequest(`/api/v1/scene_automations/switch/${id}`, null, 'POST');
  };
  