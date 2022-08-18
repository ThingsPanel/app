<template>
	<view class="modal-container" :class="{show: showValue}" @touchmove.stop @click.stop='cancel(2)'>
		<view class="modal-content" v-if="showValue" @click.stop>
			<slot name='title'>
				<view class="modal-title" :class="{'modal-title-padding': !text}" v-if='title'>
					{{title}}
				</view>
			</slot>
			<slot name='text'>
				<view class="modal-article" v-html="text" v-if="text">
					<!-- text 文本信息 -->
				</view>
			</slot>
			<view class="modal-row">
				<view class="modal-col" :style="cancelStyle" hover-class="modal-hover" v-if="!noCancel" @click='cancel(1)'>
					{{cancelText}}
				</view>
				<view class="modal-col modal-confirm" :style="confirmStyle" hover-class="modal-hover" @click='confirm'>
					{{confirmText}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		name: 'modal',
		props: {
			title: {
				type: String,
				default: '提示'
			},
			text: {
				type: String,
				default: ''
			},
			noCancel: {
				type: Boolean,
				default: false
			},
			cancelText: {
				type: String,
				default: '取消'
			},
			cancelStyle: {
				type: [String, Object]
			},
			confirmText: {
				type: String,
				default: '确定'
			},
			confirmStyle: {
				type: [String, Object]
			},
			prevent: {
				type: Boolean,
				default: true
			},
			value: {
				type: Boolean,
				default: false
			}
		},
		data(){
			return{
				showValue: this.value
			}
		},
		watch: {
			value(n, o){
				this.showValue = n
			},
			showValue(n, o){
				this.$emit('input', n)
			}
		},
		methods: {
			confirm(){
				this.showValue = false
				let msg = {from: 'confirm', confirm: true}
				this.$emit('confirm', msg)
				this.$emit('event', msg)
			},
			cancel(type){
				if(this.prevent && type === 2){
					return;
				}
				this.showValue = false
				let msg = {from: type === 1 ? 'cancel' : 'mask'}
				type === 1 ? msg.cancel = true : msg.mask = true
				this.$emit('cancel', msg)
				this.$emit('event', msg)
			}
		}
	}
</script>

<style lang="scss">
	$fontSizeLg: 18px;
	$fontSizeSm: 14px;
	
	.modal-container{
		position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 999;background: rgba(0, 0, 0, .6);visibility: hidden;opacity: 0;transition: all .2s;display: flex;align-items: center;justify-content: center;
		.modal-content{
			width: 80%;border-radius: 10rpx;background: #fff;overflow: hidden;animation: fadeZoom .15s linear;
			.modal-title{
				padding: 30rpx 30rpx 0;text-align: center;color: #404040;font-size: $fontSizeLg;
			}
			.modal-title-padding{padding-bottom: 30rpx;}
			.modal-article{
				padding: 40rpx 30rpx 50rpx;font-size: $fontSizeSm;color: #999;
			}
			.modal-row{
				display: flex;text-align: center;font-size: $fontSizeLg;line-height: 100rpx;position: relative;color: #404040;
				.modal-col{
					flex: 1;width: 100%;position: relative;
				}
				.modal-col:first-child::after{
					content: '';position: absolute;top: 0;bottom: 0;right: 0;border-right: 1px solid #ccc;transform: scaleX(.36);
				}
				.modal-confirm{color: rgb(0, 122, 255);}
				.modal-hover{background: #f2f2f2;}
			}
			.modal-row::after{
				content: '';position: absolute;left: 0;right: 0;top: 0;border-top: 1px solid #ccc;transform: scaleY(.36);
			}
		}
		@keyframes fadeZoom {
			0%{transform: scale(.7);opacity: .6;}
			80%{transform: scale(1.2);opacity: .3;}
			100%{transform: scale(1);opacity: 1;}
		}
	}
	.modal-container.show{
		visibility: visible;opacity: 1;
	}
</style>
