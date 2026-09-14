<template>
	<view class="tp-box">

		<!-- Main Content -->
		<view class="tp-content">
			<view class="rule-entry" @click="openAlarmRules">
				<view>
					<text class="rule-entry-title">{{$t('pages.alarmRules.title')}}</text>
				</view>
				<text class="rule-entry-arrow">›</text>
			</view>
			<!-- Empty State -->
			<view class="empty-state" v-if="!loading && !list.length">
				<text class="empty-text">{{$t('pages.alarms.noAlerts')}}</text>
			</view>

			<!-- Alert List -->
			<view class="panel">
				<view
					class="alarm-row"
					:class="getLevelClass(item.alarm_level)"
					v-for="item in list"
					:key="item.id"
					@click.stop="goDetail(item)"
				>
					<view class="alarm-copy">
						<view class="alarm-head">
							<text class="alarm-name">{{ item.name || '--' }}</text>
							<text class="alarm-level">{{$t(`pages.alarms.alarmLevels.${item.alarm_level || 'default'}`)}}</text>
						</view>
						<text v-if="item.content" class="alarm-description">{{ item.content }}</text>
						<text class="alarm-time">{{formatAlarmTime(item.create_at || item.created_at)}}</text>
					</view>
					<text class="row-arrow">›</text>
				</view>
			</view>
		</view>

		<NotifyDialog
			:visible="showDialog" 
			@close="closeDialog" 
			:id="handleInfo.id" 
			:status="handleInfo.status" />

		<!-- Scroll to Top Button -->
		<button class="scroll-to-top" v-if="showScrollTop" :aria-label="$t('pages.devices.backToTop')" hover-class="scroll-to-top--pressed" @click="scrollToTop">
			<view class="scroll-top-arrow" aria-hidden="true" />
		</button>
	</view>
</template>

<script>
import NotifyDialog from '@/components/notify-dialog'
import { formatAlarmTime } from '@/utils/datetime'

export default {
	components: { NotifyDialog },
		data() {
		return {
			page: 1,
			pageSize: 10,
			loadEnd: false,
			loading: false,
			list: [],
			showDialog: false,
			handleInfo: {
				id: '',
				status: ''
			},
			showScrollTop: false // 控制回到顶部按钮显示
		}
	},
	onShow() {
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('pages.alarmsTitle')
				})
			}, 100)
		})
	},
	// 监听页面滚动
	onPageScroll(e) {
		// 当滚动超过300px时显示回到顶部按钮
		this.showScrollTop = e.scrollTop > 300;
	},
	methods: {
		openAlarmRules() {
			uni.navigateTo({ url: '/pages/alarm-rules/index' })
		},
		// 滚动到顶部
		scrollToTop() {
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 300 // 动画持续时间，单位ms
			});
		},
		formatAlarmTime,
		getLevelClass(level) {
			// 接口既有 'H'/'M'/'L' 字符串，也有 '1'/'2'/'3' 数字，两种都要认
			const levelMap = {
				H: 'level-high',
				M: 'level-medium',
				L: 'level-low',
				'1': 'level-high',
				'2': 'level-medium',
				'3': 'level-low'
			}
			return levelMap[String(level ?? '').toUpperCase()] || 'level-default'
		},
		closeDialog(refresh){
			this.showDialog = false
			if(refresh){
				this.list = this.list.filter(l => l.id !== this.handleInfo.id)
			}
			this.handleInfo = {id :'', status: ''}
		},

		async goDetail(item) {
			if (!item) {
				console.error('Invalid item data:', item);
				return;
			}
			try {
				const res = await new Promise((resolve, reject) => {
					uni.navigateTo({
						url: '/pages/alarms/detail',
						success: resolve,
						fail: reject
					});
				});
				if (res.eventChannel) {
					// 添加延迟确保监听器已设置
					await new Promise(resolve => setTimeout(resolve, 100));
					res.eventChannel.emit('acceptData', { item: item });
				} else {
					console.error('Failed to get event channel');
				}
			} catch (err) {
				console.error('Navigation failed:', err);
			}
		},

		process(id, status) {
			this.showDialog = true
			this.handleInfo = {id, status}
			// uni.showModal({
			// 	title: `点击确定${status === '1' ? '处理' : '忽略'}警告`,
			// 	confirmText: '确定',
			// 	cancelText: '取消',
			// 	editable: status === '1',
			// 	placeholderText: '选填',
			// 	success: res => {
			// 		if (res.confirm) {
			// 			this.API.apiRequest('/api/v1/warning/information/edit', {
			// 				id, processing_result: status, processing_instructions: res.content
			// 			}, 'post').then(res => {
			// 				if (res.code === 200) {
			// 					uni.showToast({
			// 						title: '操作成功'
			// 					})
			// 					this.list = this.list.filter(l => l.id !== id)
			// 				}
			// 			})
			// 		}
			// 	}
			// })
		},
		getList(reset = false) {
			if (this.loading) return
			this.loading = true
			this.API.apiRequest('/api/v1/alarm/info/history', {
				page: this.page,
				page_size: this.pageSize
			}, 'get').then(res => {
				if (res.code === 200) {
					const list = res.data.list || []
					this.list = reset ? list : this.list.concat(list)
					if (list.length < this.pageSize) {
						this.loadEnd = true
					}
				} else {
					throw new Error('alarm history load failed')
				}
			}).catch(() => {
				if (!reset && this.page > 1) this.page--
				uni.showToast({ title: this.$t('account.edit.loadFailed'), icon: 'none' })
			}).finally(() => {
				this.loading = false
				uni.stopPullDownRefresh()
			})
		}
	},
	onLoad() {
		this.getList()
	},
	onReachBottom() {
		if (!this.loadEnd && !this.loading) {
			this.page++
			this.getList()
		}
	},
	onPullDownRefresh() {
		if (!this.loading) {
			this.page = 1
			this.loadEnd = false
			this.getList(true)
		}
	}
}
</script>

