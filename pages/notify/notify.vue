<template>
	<view class="tp-box">
		<!-- Background Elements for Atmosphere -->
		<view class="bg-glow-1"></view>
		<view class="bg-glow-2"></view>

		<!-- Main Content -->
		<view class="tp-content">
			<!-- Empty State -->
			<view class="empty-state" v-if="!loading && !list.length">
				<text class="empty-text">{{$t('pages.notify.noAlerts')}}</text>
			</view>

			<!-- Alert List -->
			<view class="alert-list">
				<view class="tp-panel alert-card" v-for="item in list" :key="item.id" @click.stop="goDetail(item)">
					<view class="card-inner">
						<!-- Alert Description Header -->
						<view class="alert-header">
							<view class="alert-badge" :class="getLevelClass(item.alarm_level)">
								<view class="badge-dot"></view>
								<text class="badge-text">{{$t(`pages.notify.alarmLevels.${item.alarm_level}`)}}</text>
							</view>
							<text class="alert-desc">{{item.warning_description}}</text>
						</view>

						<!-- Alert Details -->
						<view class="alert-details">
							<view class="detail-item">
								<text class="detail-label">{{$t('pages.notify.alertName')}}</text>
								<text class="detail-value">{{item.name}}</text>
							</view>
							<view class="detail-item" v-if="item.content">
								<text class="detail-label">{{$t('pages.notify.alertContent')}}</text>
								<text class="detail-value">{{item.content}}</text>
							</view>
							<view class="detail-item">
								<text class="detail-label">{{$t('pages.notify.alertTime')}}</text>
								<text class="detail-value time-value">{{formatDate(item.created_at)}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<NotofyDialog 
			:visible="showDialog" 
			@close="closeDialog" 
			:id="handleInfo.id" 
			:status="handleInfo.status" />
		
		<!-- Scroll to Top Button -->
		<view class="scroll-to-top" v-if="showScrollTop" @click="scrollToTop">
			<image src="/static/icon/top.png" class="scroll-icon-img" mode="aspectFit" />
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs'
import NotofyDialog from '@/components/notify-dialog'

export default {
	components: {NotofyDialog},
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
		uni.setNavigationBarTitle({
			title: this.$t('pages.notifyTitle')
		})
	},
	// 监听页面滚动
	onPageScroll(e) {
		// 当滚动超过300px时显示回到顶部按钮
		this.showScrollTop = e.scrollTop > 300;
	},
	methods: {
		// 滚动到顶部
		scrollToTop() {
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 300 // 动画持续时间，单位ms
			});
		},
		formatDate(date) {
			return dayjs(date).format('YYYY-MM-DD HH:mm')
		},
		getLevelClass(level) {
			const levelMap = {
				'1': 'level-high',
				'2': 'level-medium',
				'3': 'level-low'
			}
			return levelMap[level] || 'level-default'
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
						url: '/pages/notify/detail',
						events: {
							acceptData: (data) => {
								console.log('Data received:', data);
							}
						},
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
		getList() {
			this.loading = true
			this.API.apiRequest('/api/v1/alarm/info/history', {
				page: this.page,
				page_size: this.pageSize
			}, 'get').then(res => {
				if (res.code === 200) {
					const list = res.data.list || []
					this.list = this.list.concat(list)
					if (list.length < this.pageSize) {
						this.loadEnd = true
					}
				}
			}).finally(() => {
				this.loading = false
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
			this.getList()		
		}
	}
}
</script>

<style lang="scss" scoped>
/* Global Reset & Base */
.tp-box {
	width: 100%;
	min-height: 100vh;
	background: #f5f7fa;
	position: relative;
	overflow: hidden;
	color: #334155;
	font-size: 28rpx;
}

/* Ambient Background Glows */
.bg-glow-1 {
	position: absolute;
	top: -10%;
	left: -10%;
	width: 700rpx;
	height: 700rpx;
	background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
	border-radius: 50%;
	z-index: 0;
	pointer-events: none;
	filter: blur(40px);
}
.bg-glow-2 {
	position: absolute;
	bottom: 5%;
	right: -5%;
	width: 600rpx;
	height: 600rpx;
	background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
	border-radius: 50%;
	z-index: 0;
	pointer-events: none;
	filter: blur(40px);
}

/* Content */
.tp-content {
	position: relative;
	z-index: 1;
	padding: 30rpx;
}

/* Empty State */
.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 60vh;
	padding: 100rpx 30rpx;
	
	.empty-text {
		font-size: 32rpx;
		color: #94a3b8;
		text-align: center;
	}
}

/* Alert List */
.alert-list {
	padding-bottom: 40rpx;
}

.tp-panel {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 32rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 30rpx;
	transition: all 0.3s ease;
	overflow: hidden;
}

.alert-card:active {
	transform: scale(0.98);
	background: rgba(255, 255, 255, 0.9);
}

.card-inner {
	padding: 30rpx;
}

/* Alert Header */
.alert-header {
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	
	.alert-desc {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
		line-height: 1.5;
		margin-top: 16rpx;
		display: block;
	}
}

.alert-badge {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 20rpx;
	border-radius: 50rpx;
	font-size: 22rpx;
	font-weight: 600;
	
	.badge-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}
	
	.badge-text {
		font-size: 22rpx;
	}
	
	&.level-high {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		
		.badge-dot {
			background: #ef4444;
			box-shadow: 0 0 8rpx rgba(239, 68, 68, 0.4);
		}
	}
	
	&.level-medium {
		background: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
		
		.badge-dot {
			background: #f59e0b;
			box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.4);
		}
	}
	
	&.level-low {
		background: rgba(100, 108, 255, 0.1);
		color: #646cff;
		
		.badge-dot {
			background: #646cff;
			box-shadow: 0 0 8rpx rgba(100, 108, 255, 0.4);
		}
	}
	
	&.level-default {
		background: #f1f5f9;
		color: #94a3b8;
		
		.badge-dot {
			background: #cbd5e1;
		}
	}
}

/* Alert Details */
.alert-details {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.detail-item {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	font-size: 26rpx;
	
	.detail-label {
		color: #94a3b8;
		margin-right: 16rpx;
		flex-shrink: 0;
		min-width: 140rpx;
		font-size: 26rpx;
	}
	
	.detail-value {
		flex: 1;
		color: #1e293b;
		word-break: break-word;
		line-height: 1.6;
		
		&.time-value {
			font-family: monospace;
			color: #64748b;
		}
	}
}

/* Scroll to Top Button */
.scroll-to-top {
	position: fixed;
	right: 40rpx;
	bottom: 140rpx;
	width: 88rpx;
	height: 88rpx;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.8);
	z-index: 999;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	
	.scroll-icon-img {
		width: 44rpx;
		height: 44rpx;
		opacity: 0.8;
	}
	
	&:active {
		transform: scale(0.92);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
