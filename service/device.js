import api from '@/API/'

// 获取设备分组
export const getDeviceGroup = (params) => {
    return api.apiRequest('/api/v1/device/group', params, 'GET');
  };
  
  // 接入方式下拉菜单（旧）
  export const deviceDictProtocolService = (params) => {
    return api.apiRequest('/api/v1/dict/protocol/service', params, 'GET');
  };
  
  // 接入方式下拉一级菜单
  export const deviceDictProtocolServiceFirstLevel = (params) => {
    return api.apiRequest('/api/v1/service/plugin/select', params, 'GET');
  };
  
  // 接入方式下拉二级菜单
  export const deviceDictProtocolServiceSecondLevel = (params) => {
    return api.apiRequest('/api/v1/service/access/list', params, 'GET');
  };
  
  // 获取设备分组树
  export const deviceGroupTree = (params) => {
    return api.apiRequest('/api/v1/device/group/tree', params, 'GET');
  };
  
  // 新增设备分组
  export const deviceGroup = (params) => {
    return api.apiRequest('/api/v1/device/group', params, 'POST');
  };
  
  // 修改设备分组
  export const putDeviceGroup = (params) => {
    return api.apiRequest('/api/v1/device/group', params, 'PUT');
  };
  
  // 激活设备
  export const putDeviceActive = (params) => {
    return api.apiRequest('/api/v1/device/active', params, 'PUT');
  };
  
  // 删除设备分组
  export const deleteDeviceGroup = (params) => {
    return api.apiRequest(`/device/group/${params.id}`, null, 'DELETE');
  };
  
  // 获取设备分组详情
  export const deviceGroupDetail = (params) => {
    return api.apiRequest(`/device/group/detail/${params.id}`, null, 'GET');
  };
  
  // 获取设备列表
  export const deviceList = (params) => {
    return api.apiRequest('/api/v1/device', params, 'GET');
  };
  
  // 删除某个设备
  export const deviceDelete = (params) => {
    return api.apiRequest('/api/v1/device/update/config', params, 'PUT');
  };
  
  // 获取设备列表（根据分组）
  export const deviceListByGroup = (params) => {
    return api.apiRequest('/api/v1/device/group/relation/list', params, 'GET');
  };
  
  // 获取设备详情
  export const deviceDetail = (id) => {
    const url = `/device/detail/${id}`;
    return api.apiRequest(url, null, 'GET');
  };
  
  // 获取设备分组关系
  export const deviceGroupRelation = (params) => {
    return api.apiRequest('/api/v1/device/group/relation', params, 'POST');
  };
  
  export const getDeviceGroupRelation = (params) => {
    return api.apiRequest('/api/v1/device/group/relation', params, 'GET');
  };
  
  // 获取设备告警状态
  export const deviceAlarmStatus = (params) => {
    return api.apiRequest('/api/v1/alarm/info/history/device', params, 'GET');
  };
  
  // 获取设备告警历史
  export const deviceAlarmHistory = (params) => {
    return api.apiRequest('/api/v1/alarm/info/history', params, 'GET');
  };
  
  // 获取设备告警配置列表
  export const deviceAlarmList = (params) => {
    return api.apiRequest('/api/v1/scene_automations/alarm', params, 'GET');
  };
  
  // 修改设备告警描述
  export const deviceAlarmHistoryPut = (params) => {
    return api.apiRequest('/api/v1/alarm/info/history', params, 'PUT');
  };
  
  // 获取设备功能模板列表
  export const deviceTemplate = (params) => {
    return api.apiRequest('/api/v1/device/template', params, 'GET');
  };
  
  // 获取服务列表
  export const getServiceList = (params) => {
    return api.apiRequest('/api/v1/service/list', params, 'GET');
  };
  
  // 获取设备功能模板详情
  export const deviceTemplateDetail = (params) => {
    return api.apiRequest(`/device/template/detail/${params.id}`, null, 'GET');
  };
  
  // 获取设备配置列表
  export const deviceConfig = (params) => {
    return api.apiRequest('/api/v1/device_config', params, 'GET');
  };
  
  // 创建设备配置
  export const deviceConfigAdd = (params) => {
    return api.apiRequest('/api/v1/device_config', params, 'POST');
  };
  
  // 更新设备配置
  export const deviceConfigEdit = (params) => {
    return api.apiRequest('/api/v1/device_config', params, 'PUT');
  };
  
  // 获取设备配置详情
  export const deviceConfigInfo = (params) => {
    return api.apiRequest(`/device_config/${params.id}`, null, 'GET');
  };
  
  // 删除设备配置
  export const deviceConfigDel = (params) => {
    return api.apiRequest(`/device_config/${params.id}`, null, 'DELETE');
  };
  
  // 设备配置-凭证类型下拉
  export const deviceConfigVoucherType = (params) => {
    return api.apiRequest('/api/v1/device_config/voucher_type', params, 'GET');
  };
  
  // 设备配置-获取设备配置表单
  export const protocolPluginConfigForm = (params) => {
    return api.apiRequest('/api/v1/protocol_plugin/config_form', params, 'GET');
  };
  
  // 批量新设备配置关联的设备
  export const deviceConfigBatch = (params) => {
    return api.apiRequest('/api/v1/device_config/batch', params, 'PUT');
  };
  
  // 删除设备分组关系
  export const deleteDeviceGroupRelation = (params) => {
    return api.apiRequest('/api/v1/device/group/relation', params, 'DELETE');
  };
  
  // 获取设备连接信息
  export const getDeviceConnectInfo = (params) => {
    return api.apiRequest('/api/v1/device/connect/info', params, 'GET');
  };
  
  // 获取插件信息通过服务
  export const getPlugininfoByService = (params) => {
    return api.apiRequest('/api/v1/service/plugin/info', params, 'GET');
  };
  
  // 获取设备配置列表
  export const getDeviceConfigList = (params) => {
    return api.apiRequest('/api/v1/device_config', params, 'GET');
  };
  
  // 更新设备凭证
  export const updateDeviceVoucher = (params) => {
    return api.apiRequest('/api/v1/device/update/voucher', params, 'POST');
  };
  
  // 添加设备
  export const deviceAdd = (params) => {
    return api.apiRequest('/api/v1/device', params, 'POST');
  };
  
  // 获取设备连接表单
  export const devicCeonnectForm = (params) => {
    return api.apiRequest('/api/v1/device/connect/form', params, 'GET');
  };
  
  // 检查设备
  export const checkDevice = (deviceNumber) => {
    const url = `/device/check/${deviceNumber}`;
    return api.apiRequest(url, null, 'GET');
  };
  
  // 删除设备
  export const deleteDevice = (params) => {
    return api.apiRequest(`/device/${params.id}`, null, 'DELETE');
  };
  
  // 设置设备脚本启用状态
  export const setDeviceScriptEnable = (params) => {
    return api.apiRequest('/api/v1/data_script/enable', params, 'PUT');
  };
  
  // 获取数据处理列表
  export const getDataScriptList = (params) => {
    return api.apiRequest('/api/v1/data_script', params, 'GET');
  };
  
  // 创建数据处理
  export const dataScriptAdd = (params) => {
    return api.apiRequest('/api/v1/data_script', params, 'POST');
  };
  
  // 更新数据处理
  export const dataScriptEdit = (params) => {
    return api.apiRequest('/api/v1/data_script', params, 'PUT');
  };
  
  // 调试数据处理
  export const dataScriptQuiz = (params) => {
    return api.apiRequest('/api/v1/data_script/quiz', params, 'POST');
  };
  
  // 删除数据处理
  export const dataScriptDel = (params) => {
    return api.apiRequest(`/data_script/${params.id}`, null, 'DELETE');
  };
  
  // 设备遥测当前值查询
  export const telemetryDataCurrent = (id) => {
    const url = `/telemetry/datas/current/${id}`;
    return api.apiRequest(url, null, 'GET');
  };
  
  // 获取指定键的遥测数据
  export const telemetryDataCurrentKeys = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/current/keys', params, 'GET');
  };
  
  // 遥测数据历史列表
  export const telemetryDataHistoryList = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/statistic', params, 'GET');
  };
  
  // 删除遥测数据
  export const telemetryDataDel = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas', params, 'DELETE');
  };
  
  // 获取遥测下发记录列表
  export const getTelemetryLogList = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/set/logs', params, 'GET');
  };
  
  // 下发遥测数据
  export const telemetryDataPub = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/pub', params, 'POST');
  };
  
  // 新增期望消息
  export const expectMessageAdd = (params) => {
    return api.apiRequest('/api/v1/expected/data', params, 'POST');
  };
  
  // 获取期望消息列表
  export const expectMessageList = (params) => {
    return api.apiRequest('/api/v1/expected/data/list', params, 'GET');
  };
  
  // 删除期望消息
  export const expectMessageDelete = (params) => {
    return api.apiRequest(`/expected/data/${params}`, null, 'DELETE');
  };
  
  // 获取属性数据集
  export const getAttributeDataSet = (params) => {
    return api.apiRequest(`/attribute/datas/${params.device_id}`, null, 'GET');
  };
  
  // 删除属性数据集
  export const deleteAttributeDataSet = (params) => {
    return api.apiRequest(`/attribute/datas/${params}`, null, 'DELETE');
  };
  
  // 获取属性下发记录列表
  export const getAttributeDataSetLogs = (params) => {
    return api.apiRequest('/api/v1/attribute/datas/set/logs', params, 'GET');
  };
  
  // 下发属性数据
  export const attributeDataPub = (params) => {
    return api.apiRequest('/api/v1/attribute/datas/pub', params, 'POST');
  };
  
  // 获取指定键的属性数据
  export const getAttributeDatasKey = (params) => {
    return api.apiRequest('/api/v1/attribute/datas/key', params, 'GET');
  };
  
  // 获取事件数据集
  export const getEventDataSet = (params) => {
    return api.apiRequest('/api/v1/event/datas', params, 'GET');
  };
  
  // 获取命令下发记录列表
  export const getCommandDataSetLogs = (params) => {
    return api.apiRequest('/api/v1/command/datas/set/logs', params, 'GET');
  };
  
  // 下发命令
  export const commandDataPub = (params) => {
    return api.apiRequest('/api/v1/command/datas/pub', params, 'POST');
  };
  
  // 获取命令数据通过ID
  export const commandDataById = (id) => {
    const url = `/command/datas/${id}`;
    return api.apiRequest(url, null, 'GET');
  };
  
  // 获取有图表的设备列表
  export const deviceTemplateSelect = () => {
    return api.apiRequest('/api/v1/device/template/chart/select', null, 'GET');
  };
  
  // 获取遥测历史数据
  export const telemetryHistoryData = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/history/pagination', params, 'GET');
  };
  
  // 更新设备配置
  export const deviceUpdateConfig = (params) => {
    return api.apiRequest('/api/v1/device/update/config', params, 'PUT');
  };
  
  // 获取设备配置菜单
  export const deviceConfigMenu = (params) => {
    return api.apiRequest('/api/v1/device/template/menu', params, 'GET');
  };
  
  // 保存设备位置
  export const deviceLocation = (params) => {
    return api.apiRequest('/api/v1/device', params, 'PUT');
  };
  
  // 修改设备名称
  export const deviceUpdate = (params) => {
    return api.apiRequest('/api/v1/device', params, 'PUT');
  };
  
  // 获取网关下子设备列表
  export const childDeviceTableList = (params) => {
    return api.apiRequest(`/device/sub-list/${params.id}`, params, 'GET');
  };
  
  // 获取添加子设备选择列表
  export const childDeviceSelectList = () => {
    return api.apiRequest('/api/v1/device/list', null, 'GET');
  };
  
  // 添加子设备
  export const addChildDevice = (params) => {
    return api.apiRequest('/api/v1/device/son/add', params, 'POST');
  };
  
  // 移除子设备
  export const removeChildDevice = (params) => {
    return api.apiRequest('/api/v1/device/sub-remove', params, 'PUT');
  };
  
  // 获取设备获取遥测数据命令
  export const getSimulation = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/simulation', params, 'GET');
  };
  
  // 发送设备遥测数据命令
  export const sendSimulation = (params) => {
    return api.apiRequest('/api/v1/telemetry/datas/simulation', params, 'POST');
  };
  
  // 根据设备ID查自定义命令列表
  export const deviceCustomCommandsIdList = (paramsId) => {
    return api.apiRequest(`/device/model/custom/commands/${paramsId}`, null, 'GET');
  };
  
  // 获取服务插件选择列表
  export const deviceProtocalServiceList = (params) => {
    return api.apiRequest('/api/v1/service/plugin/select', params, 'GET');
  };