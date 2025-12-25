<script>
	export default {
		onLaunch: async function() {
			uni.onPushMessage(async (res) => {
				console.log('收到推送消息==>:', res);
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

			uni.getPushClientId({
				success: (res) => {
					const push_clientid = res.cid;
					console.log('客户端推送标识==>:', push_clientid);
				},
				fail(err) {
					console.log("获取客户端标识错误:", err);
				}
			});
		},
		onShow: function() {
			// console.log('App Show')
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
