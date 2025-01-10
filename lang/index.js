import Vue from 'vue'
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

export default i18n 