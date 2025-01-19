import Vue from 'vue'
import { App } from 'vue';
import VueI18n from 'vue-i18n'
import enUS from './en-US'
import zhCN from './zh-CN'

Vue.use(VueI18n)

// Define available languages with their display names
export const AVAILABLE_LANGUAGES = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' }
];

const systemLanguage = uni.getSystemInfoSync().language;
const locale = uni.getStorageSync('language') || systemLanguage || 'zh-CN';
const i18n = new VueI18n({
  locale: locale,
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN
  }
})

// Function to update tabBar texts with translation keys
export const updateTabbarText = () => {
  const tabBar = __uniConfig.tabBar
  if (tabBar && tabBar.list) {
    setTimeout(() => {
      tabBar.list.forEach((tab, index) => {
        uni.setTabBarItem({
          index,
          text: i18n.t(tab.key)
        })
      })
    }, 100)
  }
}

// Function to change language
export const changeLanguage = (locale) => {
  i18n.locale = locale
  // Force reload messages for the new locale
  i18n.setLocaleMessage(locale, i18n.messages[locale])
  uni.setStorageSync('language', locale)
  updateTabbarText()
}

export default i18n
