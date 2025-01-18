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

// Function to update page titles and tabBar based on current language
// export const updatePageTitles = () => {
//   const pages = getCurrentPages()
//   const currentPage = pages[pages.length - 1]
//   if (currentPage) {
//     const route = currentPage.route
//     console.log('route: %o', route)
//     console.log('pages: %o', __uniConfig);
//     const config = __uniConfig.pages.find(p => p.path === route)
//     if (config && config.style.navigationBarTitleText) {
//       const titleKey = config.style.navigationBarTitleText.replace(/%(.+)%/g, '$1')
//       const title = i18n.global.t(titleKey)
//       uni.setNavigationBarTitle({ title })
//     }
//   }

//   // Update tabBar texts
//   const tabBar = __uniConfig.tabBar
//   if (tabBar && tabBar.list) {
//     tabBar.list.forEach((tab, index) => {
//       const textKey = tab.text.replace(/%(.+)%/g, '$1')
//       const text = i18n.global.t(textKey)
//       uni.setTabBarItem({
//         index,
//         text
//       })
//     })
//   }
// }
// export const $t = i18n.global.t
// Function to change language
export const changeLanguage = (locale) => {
  i18n.global.locale = locale
  uni.setStorageSync('language', locale)
  // updatePageTitles()
}

export default i18n 