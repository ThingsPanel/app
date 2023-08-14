<template xlang="wxml">
  <view class="tree">
    <view class="tree-mask" :class="{'show':showTree}" @tap="_maskClick"></view>
    <view class="tree-cnt" :class="{'show':showTree}">
      <view class="tree-bar">
        <view class="tree-bar-cancel" :style="{'color':cancelColor}" hover-class="hover-c" @tap="_cancel">
          关闭
        </view>
        <view class="midInput" v-if="showSearch">
          <input class="searchArea" @input="filterOp" :placeholder="'请输入'+title"/>
          <icon  class="searchIcon" type="search" />
        </view>
        <view class="tree-bar-title" v-else :style="{'color':titleColor}">{{title}}</view>
        <view class="tree-bar-confirm" :style="{'color':confirmColor}" hover-class="hover-c"
              @tap="_confirm">确定</view>
      </view>
      <view class="tree-view">
        <scroll-view class="tree-view-sc" :scroll-y="true">
          <block v-for="(item, index) in treeList" :key="index" v-if="item.isPickerShow == true || item.isPickerShow == undefined">
            <view class="tree-item" :style="[{
            paddingLeft: item.rank*15 + 'px',
            zIndex: item.rank*-1 +50
            }]" :class="{
              show: keyWord!=''?true:item.show,
              last: item.lastRank,
              showchild: item.showChild
            }">
              <view class="tree-label" @tap.stop="_treeItemTap(item, index)">
                <image class="tree-icon"
                       :src="item.lastRank ? lastIcon : item.showChild ? currentIcon : defaultIcon">
                </image>
                {{item.name}}
              </view>
              <view class="tree-check" @tap.stop="_treeItemSelect(item, index)"
                    v-if="selectParent?true:item.lastRank">
                <view class="tree-check-yes" v-if="item.checked" :class="{'radio':!multiple}"
                      :style="{'border-color':confirmColor}">
                  <view class="tree-check-yes-b" :style="{'background-color':confirmColor}">
                  </view>
                </view>
                <view class="tree-check-no" v-else :class="{'radio':!multiple}"
                      :style="{'border-color':confirmColor}"></view>
              </view>
            </view>
          </block>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "tree",
  props: {
    showSearch:{
      type: Boolean,
      default: true
    },
    range: {
      type: Array,
      default: function() {
        return []
      }
    },
    idKey: { //字段key值
      type: String,
      default: 'id'
    },
    pidKey: { //字段key值
      type: String,
      default: 'pid'
    },
    nameKey: { //字段value值
      type: String,
      default: 'name'
    },
    allKey: { //冗余字段
      type: String,
      default: 'value'
    },
    childKey: { //字段value值
      type: String,
      default: 'children'
    },
    title: { //头
      type: String,
      default: ''
    },

    multiple: { // 是否可以多选
      type: Boolean,
      default: true
      // default: true
    },
    cascade: { // 是否级联选择
      type: Boolean,
      default: false
      // default: true
    },
    selectParent: { //是否可以选父级
      type: Boolean,
      default: true
    },
    maskClick: { //点击遮罩层是否关闭
      type: Boolean,
      default: true
    },
    confirmColor: { // 确定按钮颜色
      type: String,
      default: '' // #007aff
    },
    cancelColor: { // 取消按钮颜色
      type: String,
      default: '' // #757575
    },
    titleColor: { // 标题颜色
      type: String,
      default: '' // #757575
    },
    currentIcon: { // 展开时候的ic
      type: String,
      default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MEQ0QTM0MzQ1Q0RBMTFFOUE0MjY4NzI1Njc1RjI1ODIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MEQ0QTM0MzU1Q0RBMTFFOUE0MjY4NzI1Njc1RjI1ODIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowRDRBMzQzMjVDREExMUU5QTQyNjg3MjU2NzVGMjU4MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowRDRBMzQzMzVDREExMUU5QTQyNjg3MjU2NzVGMjU4MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PidwepsAAAK0SURBVHja7JxbTsJAFIYHww7ciStgCeoGvGxAiOsgURegoL5720AXYLiIr0aJviq3Zx3PhIEnKG3ndtr+f3KixrSUj/ZjzjClIqUUiFm2gAAQAREQEUAEREAERAQQAREQAREBREAEREBEEqa67h9RFDWllDv0awWYlqlQHmu1WjMRRMoV1QFttA12y3xRtdNczq8EsE4/f8FumX2q77ROvNXk8UGMEKdUz6tYJHljaZAbuyUH+UR1to5BEohTuqwPCeS4pAA/qY6o/kyHOAMCeRK3owJnj+rH1jjxhqpVsstaebCz6TmnHWyXyY+xHjSBWBY/bvSgadtXBj9u9KCN3rnIfkzkQVsTEEX0Y2IP2oKo/HhMICcFAThUcwVZNGU6FdbX/XURzkbVF4+ybGhjPrFdgP66QdXNurGtSdk6Xdb9nAJ8oDo3OQlsQZzkdPw41ONBo6vI5scDefRjZg+6gpg3Pxp50CXEvPjR2IOuIXL3oxUPuobI3Y9WPOgDIlc/WvOgL4iL/vqFCcD7LH0xB4hj7cfQ/fWH9qCT+FhG0tN+DBk1PzjOM0SVllixcsBT1AvYc/kAPhc0hRg/3uvxoCgKRN9+dOrBUBB9+9GpB0NC9OVH5x4MDdG1H714kANEV3705kEOEBf9dcPi/lQnsuvLg1wgSu3Ha0v7Uh4MMgUXeuG71H407a+VBy9CPQkOdw+MtB+nGbd/D+FBbhBNxo9SjwcngJjNj0E9yBFiFj8G9SBXiGn8GNyDnCEm8SMLD3KHGOdHNh7kDjHOj2w8mAeIi/5arX+c6b/fxHz9oADEdGdjR/fXCw/OOB5oVfCOgnepz8IB14PMw03jCmTE+QBx5z0gAmKSqK9OUF+hcAeIhu/QYr4Qie8rjW83hhMBERARQAREQAREBBABERCLnH8BBgA+TQI7U4t53AAAAABJRU5ErkJggg=='
    },
    defaultIcon: { // 折叠时候的ic
      type: String,
      default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAACE0lEQVR4Xu3c200DMRCF4XEltJAOkEugA+ggpUAHoQMqiFMCdEAJUMEiS4mEELlIO7bPOeN9i6K1rG/952myyea1WiCtXmEuYBPR4RBMxInoIOCwhOtJLKVszWyXc/5y2BvNEq6I+/3+kFK6M7OHnPM7jcLKjbZAvD/uaZtzflm5P4rbWyJWgDcze1LPuzVihfxUz7sH4ilJ2bx7Isrm3RtRMu8RiHJ5j0SUyXs0okTeCIj0eSMh0uaNhkiZNyIiXd7IiDR5oyNS5M2ACJ83EyJs3myIkHkzIsLlzYwIkzc7IkTeCojD81ZCHJa3GuKQvBURu+etjNgtb3XELnlHQGyedyTEZnlHQ2ySd0RE97wjI7rlHR3RJe+JeIrbLOecD6ePpZQ6W1kn2epo4MUrPOKyLN8ppYq1+y1VStncOjIdGnFZlo+U0uOtWOeOY2TE12Ouq//pEA7xXL7XfvcufR8K0Svfv6CREN3yDYfYIt9QiK3yjYTYLF95xB75SiP2ylcZsVu+cogj8pVCHJWvEuKwfOkREfKlRkTJlxkRJl86RMR8qRBR82VChM0XHpEhX2hElnyREWnyhUNkzBcKkTVfJETafIcjKuQ7FFEl35GIMvl2R1TMtyuiar49EWXzbY5oZpv/hibXTF2h3+s60FRKeT6+3TjMS3nrA3ZFRD8xrfY3ER1kJ+JEdBBwWGKeRAfEH1wS5WFZSDB/AAAAAElFTkSuQmCC'
    },
    lastIcon: { // 没有子集的ic
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showTree: false,
      treeList: [],
      keyWord:''
    }
  },
  computed: {},
  methods: {
    // filterOp(e) {
    //   let keyWord = e.detail.value;
    //   if (keyWord != "") {
    //     keyWord = keyWord.toLowerCase();
    //     let oldArr = this.range;
    //     let newArr = [];
    //     for (let i = 0; i < oldArr.length; i++) {
    //       let theVal = oldArr[i];
    //       if (theVal[this.nameKey].toString().toLowerCase().indexOf(keyWord) > -1) {
    //         newArr.push(oldArr[i]);
    //       }
    //     }
    //     this._initTree(newArr);
    //   } else {
    //     this._initTree();
    //   }
    // },
    filterOp(e) {
      let keyWord = e.detail.value;
      this.keyWord = keyWord
      let oldArr = this.treeList;
      if (keyWord != "") {
        keyWord = keyWord.toLowerCase();
        const newArr = oldArr.map((item)=>{
          if (item.name.toString().toLowerCase().indexOf(keyWord) > -1) {
            item['isPickerShow'] = true
          }else{
            item['isPickerShow'] = false
          }
          return item
        })
        this.treeList = newArr
      } else {
        const newArr = oldArr.map((item)=>{
          delete item['isPickerShow']
          return item
        })
        this.treeList = newArr
      }
    },
    //点击遮罩层
    _maskClick() {
      if (this.maskClick) {
        this._hide()
        this.$emit("cancel", []);
      }
    },
    _show() {
      this.showTree = true
    },
    _hide() {
      this.showTree = false
    },
    _cancel() {
      this._hide()
      this.$emit("cancel", []);
    },
    _confirm() {
      // 处理所选数据
      let rt = [];
      this.treeList.forEach((v, i) => {
        if (this.treeList[i].checked) {
          rt.push({
            id: this.treeList[i].id,
            name: this.treeList[i].name,
            value: this.treeList[i].value
          })
        }
      })
      this._hide()
      this.$emit("confirm", rt);
    },

    // 重置数据
    _reTreeList() {
      this.treeList.forEach((v, i) => {
        this.treeList[i].checked = v.orChecked
      })
    },
    //开始加载数据
    _initTree(range = this.range) {
      this.treeList = [];
      this._renderTreeList(range);
      this._initShowTree()
    },
    getInclude(arr1, arr2) {
      return arr2.every((val) => arr1.includes(val))
    },
    _initShowTree(){
      const treeList = JSON.parse(JSON.stringify(this.treeList))
      let checkedList = []
      treeList.map((treeItem)=>{
        if(treeItem.checked){
          checkedList=[...checkedList,...treeItem.parentId]
        }
      })
      const checkedSetList = [...new Set(checkedList)];
      const newTreeList = treeList.map((treeItem)=>{
        // 父亲都展开 都显示
        if(checkedSetList.indexOf(treeItem.id)>-1){
          treeItem.show =true
          treeItem.showChild =true
        }
        // 兄弟也展开 也显示
        if(this.getInclude(checkedSetList,treeItem.parentId)){
          treeItem.show =true
        }
        return treeItem
      })
      this.treeList = newTreeList
    },
    //扁平化树结构
    _renderTreeList(list,rank=0,parentId2=[]) {
      // list.forEach(item => {
      //   this.treeList.push({
      //     id: item[this.idKey],
      //     name: item[this.nameKey],
      //     value: item[this.allKey],
      //     parentId: [], // 父级id数组
      //     sonarrId: [], //子级id数组
      //     rank: 0, // 层级
      //     showChild: false, //子级是否显示
      //     show: true, // 自身是否显示
      //     checked: item.isGqAddChecked?item.isGqAddChecked:false, //是否选中
      //     children: 0
      //   })
      // })

      list.forEach(item => {
        let parentId = JSON.parse(JSON.stringify(parentId2))
        // 处理parentId
        if(rank!=0){
          parentId.push(item[this.pidKey])
        }
        // 处理sonarrId children
        const sonarrId = []
        let children = 0
        let lastRank = true
        if(item[this.childKey] && item[this.childKey].length>0){
          item[this.childKey].map((itemD)=>{
            sonarrId.push(itemD[this.idKey])
          })
          children = item[this.childKey].length
          lastRank = false
        }

        const childObj = {
          id: item[this.idKey],
          name: item[this.nameKey],
          value: item[this.allKey],
          parentId: parentId, // 父级id数组
          sonarrId: sonarrId, //子级id数组
          rank: rank, // 层级
          lastRank:lastRank,
          showChild: false, //子级是否显示
          show: rank==0?true:false, // 自身是否显示
          checked: item.isGqAddChecked?item.isGqAddChecked:false, //是否选中
          children: children
        }
        this.treeList.push(childObj)
        if(item[this.childKey] && item[this.childKey].length>0){
          let rank2 = rank+1
          this._renderTreeList(item[this.childKey],rank2,parentId)
        }
      })
    },
    //选中/取消数据
    _treeItemSelect(item, index) {
      item.checked = !item.checked
      this._fixMultiple(index)
      //开启级联并且在多选状态下和父级可选的状态下
      if (this.cascade && this.multiple && this.selectParent) {
        //给子集孙集....同步选择状态
        this.treeList.forEach((childItem, i) => {
          if (childItem.parentId.includes(item.id)) {
            childItem.checked = item.checked
          }
        })
        //在子集选中之后同步父级状态
        if (item.rank > 0) {
          //如果是选中状态，选择性同步 父级状态
          if (item.checked) {
            let i = item.parentId.length - 1
            //倒序遍历父级数组
            for (i; i >= 0; i--) {
              //获取父级下标
              const nextIndex = this.treeList.findIndex(itemT => itemT.id === item.parentId[i])
              //从父级数据中取到所有同级id数组
              const obj = this.treeList[nextIndex].sonarrId
              //在所有同级选中的情况下type等于true
              let type = true
              //遍历同级id数组
              obj.forEach((childItem, i) => {
                //获取同级数据下标
                const ziIndex = this.treeList.findIndex(itemT => itemT.id === childItem)
                //判断同级是否选中
                if (!this.treeList[ziIndex].checked) {
                  //只要有一个没选中type改为false
                  type = false
                }
              })
              //遍历万所有同级之后，如果同级全都选中，则网父级同步状态
              if (type) {
                this.treeList[nextIndex].checked = true
              } else {
                //反之取消父级状态
                //（其实父级在现在的情况下本来就应该是false，加else纯属以防万一）
                this.treeList[nextIndex].checked = false
              }
            }
          } else {
            //子集取消状态，同时取消所有父级的选中状态
            item.parentId.forEach((childItem, i) => {
              const nextIndex = this.treeList.findIndex(itemT => itemT.id === childItem)
              this.treeList[nextIndex].checked = false
            })
          }
        }
      }
    },
    // 处理单选多选
    _fixMultiple(index) {
      if (!this.multiple) {
        // 如果是单选
        this.treeList.forEach((v, i) => {
          if (i != index) {
            this.treeList[i].checked = false
          } else {
            this.treeList[i].checked = true
          }
        })
      }
    },
    // 点击
    _treeItemTap(item, index) {
      if (item.lastRank === true) {
        //点击最后一级时触发事件
        this.treeList[index].checked = !this.treeList[index].checked
        this._fixMultiple(index)
        return;
      }
      let id = item.id;
      item.showChild = !item.showChild;
      if (item.showChild) {
        //子集数据加载过则不在填充
        if (item.children > 0) {
          this.treeList.forEach((childItem, i) => {
            //隐藏所有子级
            if (childItem.parentId.includes(item.id) && item.parentId.length + 1 ==
                childItem
                    .parentId.length) {
              childItem.showChild = false;
              childItem.show = true
            }
          })
          return
        }
        const range = this.range
        // 找到当前元素
        const own = this.getOwn(id, range)
        //子集数据
        const checkedChildren = own.children
        if (checkedChildren && checkedChildren.length > 0) {
          item.children = checkedChildren.length
        } else {
          item.children = checkedChildren
        }
        //如果接口返回值为空认为是末级
        if (!checkedChildren || checkedChildren.length <= 0) {
          item.lastRank = true
          if (!this.cascade) {
            this.treeList[index].checked = !this.treeList[index].checked
            this._fixMultiple(index)
          }
          return;
        }
        // 子元素插入的索引位置
        const nextIndex = this.treeList.findIndex(itemT => itemT.id === item.id)
        const newRank = item.rank + 1
        let parentId = []
        if (item.parentId.length > 0) {
          parentId = JSON.parse(JSON.stringify(item.parentId))
        }
        parentId.push(item.id)
        let sonarrId = []
        checkedChildren.forEach(itemC => {
          const childObj = {
            id: itemC[this.idKey],
            name: itemC[this.nameKey],
            value: itemC[this.allKey],
            parentId: parentId, // 父级id数组
            sonarrId: [], //子级id数组
            rank: item.rank + 1, // 层级
            showChild: false, //子级是否显示
            show: true, // 自身是否显示
            checked: this.cascade ? item.checked : false, //是否选中
            lastRank: false, //是否末级
            children: 0
          }
          sonarrId.push(childObj.id)
          if (!this.treeList.some(itemT => itemT.id === itemC[this.idKey])) {
            this.treeList.splice(nextIndex + 1, 0, childObj)
          }
        })
        item.sonarrId = sonarrId
      } else {
        //隐藏子集
        this.treeList.forEach((childItem, i) => {
          //隐藏所有子级
          if (childItem.parentId.includes(item.id)) {
            childItem.showChild = false;
            childItem.show = false
          }
        })
      }
      console.log(this.treeList);
    },
    getOwn(id, arr) {
      //利用foreach循环遍历
      arr.forEach((item) => {
        //判断递归结束条件
        if (item[this.idKey] == id) {
          // 存储数据到空数组
          this.returnedItem = item
        } else if (item.children != null) //判断chlidren是否有数据
        {
          //递归调用
          this.getOwn(id, item.children);
        }
      })
      return this.returnedItem
    },
  },
  watch: {
    range(list) {
      this._initTree(list);
    },
    // multiple() {
    //   if (this.range.length) {
    //     this._reTreeList();
    // 	}
    // },
    selectParent() {
      if (this.range.length) {
        this._reTreeList();
      }
    },
  },
  mounted() {
    this._initTree();
  }
}
</script>

<style scoped>
@import "./style.css";
</style>
