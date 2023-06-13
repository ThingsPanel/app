//
import $C from '@/common/config.js';
import $store from '@/store/index.js';
// 
export default{
	//
	common:{
		method:"GET",
		header:{
			'Content-Type':'application/json;charset=UTF-8',
			'Content-Type':'application/x-www-form-urlencoded'
		},
		data:{}
	},
	//
	request(options = {}){
		// 
		options.url = $C.webUrl + options.url; 
		options.method = options.method || this.common.method; 
		options.header = options.header || this.common.header;
		// 验证token
		if(options.token){
			options.header.Authorization = $store.state.token.token_type + ' ' + $store.state.token.access_token;
			if(!options.header.Authorization){
				return uni.showToast({
					title:'非法token，请重新登录',
					icon:'none'
				})
			}
		}
		//
		return new Promise((res,rej)=>{
			uni.request({
				...options,
				success:(result)=>{ 					
					// 返回原始数据
					if(options.native){
						return res(result);
					}
					// 请求服务端失败
					if( result.data.code !== 200 ){
						uni.showToast({
							title:result.data.message,
							icon:'none'
						})
						return rej(result.data);
					}
					// 请求服务端成功
					res(result.data.data);
				},
				fail:(error)=>{
					uni.showToast({
						title:error.errMsg || '请求失败',
						icon:'none'	
					});
					return rej();
				}
			})
		})
		// 
	},
	//
	get(url,data = {},options = {}){
		// 
		options.url = url;
		options.data = data;
		options.method = "GET";
		// 
		return this.request(options);
		// 
	},
	//
	post(url,data = {},options = {}){
		//
		options.url = url;
		options.data = data;
		options.method = "POST";
		// 
		return this.request(options);
		// 
	},
	// 上传图片
	upload(url,options = {}){
		// 
		options.url = $C.webUrl + url; 
		options.header = options.header || {};
		// 验证token
		if(options.token){
			options.header.token = $store.state.token;
			if(!options.header.token){
				return uni.showToast({
					title:'非法token，请重新登录',
					icon:'none'
				})
			}
		}
		// 
		return new Promise((res,rej)=>{
			uni.uploadFile({
				...options,
				success:(uploadFileRes)=>{
					// 
					if(uploadFileRes.statusCode != 200 ){
						return uni.showToast({
							title:'上传图片失败',
							icon:'none'
						})
					}
					//
					let data = JSON.parse(uploadFileRes.data);
					// 
					res(data);
					//
				},
				fail:(err)=>{
					rej(err)
				}
			})
		});	
		// 
	},
	// 
}