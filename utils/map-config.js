/**
 * 腾讯位置服务（地图）配置。
 *
 * 密钥绝不写进源码：本项目为开源项目，密钥一律通过环境变量注入。
 *   本地开发：复制 .env.example 为 .env，填入 VITE_TENCENT_MAP_KEY 后重新编译。
 *             .env 已在 .gitignore 中忽略，不会提交到仓库。
 *   CI / 生产：在构建环境中注入同名环境变量。
 *
 * 申请入口：https://lbs.qq.com/dev/console/key/add
 * 密钥类型：JavaScript API GL（H5 与 App 端共用同一把）。
 * 微信小程序端不使用该密钥：小程序 <map> 组件内置腾讯地图。
 *
 * 密钥缺失时地图区域显示「未配置地图密钥」提示，页面其余功能不受影响。
 */
function readMapKeyFromEnv() {
  try {
    return import.meta.env?.VITE_TENCENT_MAP_KEY || ''
  } catch (error) {
    return ''
  }
}

export const TENCENT_MAP_KEY = readMapKeyFromEnv()

/** 腾讯地图 GL JS SDK 地址（不含密钥，密钥在运行时拼接） */
export const TENCENT_MAP_SDK_URL = 'https://map.qq.com/api/gljs?v=1.exp&libraries=service'

/** 坐标缺失时使用的默认地图中心（北京） */
export const DEFAULT_MAP_CENTER = { longitude: 116.397428, latitude: 39.90923 }

/** 地图默认缩放级别 */
export const DEFAULT_MAP_ZOOM = 16

/**
 * 解析并校验一组经纬度，返回可用于地图渲染的数值坐标。
 *
 * 与社区版 map-validator 的判定保持一致：非数字、越界、以及 (0, 0) 都视为无效。
 * 注意与 device-information.js 的 validateCoordinates 区分：
 * 后者允许空值并原样回传字符串，用于提交前的表单校验；本函数用于渲染，必须有确定中心点。
 *
 * @returns {{ longitude: number, latitude: number } | null}
 */
export function parseMapCoordinate(longitude, latitude) {
  if (longitude === '' || latitude === '' || longitude === null || latitude === null || longitude === undefined || latitude === undefined) return null
  const lng = Number(longitude)
  const lat = Number(latitude)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null
  if (lng === 0 && lat === 0) return null
  return { longitude: lng, latitude: lat }
}
