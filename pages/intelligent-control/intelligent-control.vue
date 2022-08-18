<template>
	<view class="tp-box tp-box-sizing tp-pd-l-r-30 tp-pd-b-30">
		<view>
			<view class="tp-control tp-flex tp-felx-row tp-flex-j-s tp-flex-a-c tp-pd-t-25 tp-pd-b-10 tp-fixed">
				<view class="tp-tab tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
					<view v-for="(item,index) in tabData" :key="index" class="tp-mg-r-30"
						:class=" index === tabIndex ?'tp-active':'' " @tap="doTab(index)">{{item.title}}</view>
				</view>
				<view class="tp-strategy-select tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="isMore=!isMore"
					style="position: relative;">
					<text>{{clName}}</text>
					<view class="iconfont iconjiantou tp-mg-l-10"></view>
				</view>
				<view class="moreitem" v-if="isMore">
					<view class="item_i" v-for="(m,i) in clData" :key="i" @click="changCl(m)">{{m.label}}</view>
				</view>
			</view>
			<view class="tp-tmp"></view>
			<view class="tp-strategy-add-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="doOpenAlertStrategy">				<text>+新增{{clName}}</text>
			</view>
			<view class="tp-panel tp-flex tp-flex-col" v-if="dataList.length>0">
				<block v-for="(item,index) in dataList" :key="index">
					<view class="tp-strategy-item tp-flex tp-flex-col tp-mg-t-25 tp-box-sizing tp-pd-20">
						<view class="tp-pd-t-b-05">{{item.name}}</view>
						<view class="tp-pd-t-b-05">规则说明：{{item.describe}}</view>
						<view class="tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c tp-pd-t-b-15">
							<view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toEdit(item)">
								<view class="iconfont iconbianji tp-mg-r-10"></view>编辑
							</view>
							<view class="tp-mg-l-r-25">|</view>
							<view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toDel(item)">
								<view class="iconfont iconshanchu tp-mg-r-10"></view>删除
							</view>
						</view>
					</view>
				</block>
			</view>
		</view>
		<!-- 授权登录 -->
		<uni-popup ref="authPopup" type="bottom">
			<authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
		<Modal v-model="visible" title='删除' text='确定要删除该条记录？' @cancel='cancel' @confirm='confirm' />
	</view>
</template>

