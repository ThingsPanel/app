<template>
  <view class="tp-box tp-box-sizing tp-pd-b-30">
    <view class="tp-control tp-flex tp-felx-row tp-flex-j-s tp-flex-a-c tp-pd-l-r-30 tp-pd-t-0 tp-pd-b-15 tp-fixed" style="background: #fff;">
      <!-- 左 -->
      <view class="tp-flex-1 tp-tab tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
        <view v-for="(item,index) in tabData" :key="index" class="uni-ellipsis"
          :class=" index === tabIndex ?'tp-active':'' " @tap="doTab(index)">{{item.title}}</view>
      </view>
      
      <view class="tp-flex-1"></view>

      <!-- 右 -->
      <view class="tp-flex-1 tp-strategy-select tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="isMore=!isMore"
        style="position: relative;">
         <text> {{ clName === '场景联动' ? $t('pages.intelligentControl.sceneLinkage') :  $t('pages.intelligentControl.sceneManagement')}}</text>
        <view class="iconfont iconjiantou tp-mg-l-10"></view>
      </view>

      <!-- 右下拉列表 -->
      <view class="moreitem" v-if="isMore">
        <view class="item_i" v-for="(m,i) in clData" :key="i" @click="changCl(m)"> {{ m.label === '场景联动' ? $t('pages.intelligentControl.sceneLinkage') : $t('pages.intelligentControl.sceneManagement') }} </view>
      </view>
    </view>

    <view class="tp-pd-l-r-30" ref="scrollWrapper">
      <view style="height: 52rpx;"></view>

      <view class="tp-strategy-add-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toEdit(null)">
        <text>{{ $t('pages.intelligentControl.add' + (clName === '场景联动' ? 'SceneLinkage' : 'Scene')) }}</text>
      </view>

      <view class="tp-panel tp-flex tp-flex-col" v-if="dataList.length>0">
        <block v-for="(item,index) in dataList" :key="index">
          <view class="tp-strategy-item tp-flex tp-flex-col tp-mg-t-25 tp-box-sizing tp-pd-20">
            <template v-if="clName === '场景联动'">
              <view class="tp-pd-t-b-05 uni-ellipsis">{{item.name}}</view>
              <view class="tp-pd-t-b-05 uni-ellipsis">{{ $t('pages.intelligentControl.ruleDescription') }}{{item.description || $t('common.none') }}</view>
            </template>
            
            <template v-if="clName === '场景管理'">
              <view class="tp-pd-t-b-05">{{item.name}}</view>
              <view class="tp-pd-t-b-05">{{ $t('pages.intelligentControl.sceneDescription') }}{{item.description || $t('common.none') }}</view>
            </template>
            
            <view class="tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c tp-pd-t-b-15">
              <template v-if="clName == '场景管理'">
                <view :style="{ color: '#5bdc1b' }" class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toggleSwitch(item)">
                   {{ $t('pages.intelligentControl.activate') }}
                </view>
                
                <view class="tp-mg-l-r-25">|</view>
              </template>
			        <template v-if="clName == '场景联动'">
                <view :style="{ color: item.enabled === '0' ? '#5bdc1b' : '#ff9900' }" class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toggleStatue(item)">
                  {{item.enabled === '0' ? $t('pages.intelligentControl.start') : $t('pages.intelligentControl.stop') }}
                </view>
                
                <view class="tp-mg-l-r-25">|</view>
              </template>
              
              
              <view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toEdit(item)">
                <view class="iconfont iconbianji tp-mg-r-10"></view>{{ $t('pages.intelligentControl.edit') }}
              </view>
              
              <view class="tp-mg-l-r-25">|</view>
              
              <view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @click="toDel(item)">
                <view class="iconfont iconshanchu tp-mg-r-10"></view>{{ $t('pages.intelligentControl.delete') }}
              </view>
            </view>
          </view>
        </block>

        <view class="tp-strategy-add-btn tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" v-if="loadMoreShow"
          @click="loadData">
          <text>{{ $t('pages.intelligentControl.more') }}</text>
        </view>
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
      
    },
    onShow() {
      uni.setNavigationBarTitle({
        title: this.$t('pages.intelligentControlTitle')
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
          title: this.$t('pages.intelligentControl.loading')
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
          title: this.$t('pages.intelligentControl.loading')
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
          title: this.$t('pages.intelligentControl.loading')
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

<style>
  @import '@/common/intelligent-control.css';
  
  .tp-control {
    height: 36rpx;
  }
  
  .tp-flex-1 {
    flex: 1 0 0;
    overflow: hidden;
  }
</style>
