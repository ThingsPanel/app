<template>
	<view class="chartsview" :style="{ background: background }">
		<view v-show="mixinDatacomLoading"><view class="uni-icons-spinner-cycle">Loading...</view></view>
		<view v-show="mixinDatacomErrorMessage">
			<view class="uni-icons-info-filled">{{ mixinDatacomErrorMessage }}</view>
		</view>
		<canvas
			:id="canvasId"
			:canvas-id="canvasId"
			:style="{ width: cWidth + 'px', height: cHeight + 'px' }"
			:type="canvas2d?'2d':''"
			@tap="tap"
			@cilck="tap"
			@touch="tap"
			@touchstart="touchStart"
			@touchmove="touchMove"
			@touchend="touchEnd"
			@mousemove="mouseMove"
			@mousedown="mousedown"
			@mouseup="mouseup"
			@error="error"
			v-show="showchart"
		/>
	</view>
</template>

<script>
import qiunCharts from '../../js_sdk/u-charts/u-charts.js';
import config from '../../js_sdk/u-charts/config.js';
var canvases = {};
var options = {};
var chartdom = null;
export default {
	mixins: [uniCloud.mixinDatacom],
	props: {
		type: {
			type: String,
			default: null
		},
		canvasId: {
			type: String,
			default: "uchartsid"
		},
		canvas2d: {
			type: Boolean,
			default: false
		},
		pixelRatio: {
			type: Number,
			default: 1
		},
		background: {
			type: String,
			default: 'none'
		},
		animation:{
			type: Boolean,
			default: true
		},
		chartData: {
			type: Object,
			default() {
				return {
					categories: [],
					series: []
				};
			}
		},
		opts: {
			type: Object,
			default: () => ({})
		},
		inScrollView:{
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			cWidth: 375,
			cHeight: 250,
			showchart: false,
			defaultOpts: {}
		};
	},
	mounted() {
		if(this.canvasId=='uchartsid'){
			console.warn("注意：请在uCharts组件传入canvasId，以免单页多图产生图表错乱！")
		}
		if (this.type && config.type.includes(this.type)) {
			this.defaultOpts = Object.assign({},config[this.type])
			this.load()
		} else {
			this.mixinDatacomLoading = false
			this.showchart = false
			this.mixinDatacomErrorMessage = '参数错误：props参数中type类型不正确'
		}
		uni.onWindowResize(res => {
			this.init()
		})
	},
	watch: {
		chartData(val, oldval) {
			if (!this.type || !config.type.includes(this.type)) {
				this.mixinDatacomLoading = false
				this.showchart = false
				this.mixinDatacomErrorMessage = '参数错误：props参数中type不正确'
				return
			}
			if (typeof val === 'object') {
				if (this.collection != '') {
					if (config.categories.includes(this.type) && val.categories.length == 0 ) {
						this.mixinDatacomLoading = false
						this.showchart = false
						this.mixinDatacomErrorMessage = '数据错误：chartData中缺少categories'
					} else {
						this.mixinDatacomLoading = false
						this.mixinDatacomErrorMessage = null
						this.$nextTick(function() {
							this.init()
						})
					}
				} else {
					this.mixinDatacomLoading = false
					this.mixinDatacomErrorMessage = null
					this.$nextTick(function() {
						this.init()
					});
				}
			} else {
				this.mixinDatacomLoading = false
				this.showchart = false
				this.mixinDatacomErrorMessage = '参数错误：chartData数据类型错误'
			}
		}
	},
	methods: {
		load() {
			if (this.mixinDatacomLoading == true) {
				return
			}
			this.mixinDatacomLoading = true
			if (this.collection != '') {
				this.mixinDatacomGet()
					.then(res => {
						this.mixinDatacomLoading = false
						const { data, count } = res.result
						this.mixinDatacomResData = data
						if (config.categories.includes(this.type) && this.chartData.categories.length == 0) {
							this.mixinDatacomLoading = false
							this.showchart = false
							this.mixinDatacomErrorMessage = '数据错误：chartData中缺少categories'
						} else {
							this.init()
						}
					})
					.catch(err => {
						if (this.collection == '') {
							if (this.chartData.series.length > 0) {
								this.mixinDatacomLoading = false
								this.init()
							}
						} else {
							this.mixinDatacomLoading = false
							this.showchart = false
							this.mixinDatacomErrorMessage = '请求错误：' + err
						}
					});
			}else{
				if (this.chartData.series.length > 0) {
					this.mixinDatacomLoading = false
					this.init()
				}
			}
		},
		onMixinDatacomPropsChange(needReset, changed) {
			if (needReset) {
				this.showchart = false;
				options[this.canvasId].context.clearRect(0, 0, options[this.canvasId].width, options[this.canvasId].height)
				options[this.canvasId].context.draw()
				this.load()
			}
		},
		cloudDataInit() {
			let temp = {}
			let series=[]
			let resdata = this.mixinDatacomResData
			let categories = options[this.canvasId].categories
			resdata.map(function (item, index) {
				if(item.type!=undefined && !temp[item.type]){
					series.push({name:item.type,data:[]})
					temp[item.type] = true;
				}
			})
			if(series.length==0){
				let seriesname="默认分组"
				if(this.chartData.series.length>0){
					seriesname=this.chartData.series[0].name
				}
				series=[{name:seriesname,data:[]}]
				for (let j = 0; j < categories.length; j++) {
					let seriesdata = 0;
					for (let i = 0; i < resdata.length; i++) {
						if(resdata[i].label == categories[j]){
							seriesdata = resdata[i].value
						}
					}
					series[0].data.push(seriesdata)
				}
			}else{
				for (let k = 0; k < series.length; k++) {
					if(categories.length>0){
						for (let j = 0; j < categories.length; j++) {
							let seriesdata = 0;
							for (let i = 0; i < resdata.length; i++) {
								if(series[k].name == resdata[i].type && resdata[i].label == categories[j]){
									seriesdata = resdata[i].value
								}
							}
							series[k].data.push(seriesdata)
						}
					}else{
						for (let i = 0; i < resdata.length; i++) {
							if(series[k].name == resdata[i].type){
								series[k].data.push(resdata[i].type)
							}
						}
					}
				}
			}
			return series;
		},
		init() {
			chartdom = uni.createSelectorQuery().in(this).select('.chartsview');
			chartdom.boundingClientRect(data => {
				this.cWidth = data.width
				this.cHeight = data.height
				options[this.canvasId] = Object.assign(this.defaultOpts, this.opts)
				options[this.canvasId].canvasId = this.canvasId
				options[this.canvasId].categories = this.chartData.categories
				if (this.collection == '') {
					options[this.canvasId].series = this.chartData.series
				}else{
					options[this.canvasId].series = this.cloudDataInit()
				}
				options[this.canvasId].background = this.background == 'none' ? '#FFFFFF' : this.background
				options[this.canvasId].pixelRatio = this.pixelRatio
				options[this.canvasId].animation = this.animation
				options[this.canvasId].width = data.width * this.pixelRatio
				options[this.canvasId].height = data.height * this.pixelRatio
				if(this.canvas2d){
					options[this.canvasId].canvas2d = this.canvas2d
					const query = uni.createSelectorQuery().in(this)
					query.select('#'+this.canvasId)
						.fields({ node: true, size: true })
						.exec((res) => {
							const canvas = res[0].node
							const ctx = canvas.getContext('2d')
							options[this.canvasId].context = ctx
							canvas.width = data.width * this.pixelRatio
							canvas.height = data.height * this.pixelRatio
							canvas._width = data.width * this.pixelRatio
							canvas._height = data.height * this.pixelRatio
							if(!this.mixinDatacomLoading){
								this.showchart = true
							}
							this.newChart()
						})
				}else{
					options[this.canvasId].context = uni.createCanvasContext(this.canvasId,this)
					if(!this.mixinDatacomLoading){
						this.showchart = true
					}
					this.newChart()
				}
			}).exec();
		},
		newChart() {
			canvases[this.canvasId] = new qiunCharts(options[this.canvasId])
			canvases[this.canvasId].addEventListener('renderComplete', () => {
				this.$emit("complete",{complete:true,charts:canvases[this.canvasId]})
			});
			canvases[this.canvasId].addEventListener('scrollLeft', () => {
				this.$emit("scrollLeft",{scrollLeft:true,charts:canvases[this.canvasId]})
			});
			canvases[this.canvasId].addEventListener('scrollRight', () => {
				this.$emit("scrollRight",{scrollRight:true,charts:canvases[this.canvasId]})
			});
		},
		tap(e) {
			let currentIndex=null
			let legendIndex=null
			if(this.inScrollView){
				e.type = 'click'
			}
			if (e.type == 'click') {
				chartdom = uni.createSelectorQuery().in(this).select('.chartsview')
				chartdom.boundingClientRect(data => {
					e.changedTouches.unshift({ x: e.detail.x - data.left, y: e.detail.y - data.top })
					e.mp.changedTouches.unshift({ x: e.detail.x - data.left, y: e.detail.y - data.top })
					canvases[this.canvasId].touchLegend(e)
					canvases[this.canvasId].showToolTip(e, {
						format: function(item, category) {
							return category + ' ' + item.name + ':' + item.data
						}
					})
					currentIndex=canvases[this.canvasId].getCurrentDataIndex(e)
					legendIndex=canvases[this.canvasId].getLegendDataIndex(e) 
					this.$emit("getIndex",{event:e,currentIndex:currentIndex,legendIndex:legendIndex,charts:canvases[this.canvasId]})
				}).exec();
			} else {
				e.changedTouches.unshift({ x: e.detail.x - e.currentTarget.offsetLeft, y: e.detail.y - e.currentTarget.offsetTop })
				e.mp.changedTouches.unshift({ x: e.detail.x - e.currentTarget.offsetLeft, y: e.detail.y - e.currentTarget.offsetTop })
				canvases[this.canvasId].touchLegend(e)
				canvases[this.canvasId].showToolTip(e, {
					format: function(item, category) {
						return category + ' ' + item.name + ':' + item.data
					}
				});
				currentIndex=canvases[this.canvasId].getCurrentDataIndex(e)
				legendIndex=canvases[this.canvasId].getLegendDataIndex(e) 
				this.$emit("getIndex",{event:e,currentIndex:currentIndex,legendIndex:legendIndex,charts:canvases[this.canvasId]})
			}
		},
		touchStart(e) {
			canvases[this.canvasId].scrollStart(e)
			this.$emit("touchStart",{event:e,charts:canvases[this.canvasId]})
		},
		touchMove(e) {
			canvases[this.canvasId].scroll(e)
			this.$emit("touchMove",{event:e,charts:canvases[this.canvasId]})
		},
		touchEnd(e) {
			canvases[this.canvasId].scrollEnd(e)
			this.$emit("touchEnd",{event:e,charts:canvases[this.canvasId]})
		},
		mousedown(e){
			if(options[this.canvasId].enableScroll){
				chartdom = uni.createSelectorQuery().in(this).select('.chartsview')
				chartdom.boundingClientRect(data => {
					e.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					e.mp.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					canvases[this.canvasId].scrollStart(e)
					options[this.canvasId].mousedown=true;
					this.$emit("touchStart",{event:e,charts:canvases[this.canvasId]})
				}).exec();
			}
		},
		mouseMove(e) {
			if (options[this.canvasId].series.length > 0) {
				chartdom = uni.createSelectorQuery().in(this).select('.chartsview')
				chartdom.boundingClientRect(data => {
					e.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					e.mp.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					if(options[this.canvasId].enableScroll && options[this.canvasId].mousedown){
						canvases[this.canvasId].scroll(e)
						this.$emit("touchMove",{event:e,charts:canvases[this.canvasId]})
					}else{
						canvases[this.canvasId].showToolTip(e, {
							format: function(item, category) {
								return category + ' ' + item.name + ':' + item.data;
							}
						});
					}
				}).exec()
			}
		},
		mouseup(e){
			if(options[this.canvasId].enableScroll){
				chartdom = uni.createSelectorQuery().in(this).select('.chartsview')
				chartdom.boundingClientRect(data => {
					e.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					e.mp.changedTouches.unshift({ x: e.pageX - data.left, y: e.clientY-data.top })
					canvases[this.canvasId].scrollEnd(e)
					options[this.canvasId].mousedown=false;
					this.$emit("touchEnd",{event:e,charts:canvases[this.canvasId]})
				}).exec();
			}
		},
		error(e) {
			console.log(e)
		}
	}
};
</script>

<style scoped>
.chartsview {
	width: 100%;
	height: 100%;
	display: flex;
	flex: 1;
	justify-content: center;
	align-items: center;
}
</style>
