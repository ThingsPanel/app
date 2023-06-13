<template>
	<view 
		v-if="value"
		class="customizePopup"
		@click.stop="maskClosePopup"
		@touchmove.stop.prevent="stopScrolling"
		
		:style="{
			zIndex,
			'backgroundColor': maskBackgroundColor
		}"
	>
		<view 
			@click.stop.prevent
			class="customizePopup-content"
		>
			<view class="customizePopup-content-header">
				{{ title }}
			</view>
			
			<view 
				:style="{'textAlign': mainAlign}"
				class="customizePopup-content-main"
			>
				<slot name="main">
					{{ content }}
				</slot>
			</view>
			
			<slot name="footer">
				<view class="customizePopup-content-footer">
						<button 
							type="default"
							:disabled="isLoading"
							@click="popupCloseCallBack"
						>
							{{ cancelText }}
						</button>
						<button 
							type="default"
							:loading="isLoading"
							@click="popupSubmitCallBack"
						>
							{{ confirmText }}
						</button>
				</view>
			</slot>
			
		</view>
		
	</view>
</template>

<script>

	export default {
		name: 'customizePopup',

		props: {
			// 显示/隐藏
			value: {
				type: Boolean,
				default: false
			},
			// 蒙层透明度
			opacity: {
				type: Number | String,
				default: 0.5
			},
			
			// 权重
			zIndex: {
				type: Number | String,
				default: 999
			},
			
			// 内容位置
			mainAlign: {
				type: String,
				default: 'center'
			},
			
			isMask: {
				type: Boolean,
				default: true
			},
			
			// 关闭弹框
			closeCallBack: {
				type: Function
			},
			
			// 确定弹框回调
			submitCallBack: {
				type: Function
			},
			
			// 标题
			title: {
				type: String,
				default: '提示'
			},
			
			// 内容
			content: {
				type: String,
				default: '确认此评论通过审核吗？'
			},
			
			// 取消按钮的文字，默认为"取消"
			cancelText: {
				type: String,
				default: '取消'
			},
	
			// 确定按钮的文字，默认为"确定"
			confirmText: {
				type: String,
				default: '确定'
			},
			
			// 其他参数
			popupParams: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		
		data() {
			return {
				isLoading: false
			}
		},
		
		computed: {
			maskBackgroundColor() {
				const {opacity} = this
				
				return `rgba(0, 0, 0, ${opacity})`
			}
		},
		
		methods: {
			maskClosePopup() {
				const {isMask, isLoading} = this
				
				if (!isMask || isLoading) {
					return
				}
				
				this.popupCloseCallBack()
			},
			
			// 关闭弹框回调
			popupCloseCallBack() {
				const {popupParams, closeCallBack} = this
				const backType = closeCallBack && Promise.resolve(closeCallBack(popupParams))
				
				backType.then(e => {
					this.closePopup()
				})
			},
			
			// 提交弹框回调
			popupSubmitCallBack() {
				const {isLoading, popupParams, submitCallBack} = this
				
				if (isLoading) {
					return
				}
				
				const backType = submitCallBack && submitCallBack(popupParams)
				
				if (backType && backType instanceof Promise) {
					this.isLoading = true
					
					backType.finally(e => {
						this.isLoading = false
						this.closePopup()
					})
				} else {
					this.closePopup()
				}
			},
			
			// 关闭弹出框
			closePopup() {
				this.$emit('input', false)
			},
			
			// 阻止遮罩滚动穿透
			stopScrolling() {
				return
			}
		}
	}
	
</script>

<style lang="scss" scoped>
	.customizePopup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		&-content {
			position: fixed;
			top: 50%;
			left: 50%;
			color: #333;
			
			overflow: hidden;
			background: #FFF;
			min-height: 346rpx;
			border-radius: 16rpx;
			width: calc(100vw - 72rpx);
			transform: translate(-50%, -50%);
			
			&-header {
				margin-top: 52rpx;
				font-size: 36rpx;
				font-weight: 500;
				text-align: center;
			}
			
			&-main {
				font-size: 28rpx;
				line-height: 44rpx;
				
				padding: 32rpx 80rpx 70rpx;
			}
			
			&-footer {
				display: flex;

				height: 98rpx;
				box-sizing: border-box;
				border-top: 1rpx solid #E5E5E5;
				
				button {
					flex: 1;
					border: none;
					border-radius: 0;
					
					color: #666;
					font-size: 32rpx;
					
					line-height: 97rpx;
					background: transparent;
	
					&:last-child {
						color: #1677FF;
						font-weight: 500;
						border-left: 1rpx solid #E5E5E5;
					}
	
					&::after {
						display: none;
					}
				}
			}
		}
		
	}
</style>
