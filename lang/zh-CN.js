export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    loading: '加载中...'
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
      logoutSuccess: '退出登录成功'
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
    }
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
    }
  }
  // 根据需要添加更多翻译内容
} 