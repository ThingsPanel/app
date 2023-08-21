<template>
  <view>
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="showPop">
    	<input class="uni-input" placeholder="设备" disabled :value="showValue"/>
    	<view>
        <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
      </view>
    </view>
    
    <gq-tree
      class="gq-tree"
      ref="pop"
      :range="options"
      idKey="device"
      nameKey="device_name"
      childKey="children"
      pidKey="parent_id"
      allKey="type"
      :showSearch="false"
      :multiple="false"
      :cascade="false"
      :selectParent="true"
      :foldAll="false"
      confirmColor="#007aff"
      cancelColor="#757575"
      title="选择设备"
      titleColor="#757575"
      @cancel="treeCancel"
      @confirm="onSelect"
    >
    <text>测试</text>
    </gq-tree>
  </view>
  
</template>

<script>
  export default {
    model:{ // 建议显示把这个写上
      event:'update:value',
      prop: 'value'
    },
    props: {
      value: {
        type: String,
      },
      options: {
        type: Array,
        default: [],
      },
    },
    data () {
      return {
        type: undefined,
      }
    },
    computed: {
      showValue () {
        const path = this.deepFind(this.value, this.options)
        if (path.length) {
          this.type = path[path.length-1].type
          return path.map(item => item.device_name).join('/')
        } else {
          return ''
        }
      },
    },
    watch: {
      value (n, o) {
        console.log('deviceId = change', n, o)
        this.$emit('change', n, o)
      },
      type (n, o) {
        console.log(n, o)
        this.$emit('propTypeChange', n, o)
      },
    },
    created () {
      
    },
    methods: {
      showPop () {
        this.$refs.pop._show()
      },
      hidePop() {
        this.$refs.pop._hide()
      },
      onSelect ([option]) {
        console.log(option)
        if (option) {
          this.type = option.value
          this.$emit('update:value', option.id)
        }
      },
      
      treeCancel () {},
      deepFind (device_id, treeData) {
        const devicePath = []
        if (!device_id) {
          return devicePath
        }
        for (let i = 0; i < treeData.length; i++) {
          const item = treeData[i]
          if (item.device === device_id) {
            devicePath.push({
              device_id: item.device,
              device_name: item.device_name,
              device_token: item.device_token,
              device_type: item.device_type,
              type: item.type,
            })
            break;
          } else if (item.children) {
            devicePath.push({
              device_id: item.device,
              device_name: item.device_name,
              device_token: item.device_token,
              device_type: item.device_type,
              type: item.type,
            })
            // 继续
            const temp = this.deepFind(device_id, item.children)
          
            if (temp.length) {
              devicePath.push(...temp)
              break;
            } else {
              devicePath.length = 0
            }
          } else { // 单一路径查找结束未找到匹配，则清空暂存路径
            devicePath.length = 0
          }
        }
        return devicePath
      },
    },
  }
</script>

<style scoped>
  /deep/.tree-cnt {
    top: 65%;
  }
</style>