import dayjs from 'dayjs'
import { buildDeviceImageUrl } from './device-image'

/**
 * 把接口返回的设备整理成设备卡片（features/devices/components/device-list-item.vue）需要的形状。
 *
 * 设备列表页与首页「常用设备」共用这一份映射：两处卡片长得一样，数据口径也必须一样，
 * 否则同一条设备在两个页面会显示不同的分组文案或时间格式。
 */
export function buildDeviceCard(device) {
  return {
    ...device,
    display_groups: Array.isArray(device?.group_paths) ? device.group_paths.filter(Boolean).join('、') : '',
    latest_ts_name: device?.ts ? dayjs(device.ts).format('YYYY-MM-DD HH:mm:ss') : '',
    image_url: buildDeviceImageUrl(device?.image_url)
  }
}
