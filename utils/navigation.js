import { TAB_BAR_ITEMS } from './tab-bar-items'

/** Match the navigation API to the registered native tab pages. */
export function navigateToPage(url, failureTitle = '无法打开页面，请重试') {
  const path = url.split('?')[0].replace(/^\//, '')
  const api = TAB_BAR_ITEMS.some(item => item.pagePath === path) ? 'switchTab' : 'navigateTo'
  // Record only the page path, never query parameters or credentials.
  console.info('[Navigation] request', api, path)
  uni[api]({
    url,
    success: () => console.info('[Navigation] success', path),
    fail: error => {
      console.error('[Navigation] failed', api, path, error?.errMsg)
      uni.showToast({ title: failureTitle, icon: 'none' })
    }
  })
}
