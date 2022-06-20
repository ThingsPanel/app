export default {
	state: {
		offset: 1, // 页数（从0开始）
		num: 10,  //每页显示条数
		menuList: [] // 数据
	},
	mutations: {
		addOffset(state, offset) {
			state.offset++;
		},
		subtractionOffset(state, offset) {
			state.offset--;
		},
		zerOingOffser(state, offset) {
			state.offset = 0;
		},
		addPage(state, page) {
			state.page++;
		},
		subtractionPage(state, page) {
			state.page--;
		},
		zerOingPage(state, page) {
			state.offset = 1;
		},

	},
	actions: {

	}

}
