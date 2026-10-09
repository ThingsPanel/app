<script>
	import { reportAppError } from '@/services/app-errors'
	import { logPushDebug, pushDebugContext, pushDebugError } from '@/services/push-debug'
	export default {
		onError(error) { reportAppError(error, 'runtime') },
		onUnhandledRejection(event) { reportAppError(event?.reason, 'promise') },
		onLaunch: async function() {
			logPushDebug('app.launch', pushDebugContext());
			uni.onPushMessage(async (res) => {
				logPushDebug('message.' + res.type, { alarmId: res.data?.payload?.alarm_id, hasTitle: Boolean(res.data?.title), hasContent: Boolean(res.data?.content) });
				if (res.type == 'receive') {  
					uni.createPushMessage({  
						title: res.data.title,  
						content: res.data.content,  
						payload: res.data.payload,
						success: () => logPushDebug('notification.created'),
						fail: error => logPushDebug('notification.failed', pushDebugError(error), 'error'),
					})
				} else if (res.type == 'click') {
					let payload = res.data?.payload;
					if (typeof payload === 'string') {
						try { payload = JSON.parse(payload); } catch { logPushDebug('click.invalid-payload', {}, 'error'); return; }
					}
					const alarm_id = payload?.alarm_id;
					if (!alarm_id) { logPushDebug('click.missing-alarm-id', {}, 'warn'); return; }
					const headers = {
						'Authorization': `Bearer ${uni.getStorageSync("access_token")}`
					};
					const apiUrl = `/api/v1/alarm/info/history/${alarm_id}`;
					try {
						const { code, data } = await this.fetchAlarmInfo(apiUrl, headers);
						logPushDebug('alarm.response', { alarmId: alarm_id, code });
						if (code === 200) {
							this.navigateToDetail(data);
						} else {
							console.error('API request failed with code:', code);
						}
					} catch (error) {
						logPushDebug('alarm.failed', pushDebugError(error), 'error');
					}
				}
			});

			// 推送 ID 由登录流程获取并绑定；启动时不为日志重复请求连接。
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
	@import './styles/semantic-colors.css';
	/* 引入公共样式 */
	@import './styles/uni-components.css';
	/* 引入字体库样式 */
	@import './styles/icon-font.css';
	/* 引入动画库 */
	@import './styles/animations.css';
	/* 引入公共库样式 */
	@import './styles/utilities.css';
	/* 告警等级统一色板 */
	@import './styles/alarm-level.css';
	/* */ 
	@import './styles/global.css';
	@import './styles/overlays.css';

	/* #ifdef H5 */
	/* 固定导航内容的行盒，避免字体加载和页面切换改变图文的垂直位置。 */
	uni-tabbar .uni-tabbar__bd {
		flex: 0 0 auto;
		height: 52px;
		min-height: 52px;
		font-family: inherit;
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
