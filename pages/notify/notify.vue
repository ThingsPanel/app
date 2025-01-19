<template>
	<view>
		<view class="empty" v-if="!loading && !list.length">
			{{$t('pages.notify.noAlerts')}}
		</view>
		<view class="list">
			<view class="item" v-for="item in list" :key="item.id">
				<view class="desc">{{item.warning_description}}</view>
				<view class="opt">
					<view class="name">
						{{$t('pages.notify.alertLevel')}}
					</view>
					<view class="content">
						{{$t(`pages.notify.alarmLevels.${item.alarm_level}`)}}
					</view>
				</view>
				<view class="opt">
					<view class="name">
						{{$t('pages.notify.alertName')}}
					</view>
					<view class="content">
						{{item.name}}
					</view>
				</view>
				<view class="opt">
					<view class="name">
						{{$t('pages.notify.alertContent')}}
					</view>
					<view class="content">
						{{item.content}}
					</view>
				</view>
				<view class="opt">
					<view class="name">{{$t('pages.notify.alertTime')}}</view>
					<view class="content">{{formatDate(item.created_at)}}</view>
				</view>
				<!--
				<view class="opt end">
					<view class="btn" @click="process(item.id, '2')">忽略</view>
					<view class="btn active" @click="process(item.id, '1')">处理</view>
				</view>
				-->
			</view>
		</view>

		<NotofyDialog 
			:visible="showDialog" 
			@close="closeDialog" 
			:id="handleInfo.id" 
			:status="handleInfo.status" />
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
				}
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('pages.notify')
			})
		},
		methods: {
			formatDate(date) {
				return dayjs(date).format('YYYY-MM-DD HH:mm')
			},
			closeDialog(refresh){
				this.showDialog = false
				if(refresh){
					// this.getList()
					this.list = this.list.filter(l => l.id !== this.handleInfo.id)
				}
				this.handleInfo = {id :'', status: ''}
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

<style scoped>
.list{
	padding: 20px 12px;
}
.item{
	/* border: 1px solid #d6d6d6; */
	padding: 6px;
	border-radius: 4px;
	background-color: #fff;
}
.item ~ .item{
	margin-top: 12px;
}
.desc{
	color: #ef4444;
	font-size: 16px;
}
.opt{
	display: flex;
	font-size:14px;
	margin-top: 5px;
}
.opt.end{
	justify-content: end;
}
.name{
	color: #737373;
	margin-right: 10px;
}
.content{
	flex:1;
	color:#404040;
}
.empty{
	margin-top:50px;
	font-size: 20px;
	text-align: center;
}
.btn{
	padding: 4px 10px;
	border-radius: 4px;
	border: 1px solid #cbd5e1;
}
.btn.active{
	border: 1px solid transparent;
	background-color: #3b82f6;
	color:white;
}
.btn ~ .btn{
	margin-left: 16px;
}
</style>
