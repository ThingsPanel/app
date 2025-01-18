export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    loading: '加载中...',
    pleaseSelect: '请选择',
    pleaseInput: '请输入'
  },
  login: {
    title: '登录',
    username: '用户名',
    password: '密码',
    loginBtn: '登录',
    registerBtn: '注册'
  },
  ucenter: {
    notLoggedIn: '未登录/注册',
    clickToLogin: '点击头像可登录/注册',
    language: '语言',
    name: '名字',
    phone: '电话',
    email: '邮箱',
    logout: '退出登录',
    deleteAccount: '永久注销账号',
    serverAddress: '服务器地址',
    enterServerAddress: '请输入服务器地址',
    warning: '警告',
    deleteConfirmation: '账号注销后数据无法恢复，您在系统中注册的个人信息也将永久删除！请确认注销账号！',
    deleteSuccess: '注销成功',
    deleteFailed: '注销失败',
    loading: '加载中',
    tip: '提示',
    enterServerAddressToast: '请输入服务器地址',
    confirm: '确定',
    authDescription: '登录授权'
  },
  pages: {
    login: '登录',
    register: '注册',
    notify: '告警信息',
    deviceList: '设备列表',
    intelligentControl: '智能控制',
    userCenter: '个人中心',
    basicInfo: '基本资料',
    deviceDetail: '设备详情',
    addDevice: '添加设备',
    modifyName: '修改姓名',
    modifyPhone: '修改手机',
    modifyEmail: '修改邮箱',
    modifyPassword: '修改密码',
    changePassword: {
      passwordPlaceholder: '请输入登录密码!',
      confirmPlaceholder: '请确认登录密码!',
      passwordTip: '请设置6位及以上包含数字、字母和特殊符号中至少两种组合的密码！',
      confirmBtn: '确认修改',
      successMsg: '设置成功！'
    },
    historyOperation: '历史操作',
    myDevices: '我的设备',
    editAlertStrategy: '编辑告警策略',
    addAlertStrategy: '新增告警策略',
    addControlStrategy: '新增控制策略',
    editControlStrategy: '编辑控制策略',
    addSceneLinkage: '新增场景联动',
    addScene: '新增场景',
    myAccount: '我的账户',
    accounts: {
      title: '账号信息',
      logout: '退出当前账号',
      logoutConfirm: '是否要退出登录',
      logoutBtn: '立即退出',
      logoutSuccess: '退出登录成功',
      name: '名字',
      phone: '电话',
      email: '邮箱',
      changePassword: '修改密码'
    },
    email: {
      inputPlaceholder: '请输入电子邮箱!',
      tips: '请输入您的电子邮箱！',
      invalidEmail: '请输入正确的邮箱地址！',
      updateSuccess: '设置成功！'
    },
    phone: {
      inputPlaceholder: '请输入手机号码!',
      tips: '请输入您的手机号码，确保手机号码正确无误！',
      invalidPhone: '请输入正确的手机号码',
      updateSuccess: '设置成功！'
    },
    realname: {
      inputPlaceholder: '请输入姓名!',
      tips: '请输入您的真实姓名！',
      emptyError: '真实姓名不能为空',
      updateSuccess: '设置成功！'
    },
    addControl: {
      strategyName: '策略名称',
      strategyDescription: '策略描述',
      strategyPriority: '策略优先级',
      triggerCondition: '触发条件',
      addNewRow: '+新增一行',
      deviceConditionType: '设备条件类型',
      selectDeviceGroup: '请选择设备分组',
      selectDevice: '请选择设备',
      condition: '条件',
      symbol: '符号',
      value: '数值',
      times: '次数',
      date: '日期',
      time: '时间',
      delete: '删除',
      executeCommand: '执行命令',
      strategyStatus: '策略状态',
      save: '保存',
      loading: '加载中',
      inputName: '请输入名称',
      inputDescription: '请输入策略描述',
      inputPriority: '请输入策略优先级',
      inputValue: '请输入数值',
      selectDate: '请选择日期',
      selectTime: '请选择时间',
      noData: '暂无可选择数据',
      validateError: {
        nameRequired: '请输入策略名称',
        descriptionRequired: '请输入描述',
        triggerConditionInvalid: '存在数据项不符合触发条件，请检查触发条件数据项',
        executeCommandInvalid: '存在数据项不符合执行命令，请检查执行命令数据项',
        deviceGroupRequired: '请选择设备分组',
        deviceRequired: '请选择设备',
        conditionRequired: '请选择条件',
        symbolRequired: '请选择符号',
        valueRequired: '请输入数值',
        timesRequired: '请选择次数',
        dateTimeRequired: '请选择日期或时间'
      },
      executeCommand: '执行命令',
      on: '开',
      off: '关',
      addNewTrigger: '新增触发条件',
      addNewCommand: '新增执行命令',
      selectRelation: '请选择且或条件',
      pleaseSelect: '请选择',
      cancel: '取消',
      saveBtn: '保存',
      pleaseSelectDeviceGroup: '请选择设备分组',
      pleaseSelectDevice: '请选择设备',
      pleaseSelectCondition: '请选择条件',
      pleaseSelectSymbol: '请选择符号',
      pleaseEnterValue: '请输入数值',
      selectTime: '请选择时间',
      value: '数值',
      time: '时间'
    },
    changePwd: {
      inputPwdPlaceholder: '请输入登录密码!',
      confirmPwdPlaceholder: '请确认登录密码!',
      pwdTip: '请设置6位及以上包含数字、字母和特殊符号中至少两种组合的密码！',
      confirmBtn: '确认修改',
      successMsg: '设置成功！'
    },
    alertStrategy: {
      strategyName: '策略名称',
      enterName: '请输入名称',
      strategyDescription: '策略描述',
      enterDescription: '请输入描述',
      selectDeviceGroup: '请选择设备分组',
      selectDevice: '请选择设备',
      triggerCondition: '触发条件',
      addNewRow: '+新增一行',
      selectCondition: '请选择条件',
      selectSymbol: '请选择符号',
      enterValue: '请输入值',
      enterNumberValue: '请输入数值',
      message: '信息',
      enterMessage: '请在此处填写信息',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      addTriggerCondition: '新增触发条件',
      relation: '且',
      or: '或',
      pleaseSelectCondition: '请选择条件',
      pleaseSelectSymbol: '请选择符号',
      value: '数值',
      enterValue: '请输入数值',
      noSelectableData: '暂无可选择数据',
      pleaseSelectDeviceFirst: '请选择设备',
      pleaseSelectDeviceGroupFirst: '请选择设备分组',
      pleaseSelectRelation: '请选择关系',
      pleaseEnterValue: '请输入值',
      saveSuccess: '保存成功',
      loading: '加载中',
      message: '信息',
      enterMessage: '请在此处填写信息',
      save: '保存',
      triggerCondition: '触发条件',
      addNewRow: '+新增一行'
    },
    controlStrategy: {
      strategyName: '策略名称',
      enterName: '请输入名称!',
      strategyDescription: '策略描述',
      enterDescription: '请输入描述!',
      strategyPriority: '策略优先级',
      strategyType: '策略类型',
      deviceConditionType: '设备条件类型',
      triggerCondition: '触发条件',
      selectBusiness: '选择业务',
      greenhouse1: '1号温棚',
      selectDevice: '请选择设备',
      device1: '设备1',
      selectValue: '选择值',
      greenhouse: '温棚',
      selectRelation: '选择关系',
      inputValue: '输入值',
      controlCommand: '控制指令',
      selectControlledObject: '选择受控对象',
      relay: '继电器',
      off: '关',
      on: '开',
      strategyStatus: '策略状态',
      deployToDevice: '下发策略到终端设备',
      deployNote: '（备注: 仅一个条件，和一个指令，且属于同一设备的情况方向允许下发）',
      save: '保 存'
    },
    device: {
      time: '时间',
      deviceValue: '设备值',
      deviceType: '设备类型',
      enabled: '已开启',
      disabled: '未开启'
    },
    addMonitor: {
      pageTitle: '添加设备',
      deviceName: '设备名称：',
      deviceNamePlaceholder: '智能控制器',
      completeButton: '完成',
      deviceNameRequired: '请输入设备名称'
    },
    deviceDetail: {
      online: '在线',
      offline: '离线',
      updateTime: '更新时间',
      control: '控制',
      on: '开启',
      off: '关闭',
      send: '下发',
      logs: '日志',
      logDetail: '日志详情',
      deviceName: '设备名称',
      deviceGroupName: '设备分组名称',
      businessName: '业务名称',
      operationType: '操作类型',
      command: '指令',
      sendResult: '发送结果',
      logTitle: '日志详情',
      deviceNameLabel: '设备名称：',
      deviceGroupNameLabel: '设备分组名称：',
      businessNameLabel: '业务名称：',
      operationTypeLabel: '操作类型：',
      commandLabel: '指令：',
      sendResultLabel: '发送结果：',
      deviceMonitor: '设备监控',
      reportTime: '上报时间',
      groupSelection: '分组选择',
      timedTrigger: '定时触发',
      manualControl: '手动控制',
      success: '成功',
      failure: '失败',
    },
    fisheryMonitor: {
      title: '设备监控',
      online: '在线',
      offline: '离线',
      updateTime: '更新时间：'
    },
    logDetail: {
      title: '日志详情',
      deviceName: '设备名称：',
      deviceGroupName: '设备分组名称：',
      businessName: '业务名称：',
      operationType: '操作类型：',
      command: '指令：',
      sendResult: '发送结果：',
      timedTrigger: '定时触发',
      manualControl: '手动控制',
      success: '成功',
      failure: '失败'
    },
    history: {
      year: '年',
      month: '月',
      pumpOnWhenPHHigh: 'PH值>7时，自动打开水泵'
    },
    charts: {
      histogramNumber: '柱状图histogram Number',
      histogramPercent: '柱状图histogram percent',
      histogramExtra: '柱状图histogram extra拓展',
      arcbar: '圆环arcbar',
      linePercent: '折线LineChart percent',
      lineNumber: '折线LineChart Number',
      pieChart: '饼状图PieChart',
      ringChart: '环状图 RingChart'
    },
    intelligentControl: {
      sceneLinkage: '场景联动',
      sceneManagement: '场景管理',
      addSceneLinkage: '+新增场景联动',
      addScene: '+新增场景',
      ruleDescription: '规则说明：',
      sceneDescription: '场景描述：',
      activate: '激活',
      start: '启动',
      stop: '停用',
      edit: '编辑',
      delete: '删除',
      more: '更多',
      loading: '加载中',
      farm: '猪场',
      sceneLinkageLabel: '场景联动',
      sceneManagementLabel: '场景管理',
      activate: '激活',
      start: '启动',
      stop: '停用',
      edit: '编辑',
      delete: '删除',
      more: '更多'
    },
    login: {
      title: '物联网平台',
      emailPlaceholder: '请输入邮箱',
      passwordPlaceholder: '请输入密码',
      loginButton: '登录',
      registerButton: '注册',
      cancelLogin: '取消登录',
      loginSuccess: '登录成功',
      networkError: '网络错误，请稍后再试',
      loading: '加载中',
      authDescription: '登录'
    },
    register: {
      title: '注册',
      emailPlaceholder: '请输入邮箱',
      codePlaceholder: '请输入验证码',
      getCode: '获取验证码',
      phonePlaceholder: '请输入手机号',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请确认密码',
      registerButton: '确认注册',
      backToLogin: '返回登录',
      errors: {
        emailRequired: '请输入邮箱',
        invalidEmail: '请输入正确的邮箱格式',
        phoneRequired: '请输入手机号',
        invalidPhone: '请输入正确的手机号',
        passwordRequired: '请输入密码',
        passwordLength: '密码长度需在8-18位之间',
        passwordComplexity: '密码必须包含英文字母和数字',
        confirmPasswordRequired: '请确认密码',
        passwordMismatch: '两次输入的密码不一致',
        codeRequired: '请输入验证码'
      },
      messages: {
        codeSent: '验证码已发送',
        codeFailed: '验证码发送失败',
        registerSuccess: '注册成功',
        registerFailed: '注册失败'
      }
    },
    notify: {
      noAlerts: '暂无新的告警内容',
      alertLevel: '告警级别',
      alertName: '告警名称',
      alertContent: '告警内容',
      alertTime: '告警时间',
      alarmLevels: {
        L: '低',
        M: '中', 
        H: '高'
      }
    },
    sceneRuleDetail: {
      ruleName: '规则名称',
      alertLevel: '告警级别',
      notificationGroup: '通知组', 
      repeatCount: '重复次数',
      alertDescription: '告警描述',
      levels: {
        low: '低',
        medium: '中',
        high: '高'
      },
      ruleDescription: '规则说明',
      loading: '加载中',
      enterRuleName: '请输入场景联动名称',
      enterRuleConditions: '请输入场景联动条件',
      enterRuleActions: '请输入场景联动动作',
      ifText: '如果',
      thenText: '那么',
      save: '保存',
      saveConfirm: '确定要保存数据吗？',
      and: '且',
      or: '或',
      deviceCondition: '设备条件',
      timeCondition: '时间条件',
      status: '状态',
      online: '上线', 
      offline: '下线',
      conditionType: '条件类型',
      all: '全部',
      actionPlaceholder: '执行动作',
      deviceCondition: '设备条件',
      timeCondition: '时间条件',
      jsonFormatError: '请输入JSON格式',
      singleDevice: '单个设备',
      singleDeviceType: '单类设备',
      equal: '等于',
      notEqual: '不等于',
      greaterThan: '大于',
      lessThan: '小于',
      greaterThanOrEqual: '大于等于',
      lessThanOrEqual: '小于等于',
      between: '介于',
      in: '包含在',
      everyHour: '每小时',
      everyDay: '每天',
      everyWeek: '每周',
      everyMonth: '每月',
      monday: '星期一',
      tuesday: '星期二',
      wednesday: '星期三',
      thursday: '星期四',
      friday: '星期五',
      saturday: '星期六',
      sunday: '星期日',
      actionType1: '操作设备',
      actionType2: '触发告警',
      actionType3: '激活场景',
      selectActionType: '请选择需要执行的动作类型',
      completeDeviceInfo: '请将“操作设备”信息补充完整',
      completeWarningInfo: '请将“触发告警”信息补充完整（“告警级别”为必填）',
      completeNotificationInfo: '请将“触发告警”信息补充完整（“通知组”为必填）',
      completeSceneInfo: '请将“激活场景”信息补充完整（“场景”为必填）',
      unknownActionType: '未知的操作类型',
      and: '并且',
      selectConditionType: '请选择条件类型',
      selectDeviceConditionType: '请选择设备条件类型',
      selectDevice: '请选择设备',
      selectDeviceType: '请选择设备类型',
      selectParameter: '请选择参数',
      selectOperator: '请选择操作符',
      commaSeparatedValues: '用逗号分隔多个值',
      minValue: '最小值',
      maxValue: '最大值',
      value: '值',
      eventParamExample: '参数，如：{\'param1\':1}',
      selectTimeConditionType: '请选择时间条件类型',
      selectDateTime: '请选择日期和时间',
      selectExpirationTime: '请选择过期时间',
      selectCycle: '请选择周期',
      selectMinute: '请选择分钟',
      selectTime: '请选择时间',
      selectDate: '请选择日期',
      selectStartTime: '请选择开始时间',
      selectEndTime: '请选择结束时间',
      fiveMinutes: '5分钟',
      tenMinutes: '10分钟',
      thirtyMinutes: '30分钟',
      oneHour: '1小时',
      oneDay: '1天',
      selectRelation: '请选择“且/或”',
      timeConditionValidation: '时间条件的“单次”与“单次”、“单次”与“重复”、“重复”与“单次”只能使用“或”连接，请检查您的条件',
      selectConditionType: '请选择条件类型',
      completeDeviceCondition: '请将“设备条件”信息补充完整（“设备条件”中所有字段均为必填）',
      completeTimeCondition: '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）',
      unknownConditionType: '未知的条件类型'
    },
    sceneDetail: {
      editScene: '编辑场景',
      newScene: '新增场景',
      sceneTitle: '场景标题',
      sceneDescription: '场景描述',
      actions: '动作',
      save: '保存',
      saveConfirm: '确定要保存数据吗？',
      loading: '加载中',
      enterSceneTitle: '请输入场景标题',
      actionsEdit: {
        selectActionType: '选择动作类型',
        selectDeviceType: '选择设备类型',
        selectDevice: '选择设备',
        selectDeviceCategory: '选择单类设备',
        selectMetricType: '选择指标类型',
        selectMetric: '选择指标',
        examplePrefix: '例如：',
        selectScene: '选择场景',
        selectAlarm: '选择告警'
      }
    },
    sceneSelect: {
      placeholder: '场景'
    },
  },
  components: {
    popup: {
      title: '提示',
      content: '确认此评论通过审核吗？',
      cancel: '取消',
      confirm: '确定'
    },
    authorize: {
      info: '请点击下方【获取授权】使用智慧猪场',
      cancelBtn: '取消授权',
      getAuthBtn: '获取授权'
    },
    login: {
      welcome: '登录',
      welcomeSubtitle: '欢迎登录',
      accountPlaceholder: '请输入账号!',
      passwordPlaceholder: '请输入密码!',
      rememberPassword: '记住密码',
      loginButton: '登 录',
      forgotPassword: '忘记密码',
      loginSuccess: '登录成功'
    },
    device: {
      placeholder: '设备',
      selectTitle: '选择设备',
      test: '测试'
    },
    selectDevice: {
      group: '分组',
      operator: '操作符',
      propertyValue: '属性值',
      statusProperty: '状态/属性',
      onlineStatus: '上下线',
      property: '属性',
      noData: '无数据！',
      online: '上线',
      offline: '下线',
      onAndOff: '上下线'
    },
    selectTime: {
      triggerType: '触发方式',
      single: '单次',
      repeat: '重复',
      range: '范围',
      triggerDateTime: '触发日期时间',
      singleTip: '只执行一次，执行结束后条件消失',
      repeatCycle: '重复周期',
      startTime: '起始时间',
      endTime: '结束时间',
      everyHour: '每小时',
      everyDay: '每天',
      everyWeek: '每周',
      everyMonth: '每月',
      customCron: '自定义cron',
      hourTip: '例: 33:00" 表示每小时的第33分钟触发',
      dayTip: '例: "18:33" 表示每天的18:33触发',
      weekTip: '例: "周一, 18:33" 表示每周一的18:33触发',
      monthTip: '例: "1日, 9:00" 表示每月1日的09:00触发',
      day: '日',
      executionRule: '执行日期时间规则'
    },
    notifyDialog: {
      confirmText: '点击确定{action}警告',
      process: '处理',
      ignore: '忽略',
      optional: '选填',
      operationSuccess: '操作成功'
    },
    changePwd: {
      inputPwdPlaceholder: '请输入登录密码!',
      confirmPwdPlaceholder: '请确认登录密码!',
      pwdTip: '请设置6位及以上包含数字、字母和特殊符号中至少两种组合的密码！',
      confirmBtn: '确认修改',
      successMsg: '设置成功！'
    }
  }
}
