import coverManifest from '../static/mp-weixin/share/cover-manifest.json'

export const SHARE_IMAGES = {
  message: 'static/mp-weixin/share/home-card.jpg',
  timeline: 'static/mp-weixin/share/home-timeline.jpg'
}

const imagePromises = new Map()

// Prepare local files before sharing; revisioned names prevent stale WeChat thumbnails.
export function prepareShareImage(kind = 'message') {
  const sourcePath = SHARE_IMAGES[kind]
  if (!sourcePath) return Promise.reject(new Error('Unknown share image type'))
  if (!imagePromises.has(kind)) {
    const pending = new Promise((resolve, reject) => {
      const filePath = `${wx.env.USER_DATA_PATH}/thingspanel-share-${kind}-${coverManifest.revision}.jpg`
      wx.getFileSystemManager().copyFile({
        srcPath: sourcePath,
        destPath: filePath,
        success: () => resolve(filePath),
        fail: reject
      })
    }).catch(() => { imagePromises.delete(kind); return sourcePath })
    imagePromises.set(kind, pending)
  }
  return imagePromises.get(kind)
}