<style lang="scss" scoped>
.rule-entry {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	border: 0;
	border-radius: 12rpx;
	background: #ffffff;

	&:active {
		background: #f8f9fb;
	}
}

.rule-entry-title,


.rule-entry-title {
	margin-bottom: 0;
	color: #1d1d1f;
	font-size: 27rpx;
	font-weight: 600;
	line-height: 40rpx;
}

.rule-entry-desc {
	max-width: 560rpx;
	color: #73737d;
	font-size: 22rpx;
	line-height: 32rpx;
}

.rule-entry-arrow {
	color: #b0b7c3;
	font-size: 34rpx;
	line-height: 40rpx;
	margin-left: 12rpx;
	flex-shrink: 0;
}

/* Global Reset & Base */
.tp-box {
	width: 100%;
	min-height: 100vh;
	background: #F2F2F7;
	position: relative;
	overflow: hidden;
	color: #51515c;
	font-size: 22rpx;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

	/* 告警等级色板（鲜艳实色，与 alarm-rules 保持一致；本地声明避免依赖全局注入时序） */
	--alarm-high: #FF4D35;
	--alarm-medium: #FF9500;
	--alarm-low: #1677ff;
	--alarm-default: #98a2b3;
}

/* Content */
.tp-content {
	position: relative;
	z-index: 1;
	padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	gap: 22rpx;
}

/* Empty State */
.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 60vh;
	padding: 100rpx 30rpx;

	.empty-text {
		font-size: 27rpx;
		color: #73737d;
		text-align: center;
	}
}

/* Alert List —— 与首页「告警动态」panel 同构：单个面板 + 行内分隔线 */
.panel {
	background: #ffffff;
	border: 0;
	border-radius: 12rpx;
	box-shadow: none;
	overflow: hidden;
}

.alarm-row {
	position: relative;
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	padding: 24rpx;
	border-top: 1rpx solid #eeeef2;

	&:first-child {
		border-top: 0;
	}

	&:active {
		background: #f8f9fb;
	}
}

.alarm-copy {
	flex: 1;
	min-width: 0;
}

.alarm-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.alarm-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #1d1d1f;
	font-size: 27rpx;
	font-weight: 600;
	line-height: 40rpx;
}

/* 等级标签：饱和主色实底 + 白字，保证一眼可辨 */
.alarm-level {
	flex-shrink: 0;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	font-weight: 600;
	color: #ffffff;
	background: var(--alarm-default);
}

.alarm-row.level-high .alarm-level { background: var(--alarm-high); }
.alarm-row.level-medium .alarm-level { background: var(--alarm-medium); }
.alarm-row.level-low .alarm-level { background: var(--alarm-low); }

.alarm-description {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	color: #73737d;
	font-size: 22rpx;
	line-height: 34rpx;
	margin-top: 6rpx;
	word-break: break-word;
}

.alarm-time {
	display: block;
	color: #73737d;
	font-size: 20rpx;
	line-height: 30rpx;
	margin-top: 10rpx;
	font-variant-numeric: tabular-nums;
}

.row-arrow {
	flex-shrink: 0;
	color: #b0b7c3;
	font-size: 34rpx;
	line-height: 40rpx;
	align-self: center;
}

/* Scroll to Top Button */
.scroll-to-top {
	position: fixed;
	right: 40rpx;
	bottom: 140rpx;
	width: 44px;
	height: 44px;
	margin: 0;
	padding: 0;
	background: #fff;
	color: #1677FF;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #dce6f3;
	box-shadow: none;
	z-index: 999;
	&::after { border: none; }
	&:active, &.scroll-to-top--pressed { background: #edf4ff; }
}
.scroll-top-arrow {
	position: relative;
	width: 20px;
	height: 20px;
	&::before { content: ''; position: absolute; left: 4px; top: 4px; width: 10px; height: 10px; border-top: 2px solid currentColor; border-left: 2px solid currentColor; transform: rotate(45deg); }
	&::after { content: ''; position: absolute; left: 9px; top: 3px; width: 2px; height: 16px; background: currentColor; }
}
</style>
