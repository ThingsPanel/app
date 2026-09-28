import { createHomePreferenceStore } from '@/features/dashboard/home-preference'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'

const preferences = createHomePreferenceStore({
  storage: {
    getStorageSync: key => uni.getStorageSync(key),
    setStorageSync: (key, value) => uni.setStorageSync(key, value)
  },
  getSession: () => {
    const addresses = resolveThingsVisAddresses()
    return { server: addresses.thingsPanelApiBase, boardsServer: addresses.thingsVisApiBase, token: uni.getStorageSync('access_token') }
  },
  getProfile: () => requestDeviceApi('user/detail')
})

export const openHomePreference = () => preferences.open()
