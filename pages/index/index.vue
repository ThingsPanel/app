<template>
	<view>
		<!-- Number柱状图Compent1 -->
		<view>
			<histogram-chart :dataAs="histogramData" canvasId="ht0" />
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.histogramNumber')}}</view>
		</view>

		<!-- 百分比柱状图Compent2 -->
		<view>
			<histogram-chart
				:dataAs="histogramData2"
				canvasId="ht1"
				labelKey="label"
				valueKey="value"
				:yAxisAs="{
					formatter: {
						type: 'percent' //type:number percent String,额外参数:fixed:NUmber,name:String
					}
				}"
			/>
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.histogramPercent')}}</view>
		</view>

		<!-- 柱状图Compent extra拓展 -->
		<view>
			<histogram-chart
				:dataAs="histogramData3"
				canvasId="ht3"
				:extraAs="{
					extra: {
						column: {
							type: 'stack',
							width: 20
						}
					}
				}"
			/>
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.histogramExtra')}}</view>
		</view>

		<!-- 圆环arcbar -->
		<view>
			<view class="arcbar">
				<block v-for="(item, index) in arcbarList" :key="index">
					<arcbar-chart
						:canvasId="`index_arcbar_${index}`"
						:dataAs="item"
						:basicAs="{
							colors: ['#ff7600']
						}"
					/>
				</block>
			</view>
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.arcbar')}}</view>
		</view>

		<!-- 折线Line带百分比 -->
		<view class="line">
			<line-chart
				canvasId="index_line_1"
				:dataAs="lineData"
				:yAxisAs="{
					formatter: {
						type: 'percent', //type:number percent String,额外参数:fixed:NUmber,name:String
						fixed: 2
					}
				}"
			/>
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.linePercent')}}</view>
		</view>

		<!-- 折线Line纯数字-->
		<view class="line">
			<line-chart canvasId="index_line_2" :dataAs="lineData2" />
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.lineNumber')}}</view>
		</view>

		<!-- 饼状图 -->
		<view class="pie_chart">
			<pie-chart :dataAs="pieData" canvasId="index_pie_1" />
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.pieChart')}}</view>
		</view>

		<!-- 环状图 -->
		<view class="ring_chart">
			<ring-chart
				:dataAs="pieData"
				canvasId="index_ring_1"
				:titleAs="{
					title: {
						name: '一年级'
					},
					subtitle: {
						name: '70%'
					}
				}"
			/>
			<view style="text-align: center;line-height: 40px;">{{$t('pages.charts.ringChart')}}</view>
		</view>
	</view>
</template>

<script>
import HistogramChart from '@/components/stan-ucharts/HistogramChart.vue';
import ArcbarChart from '@/components/stan-ucharts/ArcbarChart.vue';
import LineChart from '@/components/stan-ucharts/LineChart.vue';
import PieChart from '@/components/stan-ucharts/PieChart.vue';
import RingChart from '@/components/stan-ucharts/RingChart.vue';
export default {
	name: 'Index',
	components: {
		HistogramChart,
		ArcbarChart,
		LineChart,
		PieChart,
		RingChart
	},
	data() {
		return {
			histogramData: {
				//总模板
				categories: ['2042', '2013', '2014', '2015', '2016', '2017', '2018'],
				series: [
					{
						name: this.$t('pages.charts.volume1'), //数据名称
						data: [
							15,
							{
								//(饼图、圆环图、玫瑰图为Number) 数据，如果传入null图表该处出现断点
								value: 20, //	仅针对柱状图有效，主要作用为柱状图显示数值
								color: '#f04864' //仅针对柱状图有效，主要作用为柱状图自定义颜色,可覆盖外框定义主题颜色
							},
							45,
							37,
							43,
							34,
							45
						],
						show: true, //图形显示状态，配合点击图例显示状态，也可默认指定是否显示
						color: '#FF7600', //	图形颜色 不传入则使用系统默认配色方案 即统一柱状图颜色
						textSize: 12 //图形上方标注文字的字体大小
						//如涉及混合图表请看 http://doc.ucharts.cn/1172126
					},
					{
						name: this.$t('pages.charts.volume2'),
						data: [
							30,
							{
								value: 40,
								color: '#facc14'
							},
							25,
							14,
							34,
							18,
							20
						]
					}
				]
			},
			histogramData2: {
				//柱状图Compent  //label应为series value 应为
				label: ['2052', '2013', '2014', '2015', '2016', '2017', '2018'],
				value: [
					{
						name: 'labelKey改变',
						data: [0.3, 0.2, 0.5, 0.4, 0.3, 0.1, 0.2]
					}
				]
			},
			histogramData3: {
				//柱状标准图
				categories: ['2013', '2014', '2015', '2016', '2017', '2018'],
				series: [
					{
						name: this.$t('pages.charts.category1'),
						data: [35, 36, 31, 33, 13, 34]
					},
					{
						name: this.$t('pages.charts.category2'),
						data: [18, 27, 21, 24, 6, 28]
					},
					{
						name: this.$t('pages.charts.category2'),
						data: [18, 27, 21, 24, 6, 28]
					}
				]
			},
			arcbarList: [
				//圆环
				{
					series: [
						{
							name: this.$t('pages.charts.accuracy'),
							data: 0.2912
						}
					]
				},
				{
					series: [
						{
							name: this.$t('pages.charts.errorRate'),
							data: 0.6921
						}
					]
				},
				{
					series: [
						{
							name: this.$t('pages.charts.mistakeRate'),
							data: 0.8232
						}
					]
				}
			],
			lineData: {
				//带百分比的图--折线图数据
				categories: ['2012', '2013', '2014', '2015', '2016', '2017'],
				series: [
					{ name: this.$t('pages.charts.volumeA'), data: [0.3511, 0.8233, 0.25, 0.37, 0.4, 0.2] },
					{ name: this.$t('pages.charts.volumeB'), data: [0.7, 0.4, 0.65, 0.1, 0.44, 0.68] },
					{ name: this.$t('pages.charts.volumeC'), data: [0.1, 0.8, 0.95, 0.15, 0.112, 0.132] }
				]
			},
			lineData2: {
				//数字的图--折线图数据
				categories: ['2012', '2013', '2014', '2015', '2016', '2017'],
				series: [
					{ name: this.$t('pages.charts.volumeA'), data: [35, 8, 25, 37, 4, 20] },
					{ name: this.$t('pages.charts.volumeB'), data: [70, 40, 65, 100, 44, 68] },
					{ name: this.$t('pages.charts.volumeC'), data: [100, 80, 95, 150, 112, 132] }
				]
			},
			pieData: {
				//饼状图数据
				series: [
					{
						name: this.$t('pages.charts.class1'),
						data: 50
					},
					{
						name: this.$t('pages.charts.class2'),
						data: 30
					},
					{
						name: this.$t('pages.charts.class3'),
						data: 20
					},
					{
						name: this.$t('pages.charts.class4'),
						data: 18
					},
					{
						name: this.$t('pages.charts.class5'),
						data: 8
					}
				]
			}
		};
	},
	methods: {},
	created() {}
};
</script>

<style scoped>
.arcbar {
	display: flex;
}
</style>
