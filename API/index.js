import login from '../store/login'
import http from './interface'

/**
 * 将业务所有接口统一起来便于维护
 * 如果项目很大可以将 url 独立成文件，接口分成不同的模块
 * 
 */
export const apiRequest = (url, data, method) => {
	//设置请求前拦截器
	http.interceptor.request = (config) => {
		let token = uni.getStorageSync("access_token")
		delete config.header['x-token']
		if (token) {
			config.header['x-token'] = token
		}
		let server = uni.getStorageSync("serverAddress")
		// console.log("server",server);
		if (server) {
			config.baseUrl = server
		}
		return config;
	}
	//设置请求结束后拦截器
	http.interceptor.response = async (response) => {
		const statusCode = response.data.code;
		if (statusCode === 401 || statusCode === 403 || statusCode === 402) {
			uni.showModal({
				title: '提示',
				content: '您的登录已过期,请重新登录!',
				showCancel: false,
				success: function(res) {
					uni.clearStorageSync() //清空所有缓存
					uni.navigateTo({
						url: '/pages/login/login'
					})
				},
			})
			
		}
		// 统一处理错误请求
		return response.data;
	}
	return http.request({
		url: url,
		data: data,
		method: method,
		dataType: 'json',
	})
}
// 刷新 token 方法
async function doRequest(response) {
	var params = {
		refreshToken: uni.getStorageSync('refreshToken'),
		token: uni.getStorageSync('accessToken')
	}
	const res = await apiRequest('/api/v1/user/refresh', params, 'POST')
	if (res && res.statusCode === 200) {
		let config = response.config
		uni.setStorageSync('accessToken', res.data.result.token)
		uni.setStorageSync('refreshToken', res.data.result.refreshToken)
		config.header['x-token'] = res.data.result.token
		const resold = await apiRequest('/api/v1' + getStrAfter(config.url, '/api/v1'), {
			...config.data
		}, config.method)
		return resold
	}
}

function getStrAfter(string, str) {
	var str_after = string.split(str)[1];
	return str_after
}
// 默认全部导出  
export default {
	apiRequest
}
