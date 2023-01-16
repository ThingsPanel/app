/* 判断登录状态 */
let isLoginType = function() {
	let userDeatail = {
		userid: '',
		isAuth: false,
		openId: '',
		isLogin: false,
	}
	try {
		let userId = uni.getStorageSync('access_token'); //登录
		let openId = uni.getStorageSync('userWxInfo');
		if (userId && openId) {
			userDeatail = {
				userid: userId,
				openId: openId,
				isAuth: true,
				isLogin: true
			}
			return userDeatail
		} else if (userId && !openId) {
			userDeatail = {
				userid: '',
				openId: '',
				isAuth: false,
				isLogin: true
			}
			return userDeatail
		} else if (!userId && openId) {
			userDeatail = {
				userid: '',
				openId: '',
				isAuth: true,
				isLogin: false
			}
			return userDeatail
		} else if (!userId && !openId) {
			userDeatail = {
				userid: '',
				openId: '',
				isAuth: false,
				isLogin: false
			}
			return userDeatail
		}
	} catch (e) {
		userDeatail = {
			userid: '',
			openId: '',
			isAuth: false,
			isLogin: false
		}
		return userDeatail
	}
}
module.exports = {
	isLoginType: isLoginType
}
