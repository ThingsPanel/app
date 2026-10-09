/**
 * 底部导航（tabBar）项的单一真源：pagePath（定位）+ 语言包 key（取文案）。
 *
 * 为什么不把 `key` 写进 `pages.json`：uni-app 会把 `tabBar.list` 里自己认不出的字段原样透传进
 * 小程序的 `app.json`，而微信的 schema 只认 `pagePath`/`text`/`iconPath`/`selectedIconPath`，
 * 多带字段会在启动时刷
 * `无效的 app.json tabBar.list[0]["key"]、…list[4]["key"]`。
 * 所以 `pages.json` 只留编译期的 `text` 占位，运行期换文案用的 key 只存在本文件。
 *
 * 为什么不再读运行时全局 `__uniConfig`：小程序端编译产物里没有任何位置定义它，直接引用会抛
 * `ReferenceError: __uniConfig is not defined`。既然小程序端一定要有自己的表，三端就统一用这张表，
 * 只保留一条取值路径。
 *
 * 顺序必须与 `pages.json` 的 `tabBar.list` 完全一致（`uni.setTabBarItem` 按 index 定位），
 * 一致性由 `scripts/check-project.mjs` 机检。
 */
export const TAB_BAR_ITEMS = [
  { pagePath: 'pages/dashboard/index', key: 'pages.dashboardTitle' },
  { pagePath: 'pages/dashboard/boards', key: 'pages.boardsTitle' },
  { pagePath: 'pages/devices/index', key: 'pages.deviceList' },
  { pagePath: 'pages/automation/index', key: 'pages.automationTitle' },
  { pagePath: 'pages/account/index', key: 'pages.myAccount' }
]
