<script>
	export default {
		onLaunch: function() {
			// console.log('App Launch')
			uni.getPushClientId({  
				success: (res) => {
					console.log('客户端推送标识cid:', res.cid);
					console.log(plus.push.getClientInfo());
				},
				fail(err) {  
						console.log(err)  
				}
			});
		},
		onShow: function() {
			// console.log('App Show')
			uni.onPushMessage((res) => {
				console.log("收到推送消息：",res) //监听推送消息
				if (res.type == 'receive') {  
					uni.createPushMessage({  
						title: res.data.title,  
						content: res.data.content,  
						payload: res.data.payload,  
					})
				}else if (res.type =='click') {
					console.log('payload device id: ', res.data.payload.device_id);
					const device_id = res.data.payload.device_id; //'d59ea842-b798-8994-4e41-f3c0db565cdf';
					const token = uni.getStorageSync("access_token");
					const serverUrl = uni.getStorageSync('serverAddress');
					const url = `${serverUrl}/device-details-app?d_id=${device_id}&token=${token}`;
					uni.navigateTo({
						url: `/pages/webViewPage/webViewPage?url=${encodeURIComponent(url)}`
					});
				}
			});
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/* 引入公共样式 */
	@import './common/uni.css';
	/* 引入字体库样式 */
	@import './common/icon.css';
	/* 引入动画库 */
	@import './common/animate.css';
	/* 引入公共库样式 */
	@import './common/util.css';
	/* */ 
	@import './common/common.css';
</style>
