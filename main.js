import App from './App'
import { createSSRApp } from 'vue'
import store from './store'
import i18n, { updateTabbarText } from './lang/index'
import login from '@/store/login'

//授权提示框
import Authorize from '@/components/login/authorize.vue';
//消息提示框
import AppToast from '@/components/toast/index.vue'

//通用导航栏
import AppNavbar from '@/components/app-navbar/index.vue';
//接口访问请求
import api from '@/api/request'
import { updateCurrentPageTitle } from '@/utils/page-title'

export function createApp() {
    const app = createSSRApp(App)

    app.use(store)
    app.use(i18n)
    app.mixin({
        onShow() {
            updateCurrentPageTitle(i18n)
            updateTabbarText()
        }
    })
    app.component('authorize', Authorize)
    app.component('app-toast', AppToast)
    app.component('app-navbar', AppNavbar)
    app.config.globalProperties.$login = login
    app.config.globalProperties.API = api

    return {
        app
    }
}
