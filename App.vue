<script>
	export default {
		onLaunch: function() {
			// console.log('App Launch')
			uni.getPushClientId({  
				// success: (res) => {
				// 	console.log('客户端推送标识cid:', res.cid);
				// },
				fail(err) {  
						console.log(err)  
				}
			});
		},
		async onShow() {
			// console.log('App Show')
			uni.onPushMessage(async (res) => {
				// console.log("收到推送消息：",res) //监听推送消息
				if (res.type == 'receive') {  
					uni.createPushMessage({  
						title: res.data.title,  
						content: res.data.content,  
						payload: res.data.payload,  
					})
				} else if (res.type == 'click') {
					const { alarm_id } = res.data.payload;
					const headers = {
						'Authorization': `Bearer ${uni.getStorageSync("access_token")}`
					};
					const apiUrl = `/api/v1/alarm/info/history/${alarm_id}`;
					try {
						const { code, data } = await this.fetchAlarmInfo(apiUrl, headers);
						if (code === 200) {
							this.navigateToDetail(data);
						} else {
							console.error('API request failed with code:', code);
						}
					} catch (error) {
						console.error('API request failed:', error);
					}
				}
			});
		},
		methods: {
			async fetchAlarmInfo(url, headers) {
				const response = await this.API.apiRequest(url, null, 'get', headers);
				return response && typeof response.then === 'function' 
					? await response 
					: response;
			},
			navigateToDetail(data) {
				uni.navigateTo({
					url: '/pages/notify/detail',
					success: (navRes) => {
						if (navRes.eventChannel) {
							navRes.eventChannel.emit('acceptData', { item: data });
						}
					}
				});
			}
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
