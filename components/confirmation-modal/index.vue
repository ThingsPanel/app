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
			modelValue: {
				type: Boolean,
				default: false
			}
		},
		data(){
			return{
				showValue: this.modelValue
			}
		},
		watch: {
			modelValue(n, o){
				this.showValue = n
			},
			showValue(n, o){
				this.$emit('update:modelValue', n)
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
	$fontSizeLg: 16px;
	$fontSizeSm: 14px;
	
	.modal-container{
		position:fixed;top:0;left:0;right:0;bottom:0;z-index:10030;background:rgba(16,24,40,.42);visibility:hidden;opacity:0;transition:opacity .18s ease;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;
		.modal-content{
			width:min(100%, 320px);border:1px solid #edf0f3;border-radius:12px;background:#fff;overflow:hidden;animation:modalEnter .18s ease-out;box-shadow:0 8px 28px rgba(16,24,40,.16);
			.modal-title{
				padding:20px 20px 0;text-align:center;color:#172033;font-size:$fontSizeLg;font-weight:600;line-height:24px;
			}
			.modal-title-padding{padding-bottom:20px;}
			.modal-article{
				padding:12px 20px 20px;font-size:$fontSizeSm;color:#667085;text-align:center;line-height:1.5;font-weight:400;
			}
			.modal-row{
				display:flex;text-align:center;font-size:14px;line-height:48px;position:relative;color:#344054;
				.modal-col{
					flex: 1;width: 100%;position: relative;
				}
				.modal-col:first-child::after{
					content: '';position: absolute;top: 0;bottom: 0;right: 0;border-right: 1px solid #e5e5e5;transform: scaleX(.36);
				}
				.modal-confirm{color:#1677ff;font-weight:600;}
				.modal-hover{background:#f7f8fa;}
			}
			.modal-row::after{
				content: '';position: absolute;left: 0;right: 0;top: 0;border-top: 1px solid #e5e5e5;transform: scaleY(.36);
			}
		}
		@keyframes modalEnter {
			from{transform:scale(.96);opacity:0;}
			to{transform:scale(1);opacity:1;}
		}
	}
	.modal-container.show{
		visibility: visible;opacity: 1;
	}
</style>
