import Vue from 'vue'
import App from './App'
import store from './store'
//
Vue.prototype.$store = store
//
Vue.config.productionTip = false

Vue.prototype.$login = require('@/store/login') //判断是否登陆

//登录框提示框
import needLogin from '@/components/login/needLogin.vue';
 Vue.component('needLogin',needLogin)
//授权提示框
import authorize from '@/components/login/authorize.vue';
 Vue.component('authorize',authorize)
//消息提示框
import CysToast from '@/components/aui-toast/aui-toast.vue'
Vue.component('cys-toast',CysToast)

//通用导航栏
import customNav from '@/components/customNav/customNav.vue';
Vue.component('customNav',customNav)
//接口访问请求
import api from '@/API/'
Vue.prototype.API = api
// 
App.mpType = 'app'
// 
const app = new Vue({
    ...App
})
app.$mount()
