import Vue from 'vue'
import Vuex from 'vuex'
import list from './module/list'
Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
		list  
		},
  state: {
    name:'小程序'
  },
})
export default store
