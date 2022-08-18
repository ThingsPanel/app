<<<<<<< HEAD
import Vue from 'vue'
import Vuex from 'vuex'
import list from './module/list'
Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
		list,
  },
  state: {
    name: '猪场小程序',
  },
})
export default store
=======
import Vue from "vue";
import Vuex from "vuex";

import $C from '@/common/config.js';
import $http from '@/common/request.js';
import $U from '@/common/util.js';

Vue.use(Vuex)

export default new Vuex.Store({	
	// 
	state:{
		// 
		loginStatus:false,
		token:{},
		userInfo:{},
		email:'',
		password:''
		// 
	},
	// 
	mutations:{
		// 登录
		login(state,data){ 
			// 
			state.loginStatus = true;
			// 
			let token = { 
				"access_token":data.access_token,
				"token_type":data.token_type,
				"expires_in":data.expires_in ,
			};
			// 
			state.token = token;
			// 
			uni.setStorageSync('token',JSON.stringify(state.token));
			// 
		},
		// 更新用户信息
		editUserInfo(state,obj){ 
			// 
			state.userInfo = obj;
			// 
			uni.setStorageSync('userInfo',JSON.stringify(state.userInfo));
			// 
		},
		// 更新用户字段
		editUserInfoField(state,{key,value}){
			// 
			state.userInfo[key] = value;
			uni.setStorageSync('userInfo',JSON.stringify(state.userInfo));
			// 
		},		
		// 退出登录
		logout(state){
			// 
			state.loginStatus 	= false;
			state.token 		= {};
			state.userInfo		= {};
			// 
			uni.removeStorageSync('token');
			// 
			uni.removeStorageSync('userInfo');
			// 
		}
		// 
	},
	// 
	actions:{
		// 初始化登录状态
		initUser({state,dispatch}){
			// 
			let token = uni.getStorageSync('token');
			// 
			if(token){
				//
				state.loginStatus 		= true;
				state.token 			= JSON.parse(token);
				// 
			}
			let userinfo = uni.getStorageSync('userInfo');
			// 
			if(userinfo){
				// 
				state.userInfo = JSON.parse(userinfo);
				//
			}
			// 
		},
		// 获取用户信息
		async getUserInfo({state,commit}){ 
			//
			$http.post('/auth/me',{},{ token:true }).then(res=>{ 
				// 
				commit('editUserInfo',res);
				//
			}).catch(err=>{
				console.log(err);
			});
			//
		}
		// 
	} 
	// 
})
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
