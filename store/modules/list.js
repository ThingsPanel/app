export default {
  state: () => ({
    offset: 1,
    pageSize: 10,
    devicePage: 1,
    devicePageSize: 10,
    modelPage: 1,
    modelPageSize: 10
  }),
  mutations: {
    incrementOffset(state) {
      state.offset += 1
    },
    resetOffset(state) {
      state.offset = 1
    },
    incrementDevicePage(state) {
      state.devicePage += 1
    },
    resetDevicePage(state) {
      state.devicePage = 1
    },
    incrementModelPage(state) {
      state.modelPage += 1
    },
    resetModelPage(state) {
      state.modelPage = 1
    }
  }
}
