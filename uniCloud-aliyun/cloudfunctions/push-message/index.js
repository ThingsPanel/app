'use strict';
const uniPush = uniCloud.getPushManager({appId:"__UNI__71E31D5"}) 
exports.main = async (event, context) => {
	return await uniPush.sendMessage({
		"push_clientid": "4b604dff1ad10961401e876ec1a42aeb",
		"title": "通知标题",
		"content": "通知内容",
		"payload": {
			"text": "体验一下uni-push2.0"
		}
	});
};
