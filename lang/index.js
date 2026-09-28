import { createI18n } from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

// Define available languages with their display names
export const AVAILABLE_LANGUAGES = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' }
];

const systemLanguage = uni.getSystemInfoSync().language;
const locale = uni.getStorageSync('language') || systemLanguage || 'zh-CN';
const messages = {
  'en-US': enUS,
  'zh-CN': zhCN
}

const i18n = createI18n({
  legacy: true,
  locale: locale,
  fallbackLocale: 'zh-CN',
  messages
})

// Function to update tabBar texts with translation keys
export const updateTabbarText = () => {
  const tabBar = __uniConfig.tabBar
  if (!tabBar || !tabBar.list) {
    return
  }

  const pages = getCurrentPages()
  const currentRoute = pages.length ? pages[pages.length - 1].route : ''
  const isTabBarPage = tabBar.list.some(tab => tab.pagePath === currentRoute)
  if (!isTabBarPage) {
    return
  }

  tabBar.list.forEach((tab, index) => {
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
