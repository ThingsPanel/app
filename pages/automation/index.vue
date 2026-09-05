<template>
  <view class="tp-box tp-box-sizing">
    <view class="tp-header">
      <view class="header-main tp-flex tp-flex-j-s tp-flex-a-c">
        <view>
          <view class="page-title">{{ $t('pages.automationTitle') }}</view>
          <view class="page-subtitle">{{ $t('pages.automation.subtitle') }}</view>
        </view>
        <view class="add-action tp-flex tp-flex-j-c tp-flex-a-c" @click="toEdit(null)"><text>＋</text></view>
      </view>
    </view>

    <view class="automation-toolbar">
      <view class="segment-control">
        <view
          v-for="item in clData"
          :key="item.value"
          class="segment-item tp-flex tp-flex-j-c tp-flex-a-c"
          :class="{ active: clName === item.label }"
          @click="changCl(item)"
        >
          {{ item.label === '场景联动' ? $t('pages.automation.sceneLinkage') : $t('pages.automation.sceneManagement') }}
        </view>
      </view>
    </view>

    <view class="tp-content" ref="scrollWrapper">
      <view v-if="isLoading && dataList.length === 0" class="automation-list">
        <view v-for="index in 4" :key="`automation-skeleton-${index}`" class="automation-card automation-skeleton">
          <view class="skeleton-row"><view class="skeleton-title skeleton-shape" /><view class="skeleton-status skeleton-shape" /></view>
          <view class="skeleton-desc skeleton-shape" />
          <view class="skeleton-actions"><view class="skeleton-action skeleton-shape" /><view class="skeleton-action skeleton-shape" /><view class="skeleton-action skeleton-shape" /></view>
        </view>
      </view>

      <view class="automation-list" v-else-if="dataList.length > 0">
        <view
          class="automation-card"
          v-for="(item,index) in dataList"
          :key="item.id || index"
        >
          <view class="card-content">
            <template v-if="clName === '场景联动'">
              <view class="card-heading tp-flex tp-flex-j-s tp-flex-a-c">
                <view class="card-title uni-ellipsis">{{item.name}}</view>
                <view class="status-chip" :class="isAutomationEnabled(item.enabled) ? 'status-running' : 'status-disabled'">
                  {{ isAutomationEnabled(item.enabled) ? $t('pages.automation.running') : $t('pages.automation.disabled') }}
                </view>
              </view>
              <view class="card-desc uni-ellipsis">
                {{ $t('pages.automation.ruleDescription') }}{{item.description || $t('common.none') }}
              </view>
            </template>

            <template v-if="clName === '场景管理'">
              <view class="card-title uni-ellipsis">{{item.name}}</view>
              <view class="card-desc uni-ellipsis">
                {{ $t('pages.automation.sceneDescription') }}{{item.description || $t('common.none') }}
              </view>
            </template>
          </view>
            <view class="card-actions tp-flex tp-flex-row tp-flex-a-c">
              <template v-if="clName == '场景管理'">
                <view class="action-btn activate-btn" @click.stop="toggleSwitch(item)">
                  {{ $t('pages.automation.activate') }}
                </view>
                <view class="action-divider"></view>
              </template>

              <template v-if="clName == '场景联动'">
                <view
                  class="action-btn"
                  :class="isAutomationEnabled(item.enabled) ? 'stop-btn' : 'start-btn'"
                  @click.stop="toggleStatue(item)"
                >
                  {{ isAutomationEnabled(item.enabled) ? $t('pages.automation.stop') : $t('pages.automation.start') }}
                </view>
                <view class="action-divider"></view>
              </template>

              <view class="action-btn edit-btn" @click.stop="toEdit(item)">
                <text>{{ $t('pages.automation.edit') }}</text>
              </view>

              <view class="action-divider"></view>

              <view class="action-btn delete-btn" @click.stop="toDel(item)">
                <text>{{ $t('pages.automation.delete') }}</text>
              </view>
            </view>
        </view>

        <view class="load-more-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" v-if="loadMoreShow" @click="loadData">
          <text class="load-more-text">{{ $t('pages.automation.more') }}</text>
        </view>
      </view>

      <view class="empty-state" v-else-if="!isLoading">
        <view class="empty-visual"><view class="empty-ring ring-outer" /><view class="empty-ring ring-inner" /><view class="empty-device" /></view>
        <text class="empty-title">{{ clName === '场景联动' ? $t('pages.automation.emptyRuleTitle') : $t('pages.automation.emptySceneTitle') }}</text>
        <text class="empty-description">{{ $t('pages.automation.emptyDescription') }}</text>
        <view class="empty-action" @click="toEdit(null)">{{ $t('pages.automation.add' + (clName === '场景联动' ? 'SceneLinkage' : 'Scene')) }}</view>
      </view>
    </view>

    <!-- 授权登录 -->
    <uni-popup ref="authPopup" type="bottom">
      <authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
    </uni-popup>

    <!-- 消息提示框 -->
    <app-toast ref="toast" :msg="toast.msg" location="top"></app-toast>

    <ConfirmationModal v-model="visible" :title="$t('pages.automation.delete')" :text="$t('pages.automation.confirmDeleteRecord')" @cancel='cancel' @confirm='confirm' />
  </view>
