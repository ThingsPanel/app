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
					url: '/pages/alarms/detail',
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
	@import './styles/uni-components.css';
	/* 引入字体库样式 */
	@import './styles/icon-font.css';
	/* 引入动画库 */
	@import './styles/animations.css';
	/* 引入公共库样式 */
	@import './styles/utilities.css';
	/* */ 
	@import './styles/global.css';

	/* #ifdef H5 */
	/* 固定导航内容的行盒，避免字体加载和页面切换改变图文的垂直位置。 */
	uni-tabbar .uni-tabbar__bd {
		flex: 0 0 auto;
		height: 52px;
		min-height: 52px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}
	uni-tabbar .uni-tabbar__icon {
		flex: 0 0 20px;
	}
	uni-tabbar .uni-tabbar__icon img {
		display: block;
	}
	uni-tabbar .uni-tabbar__label {
		flex: 0 0 16px;
		height: 16px;
		line-height: 16px !important;
		font-weight: 400;
		white-space: nowrap;
	}
	/* #endif */
</style>
