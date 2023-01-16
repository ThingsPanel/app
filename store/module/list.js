export default {
	state: {
		offset: 1, // 页数（从0开始）
		num: 10,  //每页显示条数
		equpPage: 1,
		equpSize: 10,
		modelPage: 1,
		modelSize: 10
	},
	mutations: {
		addOffset(state, offset) {
			state.offset++;
		},
		subtractionOffset(state, offset) {
			state.offset--;
		},
		zerOingOffser(state, offset) {
			state.offset = 1;
		},
		addEqupPage(state, page) {
			state.equpPage++;
		},
		subtractionEqupPage(state, page) {
			state.equpPage--;
		},
		zerOingEqupPage(state, page) {
			state.equpPage = 1;
		},
		addModelPage(state, page) {
			state.modelPage++;
		},
		subtractionModelPage(state, page) {
			state.modelPage--;
		},
		zerOingModelPage(state, page) {
			state.modelPage = 1;
		},

	},
	actions: {

	}

}
