import { createStore } from 'vuex'
import list from './modules/list'

const store = createStore({
  modules: {
		list
	}
})
export default store
