// Original assets are imported only by non-WeChat builds, preserving App image quality.
// #ifndef MP-WEIXIN
import originalBoardCover from '@/assets/original-images/dashboard-default-cover.png'
import originalDeviceEmpty from '@/assets/original-images/device-empty-state-transparent.png'
// #endif
let boardDefaultCover
let deviceEmptyState
// #ifdef MP-WEIXIN
boardDefaultCover = '/static/mp-weixin/images/dashboard-default-cover.webp'
deviceEmptyState = '/static/mp-weixin/images/device-empty-state-transparent.webp'
// #endif
// #ifndef MP-WEIXIN
boardDefaultCover = originalBoardCover
deviceEmptyState = originalDeviceEmpty
// #endif
export { boardDefaultCover, deviceEmptyState }
