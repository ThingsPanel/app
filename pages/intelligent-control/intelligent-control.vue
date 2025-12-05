<template>
  <view class="tp-box tp-box-sizing tp-pd-b-30">
    <!-- Background Elements for Atmosphere -->
    <view class="bg-glow-1"></view>
    <view class="bg-glow-2"></view>

    <!-- Top Header -->
    <view class="tp-header tp-flex tp-flex-j-s tp-flex-a-c">
      <!-- Strategy Selector -->
      <view class="strategy-select-box tp-flex tp-flex-a-c" @click="isMore=!isMore">
        <view class="selector-icon-box tp-flex tp-flex-j-c tp-flex-a-c">
          <text class="selector-icon">⚙</text>
        </view>
        <view class="selector-info tp-flex tp-flex-a-c">
          <text class="selector-text text-ellipsis">{{ clName === '场景联动' ? $t('pages.intelligentControl.sceneLinkage') : $t('pages.intelligentControl.sceneManagement')}}</text>
          <view class="iconfont iconjiantou arrow-icon" :class="{ 'arrow-up': isMore }"></view>
        </view>
      </view>

      <!-- Dropdown Menu -->
      <view class="dropdown-menu" v-if="isMore">
        <view 
          class="dropdown-item" 
          v-for="(m,i) in clData" 
          :key="i" 
          @click="changCl(m)"
        >
          {{ m.label === '场景联动' ? $t('pages.intelligentControl.sceneLinkage') : $t('pages.intelligentControl.sceneManagement') }}
        </view>
      </view>
    </view>

    <!-- Main Content -->
    <view class="tp-content" ref="scrollWrapper">
      <!-- Add Button -->
      <view class="add-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toEdit(null)">
        <view class="add-icon-box tp-flex tp-flex-j-c tp-flex-a-c">
          <text class="add-icon">+</text>
        </view>
        <text class="add-btn-text">{{ $t('pages.intelligentControl.add' + (clName === '场景联动' ? 'SceneLinkage' : 'Scene')) }}</text>
      </view>

      <!-- List -->
      <view class="strategy-list" v-if="dataList.length>0">
        <view 
          class="strategy-card tp-panel" 
          v-for="(item,index) in dataList" 
          :key="index"
        >
          <view class="card-content">
            <template v-if="clName === '场景联动'">
              <view class="card-title uni-ellipsis">{{item.name}}</view>
              <view class="card-desc uni-ellipsis">
                {{ $t('pages.intelligentControl.ruleDescription') }}{{item.description || $t('common.none') }}
              </view>
            </template>
            
            <template v-if="clName === '场景管理'">
              <view class="card-title">{{item.name}}</view>
              <view class="card-desc">
                {{ $t('pages.intelligentControl.sceneDescription') }}{{item.description || $t('common.none') }}
              </view>
            </template>
            
            <view class="card-actions tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
              <template v-if="clName == '场景管理'">
                <view class="action-btn activate-btn" @click.stop="toggleSwitch(item)">
                  {{ $t('pages.intelligentControl.activate') }}
                </view>
                <view class="action-divider"></view>
              </template>
              
              <template v-if="clName == '场景联动'">
                <view 
                  class="action-btn" 
                  :class="item.enabled === '0' ? 'start-btn' : 'stop-btn'"
                  @click.stop="toggleStatue(item)"
                >
                  {{item.enabled === '0' ? $t('pages.intelligentControl.start') : $t('pages.intelligentControl.stop') }}
                </view>
                <view class="action-divider"></view>
              </template>
              
              <view class="action-btn edit-btn" @click.stop="toEdit(item)">
                <view class="iconfont iconbianji action-icon"></view>
                <text>{{ $t('pages.intelligentControl.edit') }}</text>
              </view>
              
              <view class="action-divider"></view>
              
              <view class="action-btn delete-btn" @click.stop="toDel(item)">
                <view class="iconfont iconshanchu action-icon"></view>
                <text>{{ $t('pages.intelligentControl.delete') }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Load More Button -->
        <view class="load-more-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" v-if="loadMoreShow" @click="loadData">
          <text class="load-more-text">{{ $t('pages.intelligentControl.more') }}</text>
        </view>
      </view>

      <!-- Empty State -->
      <view class="empty-state" v-else>
        <text class="empty-text">{{ $t('pages.intelligentControl.noData') || '暂无数据' }}</text>
      </view>
    </view>

    <!-- 授权登录 -->
    <uni-popup ref="authPopup" type="bottom">
      <authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
    </uni-popup>

    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>

    <Modal v-model="visible" :title="$t('pages.intelligentControl.delete')" :text="$t('pages.intelligentControl.confirmDeleteRecord')" @cancel='cancel' @confirm='confirm' />
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
            title: this.$t('pages.intelligentControl.farm')
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
            label: '场景联动', //this.$t('pages.intelligentControl.sceneLinkage')
          },
          {
            value: '3',
            label: '场景管理', //this.$t('pages.intelligentControl.sceneManagement')
          },
        ],
        clName: '场景联动', //this.$t('pages.intelligentControl.sceneLinkage'),
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
    onLoad() {
      // 在页面加载时设置标题，确保国际化已初始化
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.$t('pages.intelligentControlTitle')
          })
        }, 100)
      })
    },
    onShow() {
      // 在页面显示时也设置标题，确保标题正确
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.$t('pages.intelligentControlTitle')
          })
        }, 100)
      })
      this.$store.commit('zerOingOffser'); //清空日志页码
      this.tabData = [{
        id: uni.getStorageSync('ywid'),
        title: uni.getStorageSync('ywName')
      }]
      // this.$store.commit('zerOingPage'); //清空页码
      console.log('clName: %o', this.clName)
      this.changCl({ label: this.clName })
    },
    methods: {
      // 切换列表类型
      changCl(cl) {
        this.clName = cl.label
        this.isMore = false
        
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
        
        uni.showLoading({
          title: this.$t('common.loading'),
          mask: true
        });
        
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
          uni.hideLoading()
        });
      },
      // 切换启停状态（仅场景联动）
      toggleStatue (item) {
        uni.showLoading({
          title: this.$t('common.loading'),
          mask: true
        });
        
        const enabled = item.enabled === '0' ? '1' : '0'
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
	      title: this.$t('pages.intelligentControl.loading')
	    });
	     
	    this.API.apiRequest('/api/v1/scene/active/'+item.id, {
	    }, 'post').then(res => {
	      if (res.code == 200) {
          uni.showToast({
            title: this.$t('pages.intelligentControl.success'),
            icon: 'none'
          });
	      }else{
          uni.showToast({
            title: this.$t('pages.intelligentControl.failed'),
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
          '场景联动': '../scene-rule-detail/scene-rule-detail',
          '场景管理': '../scene-detail/scene-detail',
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
                title: this.$t('pages.intelligentControl.loading')
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

<style lang="scss">
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
  background: radial-gradient(circle, rgba(100, 108, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
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

.strategy-select-box {
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
    background: #646cff;
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
      background: rgba(100, 108, 255, 0.1);
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
    background: #646cff;
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
    color: #646cff;
  }
  
  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.9);
  }
}

/* Strategy List */
.strategy-list {
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

.strategy-card:active {
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
    color: #646cff;
    
    .action-icon {
      color: #646cff;
    }
    
    &:active {
      background: rgba(100, 108, 255, 0.12);
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
    color: #646cff;
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
</style>