<script>
	// import customizePopup from 'components/customize-popup/customize-popup'
	import Modal from '@/components/x-modal/x-modal'
	export default {
		components: {
			Modal
		},
		data() {
			return {
				toast: {
					msg: ''
				},
				visible: false,
				isLogin: false,
				isGetPhone: false,
				isMore: false,
				tabIndex: 0,
				tabData: [{
						id: 1000,
						title: '猪场'
					},
					// {
					// 	id: 1001,
					// 	title: '温棚'
					// }
				],
				dataList: [],
				clData: [{
						value: '0',
						label: '告警策略'
					},
					{
						value: '1',
						label: '控制策略'
					}
				],
				clName: '告警策略',
				currentDelId: ''
			}
		},
		onLoad() {

		},
		onShow() {
			this.$store.commit('zerOingPage'); //清空页码
			this.dataList = []
			if (this.clName == '告警策略') {
				this.getDataList()
			} else if (this.clName == '控制策略') {
				//获取控制策略
				this.getContorList()
			}
		},
		methods: {
			//切换控制策略
			changCl(cl) {
				this.clName = cl.label
				this.isMore = false
				this.dataList = []
				this.$store.commit('zerOingPage'); //清空页码
				if (cl.value == '0') {
					this.getDataList()
				} else if (cl.value == '1') {
					//获取控制策略
					this.getContorList()
				}
			},
			//获取控制策略
			getContorList() {
				var list = []
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/automation/index', {
					business_id: uni.getStorageSync('ywId'), //业务ID
					page: this.$store.state.list.offset,
					limit: 10
				}, 'post').then(res => {
					if (res.code == 200) {
						var data = res.data.data;
						var lastTableData = [];
						if (data.length > 0) {
							let pauArry = data;
							/* 分页 */
							let pageSize = 10;
							if (pageSize == data.length) {
								this.statusType = 'more';
								this.loadMoreShow = true;
							} else {
								this.statusType = 'noMore';
							}
							let newTableData = this.dataList.concat(pauArry);
							lastTableData = newTableData;
						} else {
							this.statusType = 'noMore';
							lastTableData = this.dataList.concat([]);
						}
						this.dataList = lastTableData;

					} else {
						this.loadMoreShow = false;
						this.statusType = 'noMore';
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
					uni.hideLoading()
				});
			},
			//获取告警列表
			getDataList() {
				var list = []
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/warning/show', {
					wid: uni.getStorageSync('ywId'),
					page: this.$store.state.list.offset,
					limit: 10
				}, 'post').then(res => {
					if (res.code === 200) {
						var data = res.data;
						var lastTableData = [];
						if (data.length > 0) {
							let pauArry = data;
							/* 分页 */
							let pageSize = 10;
							if (pageSize == data.length) {
								this.statusType = 'more';
								this.loadMoreShow = true;
							} else {
								this.statusType = 'noMore';
							}
							let newTableData = this.dataList.concat(pauArry);
							lastTableData = newTableData;
						} else {
							this.statusType = 'noMore';
							lastTableData = this.dataList.concat([]);
						}
						this.dataList = lastTableData;

					} else {
						this.loadMoreShow = false;
						this.statusType = 'noMore';
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
			//编辑
			toEdit(item) {
				if (this.clName == '告警策略') {
					uni.navigateTo({
						url: '../alert-strategy/edit-strategy?id=' + item.id
					})
				}
				if (this.clName == '控制策略') {
					uni.navigateTo({
						url: '../alert-control/edit-control?id=' + item.id
					})
				}
			},
			//取消删除
			cancel() {
				console.log("取消")
				this.visible = false
			},
			//确定删除
			confirm() {
				if (this.clName == '告警策略') {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/warning/delete', {
						id: this.currentDelId
					}, 'post').then(res => {
						if (res.code == 200) {
							this.visible = false
							this.dataList = []
							this.getDataList()
						}
						uni.hideLoading()
					});
				}
				if (this.clName == '控制策略') {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/automation/delete', {
						id: this.currentDelId
					}, 'post').then(res => {
						if (res.code == 200) {
							this.visible = false
							this.dataList = []
							this.getContorList()
						}
						uni.hideLoading()
					});
				}
			},
			//删除
			toDel(item) {
				this.visible = true
				this.currentDelId = item.id
			},
			//
			doTab: function(index) {
				this.tabIndex = index;
			},
			//
			doOpenAlertStrategy: function() {
				if (this.clName == '控制策略') {
					uni.navigateTo({
						url: '../alert-control/add-control'
					})
				}
				if (this.clName == '告警策略') {
					uni.navigateTo({
						url: '../alert-strategy/alert-strategy'
					})
				}

			},
			//获取绑定的手机号
			getPhoneNumber(e) {
				this.wxData = e.detail
				this.isGetPhone = false
				this.toLogin()
			},
			//登录
			toLogin() {
				let that = this
				if (!that.$login.isLoginType().isAuth) {
					that.$refs.authPopup.open()
				} else {
					// 获取用户信息
					uni.login({
						success(res) {
							uni.setStorageSync('wx_code', res.code)
							let url = "/auth/login";
							let data = {
								login_type: 'wechatmini',
								business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6',
								wx_code: uni.getStorageSync('wx_code'),
								iv: that.wxData.iv,
								encryptedData: that.wxData.encryptedData,
								name: JSON.parse(uni.getStorageSync('userWxInfo')).nickName,
							};
							uni.showLoading({
								title: '加载中'
							});
							that.API.apiRequest(url, data, 'post').then(res => {
								if (res.code == 200) {
									uni.showToast({
										title: '登录成功',
										icon: 'none'
									});
									uni.setStorageSync('access_token', res.data.access_token)
									that.userInfo = that.$login.isLoginType()
									that.isLogin = true
									that.$forceUpdate()
									that.getDataList()
								} else {
									that.toast.msg = res.msg;
									that.$refs.toast.show();
								}
								uni.hideLoading()
							});
						}
					});

				}
			},
			//关闭
			toCloseLogin() {
				this.$refs.authPopup.close()
			},
			//获取授权
			getAuth() {
				var that = this;
				//判断是否授权
				uni.getUserProfile({
					desc: '登录',
					success(infoRes) {
						const userInfo = infoRes.userInfo;
						uni.setStorageSync('userWxInfo', JSON.stringify(userInfo))
						uni.setStorageSync('isAuth', '1')
						that.isGetPhone = true
						that.$refs.authPopup.close()
					},
					fail: err => {
						console.log('未授权err==', err);
					}
				});
			},
		}
	}
</script>

<style>
	@import '@/common/intelligent-control.css';
</style>
