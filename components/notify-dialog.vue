<template>
  <view class="fizz-dialog" v-show="visible">
    <view class="mask"></view>
    <view class="conetent">
      <view class="text-center dialog-title">{{ `点击确定${status === '1' ? '处理' : '忽略'}警告` }}</view>
      <view class="context-container">
        <input class="border-input" type="text" placeholder="选填" v-model="content" />
      </view>
      <view class="foot-btn">
        <view class="border-right flex-1" @click="cancle">取消</view>
        <view class="flex-1" @click="confirm">确定</view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id:{
      type: [String,Number],
      default: ''
    },
    status:{
      type: [String,Number],
      default: ''
    }
  },
  data(){
    return {
      content: ''
    }
  },
  methods:{
    confirm(){
      this.API.apiRequest('/api/v1/warning/information/edit', {
        id: this.id, 
        processing_result: this.status, 
        processing_instructions: this.content
      }, 'post').then(res => {
        if (res.code === 200) {
          uni.showToast({
            title: '操作成功'
          })
          this.cancle(true)
          // this.list = this.list.filter(l => l.id !== id)
        }
      })
    },
    cancle(refresh){
      this.$emit('close', refresh)
    }
  },
  watch:{
    visible(val){
      if(val){
        this.content = ''
      }
    }
  }
  
}
</script>
<style scoped lang="css">
.fizz-dialog .mask{
  position: fixed;
  z-index: 999;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0,0,0,.5);
}
.fizz-dialog .conetent{
  position: fixed;
  z-index: 999;
  width: 80%;
  max-width: 300px;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%,-50%);
  transform: translate(-50%,-50%);
  background-color: #fff;
  text-align: center;
  border-radius: 3px;
  overflow: hidden;
}
.foot-btn{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 28px;
  margin-bottom: 5px;
}
.context-container{
  padding: 16px;
}
.border-input{
  border: 1px solid #ddd;
  border-radius: 4px;
  line-height: 32px;
  text-align: left;
  padding: 4px;
}
.dialog-title{
  margin-top: 10px;
}
.border-right{
  border-right: 1px solid #ddd;
}
.flex-1{
  flex: 1;
}
</style>