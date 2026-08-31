import App from './App'
import { createSSRApp } from 'vue'
import store from './store'
import i18n from './lang/index'
import login from '@/store/login'

//登录框提示框
import needLogin from '@/components/login/needLogin.vue';
//授权提示框
import authorize from '@/components/login/authorize.vue';
//消息提示框
import CysToast from '@/components/aui-toast/aui-toast.vue'

//通用导航栏
import customNav from '@/components/customNav/customNav.vue';
//接口访问请求
import api from '@/API/'

export function createApp() {
    const app = createSSRApp(App)

    app.use(store)
    app.use(i18n)
    app.component('needLogin', needLogin)
    app.component('authorize', authorize)
    app.component('cys-toast', CysToast)
    app.component('customNav', customNav)
    app.config.globalProperties.$login = login
    app.config.globalProperties.API = api

    return {
        app
    }
}