</template>

<script>  import ConfirmationModal from '@/components/confirmation-modal/index.vue'

  export default {
    components: {
      ConfirmationModal
    },
    data() {
      return {
        toast: {
          msg: ''
        },
        visible: false,
        isLogin: false,
        isGetPhone: false,
        isLoading: true,
        tabIndex: 0,
        tabData: [{
            id: 1000,
            title: this.$t('pages.automation.farm')
          },
          // {
          // 	id: 1001,
          // 	title: '温棚'
          // }
        ],
        dataList: [],
        page: 1,
        clData: [
          {
            value: '2',
            label: '场景联动', //this.$t('pages.automation.sceneLinkage')
          },
          {
            value: '3',
            label: '场景管理', //this.$t('pages.automation.sceneManagement')
          },
        ],
        clName: '场景联动', //this.$t('pages.automation.sceneLinkage'),
        currentDelId: '',
        loadMoreShow: false,
      }
    },
    watch: {
      dataList (n, o) {
        // 体验优化：列表被重置后滚动到顶部
        if (n.length === 0) {
          uni.pageScrollTo({
            scrollTop: 0,
            duration: 0,
          })
        }
      },
    },
    onShow() {

      const requestedTab = uni.getStorageSync('dashboard_automation_tab')
      if (requestedTab === '场景管理' || requestedTab === '场景联动') {
        this.clName = requestedTab
        uni.removeStorageSync('dashboard_automation_tab')
      }
      this.$store.commit('resetOffset'); //清空日志页码
      this.tabData = [{
        id: uni.getStorageSync('ywid'),
        title: uni.getStorageSync('ywName')
      }]
      // this.$store.commit('zerOingPage'); //清空页码
      console.log('clName: %o', this.clName)
      this.changCl({ label: this.clName })
    },
    methods: {
      isAutomationEnabled(value) {
        return value === 'Y' || value === '1' || value === 1 || value === true;
      },
      toggledAutomationValue(value) {
        if (value === 'Y' || value === 'N') return value === 'Y' ? 'N' : 'Y';
        return this.isAutomationEnabled(value) ? '0' : '1';
      },
      // 切换列表类型
      changCl(cl) {
        this.clName = cl.label

        this.dataList = []
        this.page = 1
        // this.$store.commit('zerOingPage'); //清空页码
        this.loadData()
      },
      // 加载数据（翻页）
      loadData () {
        let apis = {
          '场景联动': '/api/v1/scene_automations/list',
          '场景管理': '/api/v1/scene'
        }

        this.isLoading = true

        this.API.apiRequest(apis[this.clName], {
          page: this.page,
          page_size: 10
        }, 'get').then(res => {
          if (res.code === 200) {
            var data = res.data.list;
            var lastTableData = [];
            if (data.length > 0) {
              let pauArry = data;
              /* 分页 */
              let pageSize = 10;
              if (pageSize == data.length) {
                this.loadMoreShow = true;
                this.page++
              } else {
                this.loadMoreShow = false;
              }
              let newTableData = this.dataList.concat(pauArry);
              lastTableData = newTableData;
            } else {

              lastTableData = this.dataList.concat([]);
            }
            this.dataList = lastTableData;
          } else {
            this.loadMoreShow = false;
            this.toast.msg = res.msg;
            this.$refs.toast.show();
          }
        }).finally(() => {
          this.isLoading = false
        });
      },
      // 切换启停状态（仅场景联动）
      toggleStatue (item) {
        uni.showLoading({
          title: this.$t('common.loading'),
          mask: true
        });

        const enabled = this.toggledAutomationValue(item.enabled)
        this.API.apiRequest('/api/v1/scene_automations/switch/'+item.id, {
        }, 'post').then(res => {
          if (res.code == 200) {
            item.enabled = enabled
          }
        }).finally(() => {
          uni.hideLoading()
        });
      },
	  // 切换启停状态（仅场景管理）
	  toggleSwitch (item) {
	    uni.showLoading({
	      title: this.$t('pages.automation.loading')
	    });

	    this.API.apiRequest('/api/v1/scene/active/'+item.id, {
	    }, 'post').then(res => {
	      if (res.code == 200) {
          uni.showToast({
            title: this.$t('pages.automation.success'),
            icon: 'none'
          });
	      }else{
          uni.showToast({
            title: this.$t('pages.automation.failed'),
            icon: 'none'
          });
		    }
	    }).finally(() => {
	      uni.hideLoading()
	    });
	  },
      // 编辑
      toEdit(item) {
        const urls = {
          '场景联动': '/pages/automation/rule',
          '场景管理': '/pages/automation/scene',
        }
        let url = urls[this.clName]
        if (item?.id) {
          url += '?id=' + item.id
        }
        console.log(url)
        uni.navigateTo({
          url,
        })
      },
      // 取消删除
      cancel() {
        console.log("取消")
        this.visible = false
      },
      // 确定删除
      confirm() {
        uni.showLoading({
          title: this.$t('common.loading'),
          mask: true
        });

        let apis = {
          '场景联动': `/api/v1/scene_automations/${this.currentDelId}`,
          '场景管理': `/api/v1/scene/${this.currentDelId}`
        }

        this.API.apiRequest(apis[this.clName], {
          id: this.currentDelId
        }, 'delete').then(res => {
          if (res.code == 200) {
            this.visible = false

            this.changCl({ label: this.clName })
          }
          uni.hideLoading()
        });


      },
      // 删除
      toDel(item) {
        this.visible = true
        this.currentDelId = item.id
      },
      //
      doTab: function(index) {
        this.tabIndex = index;
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
                title: this.$t('pages.automation.loading')
              });
              that.API.apiRequest(url, data, 'post').then(res => {
                if (res.code == 200) {
                  uni.showToast({
                    title: this.$t('pages.login.loginSuccess'),
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
          desc: this.$t('pages.login.authDescription'),
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

<style scoped lang="scss">
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
  background: radial-gradient(circle, rgba(22, 119, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
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

/* Header */
.tp-header {
  position: relative;
  z-index: 10;
  padding: 30rpx 30rpx 20rpx;
}

.automation-selector {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 40rpx;
  padding: 8rpx 24rpx 8rpx 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  position: relative;
  flex: 1;
  max-width: 500rpx;

  .selector-icon-box {
    width: 56rpx;
    height: 56rpx;
    background: #1677FF;
    border-radius: 50%;
    margin-right: 16rpx;
    flex-shrink: 0;

    .selector-icon {
      font-size: 28rpx;
      color: #ffffff;
      line-height: 1;
    }
  }

  .selector-info {
    flex: 1;
    min-width: 0;

    .selector-text {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
      margin-right: 12rpx;
      flex: 1;
    }

    .arrow-icon {
      font-size: 20rpx;
      color: #64748b;
      transition: transform 0.3s ease;
      flex-shrink: 0;

      &.arrow-up {
        transform: rotate(180deg);
      }
    }
  }
}

.dropdown-menu {
  position: absolute;
  top: 100rpx;
  left: 30rpx;
  width: 500rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  z-index: 9999;
  overflow: hidden;

  .dropdown-item {
    padding: 24rpx 30rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #1e293b;
    text-align: left;
    transition: background 0.2s ease;

    &:active {
      background: rgba(22, 119, 255, 0.1);
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }
}

/* Content */
.tp-content {
  position: relative;
  z-index: 1;
  padding: 30rpx;
}

.section-header {
  margin-bottom: 30rpx;

  .section-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 0.5rpx;
  }
}

/* Add Button */
.add-btn {
  width: 100%;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 30rpx;
  transition: all 0.3s ease;
  gap: 16rpx;

  .add-icon-box {
    width: 48rpx;
    height: 48rpx;
    background: #1677FF;
    border-radius: 50%;

    .add-icon {
      font-size: 36rpx;
      font-weight: 300;
      color: #ffffff;
      line-height: 1;
    }
  }

  .add-btn-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #1677FF;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.9);
  }
}

/* Automation List */
.automation-list {
  padding-bottom: 40rpx;
}

.tp-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06), 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.automation-card:active {
  transform: translateY(-2rpx) scale(0.99);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08), 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-content {
  padding: 32rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12rpx;
  line-height: 1.5;
  letter-spacing: 0.3rpx;
}

.card-desc {
  font-size: 26rpx;
  font-weight: 400;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-break: break-word;
}

.card-actions {
  padding-top: 24rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  gap: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  font-weight: 500;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  transition: all 0.2s ease;
  white-space: nowrap;

  .action-icon {
    font-size: 26rpx;
    margin-right: 6rpx;
  }

  &.activate-btn {
    color: #10b981;

    &:active {
      background: rgba(16, 185, 129, 0.12);
      transform: scale(0.96);
    }
  }

  &.start-btn {
    color: #10b981;

    &:active {
      background: rgba(16, 185, 129, 0.12);
      transform: scale(0.96);
    }
  }

  &.stop-btn {
    color: #f59e0b;

    &:active {
      background: rgba(245, 158, 11, 0.12);
      transform: scale(0.96);
    }
  }

  &.edit-btn {
    color: #1677FF;

    .action-icon {
      color: #1677FF;
    }

    &:active {
      background: rgba(22, 119, 255, 0.12);
      transform: scale(0.96);
    }
  }

  &.delete-btn {
    color: #ef4444;

    .action-icon {
      color: #ef4444;
    }

    &:active {
      background: rgba(239, 68, 68, 0.12);
      transform: scale(0.96);
    }
  }
}

.action-divider {
  width: 1rpx;
  height: 28rpx;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 4rpx;
  flex-shrink: 0;
}

/* Load More Button */
.load-more-btn {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  margin-top: 20rpx;
  transition: all 0.3s ease;

  .load-more-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #1677FF;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.8);
  }
}

/* Empty State */
.empty-state {
  padding: 160rpx 0;
  text-align: center;

  .empty-text {
    font-size: 28rpx;
    color: #94a3b8;
    font-weight: 400;
  }
}

/* Utilities */
.uni-ellipsis,
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tp-flex { display: flex; }
.tp-flex-col { flex-direction: column; }
.tp-flex-row { flex-direction: row; }
.tp-flex-j-s { justify-content: space-between; }
.tp-flex-j-c { justify-content: center; }
.tp-flex-j-l { justify-content: flex-start; }
.tp-flex-j-r { justify-content: flex-end; }
.tp-flex-a-c { align-items: center; }
.tp-flex-a-e { align-items: flex-end; }
.tp-flex-1 { flex: 1; }
.tp-overflow-hidden { overflow: hidden; }

/* Device-list visual system */
.tp-box {
  --page-gutter: clamp(22rpx, 5vw, 34rpx);
  --radius-card: 10rpx;
  --radius-control: 10rpx;
  min-height: 100vh;
  padding-bottom: calc(52px + env(safe-area-inset-bottom));
  overflow: visible;
  background: #f7f8fa;
  color: #172033;
}

.tp-header {
  position: relative;
  z-index: 2;
  padding: calc(env(safe-area-inset-top) + 30rpx) var(--page-gutter) 8rpx;
  background: #fff;
}

.header-main { min-height: 92rpx; margin-bottom: 6rpx; }
.page-title { color: #172033; font-size: 22px; font-weight: 600; line-height: 30px; letter-spacing: 0; }
.page-subtitle { margin-top: 4px; color: #7c879a; font-size: 12px; line-height: 18px; }
.add-action { width: 44px; height: 44px; flex-shrink: 0; color: #fff; background: transparent; box-shadow: none; }
.add-action text { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #1677FF; font-size: 20px; font-weight: 300; line-height: 1; }

.automation-toolbar {
  position: relative;
  z-index: 2;
  padding: 12rpx var(--page-gutter) 16rpx;
  background: linear-gradient(180deg, #fff 0%, #fbfcfe 42%, #f7f8fa 100%);
}
.segment-control { display: flex; min-height: 44px; padding: 2rpx; overflow: hidden; background: #f2f4f7; border: 1rpx solid #e4e9f0; border-radius: var(--radius-control); box-sizing: border-box; }
.segment-item { width: 50%; color: #172033; border-radius: 8rpx; font-size: 24rpx; line-height: 36rpx; transition: color .18s ease, background-color .18s ease; }
.segment-item.active { color: #1677FF; background: #e5efff; font-weight: 600; box-shadow: none; }

.tp-content { position: relative; z-index: 1; padding: 20rpx var(--page-gutter) 32rpx; }
.automation-list { padding-bottom: 16rpx; }
.automation-card { margin-bottom: 18rpx; overflow: hidden; background: #fff; border: 1rpx solid #e4e9f0; border-radius: var(--radius-card); box-shadow: none; }
.automation-card:active { transform: none; background: #f9fafb; box-shadow: none; }
.card-content { box-sizing: border-box; min-height: 128rpx; padding: 22rpx 24rpx 20rpx; }
.card-heading { min-width: 0; }
.card-title { min-width: 0; margin: 0; color: #27364b; font-size: 26rpx; font-weight: 500; line-height: 38rpx; letter-spacing: 0; }
.card-desc { margin: 6rpx 0 0; color: #667085; font-size: 22rpx; line-height: 34rpx; word-break: normal; }
.status-chip { position: relative; margin-left: 16rpx; padding: 4rpx 12rpx 4rpx 26rpx; flex-shrink: 0; border-radius: 8rpx; font-size: 20rpx; font-weight: 500; line-height: 30rpx; }
.status-chip::before { position: absolute; content: ''; left: 12rpx; top: 50%; width: 8rpx; height: 8rpx; border-radius: 50%; transform: translateY(-50%); }
.status-running { color: #039855; background: #eaf8f1; }
.status-running::before { background: #12b76a; }
.status-disabled { color: #667085; background: #f2f4f7; }
.status-disabled::before { background: #98a2b3; }
.card-actions { display: grid; grid-template-columns: 1fr 1rpx 1fr 1rpx 1fr; width: 100%; min-height: 44px; gap: 0; margin: 0; padding: 0; border-top: 1rpx solid #e4e9f0; }
.action-btn { display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 100%; min-height: 44px; padding: 0; color: #1677FF; border-radius: 0; font-size: 24rpx; font-weight: 500; line-height: 36rpx; }
.action-btn.activate-btn,
.action-btn.start-btn,
.action-btn.stop-btn { color: #1677FF; }
.action-btn.edit-btn { color: #1677FF; background: transparent; }
.action-btn.delete-btn { color: #cf4b49; }
.action-divider { display: block; align-self: center; width: 1rpx; height: 24rpx; margin: 0; background: #e4e9f0; }

.load-more-btn { height: 64rpx; margin-top: 10rpx; background: #fff; border: 2rpx solid #e5e9ef; border-radius: var(--radius-control); }
.load-more-btn .load-more-text { color: #667085; font-size: 21rpx; font-weight: 400; }

.automation-skeleton { padding: 26rpx 28rpx 20rpx; }
.skeleton-row { display: flex; align-items: center; justify-content: space-between; }
.skeleton-shape { background: linear-gradient(100deg, #eef1f5 20%, #f8f9fb 38%, #eef1f5 56%); background-size: 220% 100%; animation: automation-skeleton-shimmer 1.35s ease-in-out infinite; }
.skeleton-title { width: 42%; height: 26rpx; border-radius: 8rpx; }
.skeleton-status { width: 76rpx; height: 30rpx; border-radius: 999rpx; }
.skeleton-desc { width: 70%; height: 18rpx; margin-top: 16rpx; border-radius: 6rpx; }
.skeleton-actions { display: flex; justify-content: flex-end; gap: 14rpx; margin-top: 20rpx; padding-top: 18rpx; border-top: 2rpx solid #f0f2f5; }
.skeleton-action { width: 58rpx; height: 28rpx; border-radius: 7rpx; }
@keyframes automation-skeleton-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

.empty-state { min-height: 620rpx; padding: 70rpx 0 120rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.empty-visual { position: relative; width: 176rpx; height: 136rpx; }
.empty-ring { position: absolute; left: 50%; top: 50%; border: 2rpx solid #dce8f8; border-radius: 50%; transform: translate(-50%, -50%); }
.ring-outer { width: 150rpx; height: 100rpx; }
.ring-inner { width: 104rpx; height: 70rpx; border-color: #e7edf5; }
.empty-device { position: absolute; left: 50%; top: 50%; width: 58rpx; height: 48rpx; background: #fff; border: 2rpx solid #dbe2eb; border-radius: 16rpx; box-shadow: none; transform: translate(-50%, -50%); }
.empty-device::after { position: absolute; content: ''; left: 50%; bottom: 9rpx; width: 5rpx; height: 5rpx; background: #64a7ff; border-radius: 50%; transform: translateX(-50%); }
.empty-title { margin-top: 8rpx; color: #344054; font-size: 26rpx; font-weight: 600; line-height: 38rpx; }
.empty-description { margin-top: 8rpx; color: #98a2b3; font-size: 20rpx; line-height: 30rpx; }
.empty-action { margin-top: 26rpx; padding: 14rpx 26rpx; color: #fff; background: #1677FF; border-radius: var(--radius-control); font-size: 21rpx; line-height: 30rpx; box-shadow: none; }

@media (prefers-reduced-motion: reduce) {
  .segment-item { transition: none; }
  .skeleton-shape { animation: none; }
}
</style>
