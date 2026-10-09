import { createI18n } from 'vue-i18n'
// #ifndef MP-WEIXIN
import enUS from './en-US'
import zhCN from './zh-CN'
// #endif
// #ifdef MP-WEIXIN
import mpMessages from './mp-messages'
// #endif
import { TAB_BAR_ITEMS } from '@/utils/tab-bar-items'

// Define available languages with their display names
export const AVAILABLE_LANGUAGES = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' }
];

let systemLanguage
let messages
// #ifdef MP-WEIXIN
systemLanguage = uni.getAppBaseInfo().language
messages = mpMessages
// #endif
// #ifndef MP-WEIXIN
systemLanguage = uni.getSystemInfoSync().language
messages = {
  'en-US': enUS,
  'zh-CN': zhCN
}
// #endif
const preferredLanguage = uni.getStorageSync('language') || systemLanguage || 'zh-CN'
let locale = preferredLanguage
// #ifdef MP-WEIXIN
locale = /^en\b/i.test(preferredLanguage) ? 'en-US' : 'zh-CN'
// #endif

const i18n = createI18n({
  legacy: true,
  locale: locale,
  fallbackLocale: 'zh-CN',
  messages
})

// Function to update tabBar texts with translation keys
export const updateTabbarText = () => {
  // tabBar 项的 pagePath + 语言包 key 统一取自 utils/tab-bar-items.js（pages.json 不带 key，见该文件注释）
  const items = TAB_BAR_ITEMS

  const pages = getCurrentPages()
  const currentRoute = pages.length ? pages[pages.length - 1].route : ''
  const isTabBarPage = items.some(tab => tab.pagePath === currentRoute)
  if (!isTabBarPage) {
    return
  }

  items.forEach((tab, index) => {
    uni.setTabBarItem({
      index,
      text: i18n.global.t(tab.key),
      // 部分平台在页面切换期间可能暂时无法更新 tabBar，失败不影响页面流程。
      fail: () => {}
    })
  })
}

// Function to change language
export const changeLanguage = (locale) => {
  i18n.global.locale = locale
  uni.setStorageSync('language', locale)
  updateTabbarText()
}

export default i18n
