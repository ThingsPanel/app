<script>
	import { registerNotificationDevice, canRegisterPushAutomatically, logNotificationError } from '@/services/notification-permission'
	import { acceptsNotification, parseNotificationMessage, notificationRejectionReason } from '@/services/push-routing'
	import { loadAlarmDetail } from '@/services/alarm-detail'
	import { reportAppError } from '@/services/app-errors'
	// #ifdef MP-WEIXIN
	import { initMpUpdate, setMpUpdateForeground } from '@/services/mp-update'
	// #endif
	import { logPushDebug, pushDebugContext, pushDebugError } from '@/services/push-debug'
	export default {
		onError(error) { reportAppError(error, 'runtime') },
		onUnhandledRejection(event) { reportAppError(event?.reason, 'promise') },
		onLaunch: async function() {
			// #ifdef MP-WEIXIN
			initMpUpdate();
			// #endif
			logPushDebug('app.launch', pushDebugContext());
			uni.onPushMessage(async (res) => {
                const message = parseNotificationMessage(res.data);
                const notificationPayload = message?.payload;
                const pushBinding = uni.getStorageSync('push_binding');
                const pushServer = uni.getStorageSync('serverAddress');
                const pushToken = uni.getStorageSync('access_token');
                const reason = notificationRejectionReason(notificationPayload, pushBinding, `${pushServer}|${pushToken}`);
                if (reason) {
                    const separator = typeof pushBinding?.session === 'string' ? pushBinding.session.indexOf('|') : -1;
                    logPushDebug('message.ignored', {
                        reason, type: res.type, dataType: typeof res.data,
                        hasToken: Boolean(pushToken), hasBindingSession: separator >= 0,
                        serverMatches: separator >= 0 && pushBinding.session.slice(0, separator) === pushServer,
                        tokenMatches: separator >= 0 && pushBinding.session.slice(separator + 1) === pushToken
                    });
                    return;
                }

				logPushDebug('message.' + res.type, { alarmId: notificationPayload.alarm_id, hasTitle: Boolean(message.title), hasContent: Boolean(message.content) });
				if (res.type == 'receive') {  
					uni.createPushMessage({  
						title: message.title,
						content: message.content,
						payload: notificationPayload,
						success: () => logPushDebug('notification.created'),
						fail: error => logPushDebug('notification.failed', pushDebugError(error), 'error'),
					})
				} else if (res.type == 'click') {
					const payload = notificationPayload;
					const alarm_id = payload?.alarm_id;
					if (!alarm_id) { logPushDebug('click.missing-alarm-id', {}, 'warn'); return; }
					const headers = {
						'Authorization': `Bearer ${uni.getStorageSync("access_token")}`
					};
					const recordType = payload.alarm_kind === 'info' ? 'info' : 'history';
					try {
						const data = await loadAlarmDetail((url, body, method) => this.API.apiRequest(url, body, method, headers), alarm_id, recordType);
						if (!acceptsNotification(payload, uni.getStorageSync('push_binding'), `${uni.getStorageSync('serverAddress')}|${uni.getStorageSync('access_token')}`)) return;
						logPushDebug('alarm.response', { alarmId: alarm_id, code: 200 });
						this.navigateToDetail(data);
					} catch (error) {
						logPushDebug('alarm.failed', pushDebugError(error), 'error');
						uni.showToast({ title: '告警详情加载失败，请稍后重试', icon: 'none' });
					}
				}
			});

			// 推送 ID 由登录流程获取并绑定；启动时不为日志重复请求连接。
		},
		onShow: function() {
			// #ifdef MP-WEIXIN
			setMpUpdateForeground(true);
			// #endif
			// #ifdef APP-PLUS
			uni.$emit('notification-permission-refresh');
            if (canRegisterPushAutomatically()) registerNotificationDevice().catch(logNotificationError);
			// #endif
			// console.log('App Show')
		},
		methods: {
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
			// #ifdef MP-WEIXIN
			setMpUpdateForeground(false);
			// #endif
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
