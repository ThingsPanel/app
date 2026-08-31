import { createStore } from 'vuex'
import list from './module/list'

const store = createStore({
  modules: {
		list  
		},
  state: {
    name:'小程序'
  },
})
export default store
