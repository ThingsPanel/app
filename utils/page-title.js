const ROUTE_TITLE_KEYS = {
  'pages/login/index': 'pages.loginTitle',
  'pages/login/register': 'pages.register',
  'pages/alarms/index': 'pages.alarmsTitle',
  'pages/alarms/detail': 'pages.alarmDetailTitle',
  'pages/devices/index': 'pages.deviceList',
  'pages/automation/index': 'pages.automationTitle',
  'pages/dashboard/index': 'pages.dashboardTitle',
  'pages/account/index': 'pages.accountTitle',
  'pages/account/edit': 'account.edit.title',
  'pages/devices/detail': 'pages.deviceDetailTitle',
  'pages/web-view/index': 'pages.deviceDetailTitle',
  'pages/devices/create': 'pages.addDevice',
  'pages/alarm-rules/index': 'pages.alarmRules.title',
  'pages/alarm-rules/editor': 'pages.alarmRules.editorNavTitle',
  'pages/automation/rule': 'pages.addSceneLinkage',
  'pages/automation/scene': 'pages.addScene'
}

export function updateCurrentPageTitle(i18n) {
  const pages = getCurrentPages()
  const route = pages.length ? pages[pages.length - 1].route : ''
  const titleKey = ROUTE_TITLE_KEYS[route]
  if (!titleKey) return
  uni.setNavigationBarTitle({ title: i18n.global.t(titleKey) })
}
