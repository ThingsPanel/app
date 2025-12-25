'use strict';
exports.main = async (event, context) => {
	console.log("event===>", event)
	// 从 event 中获取参数
	const { 
		body
	} = event;
	
	// 解析参数
	const {push_clientid,title,content,alarm_id} = JSON.parse(body)

	// 校验必要参数，防止客户端漏传导致报错
	if (!push_clientid) {
		return { code: 400, msg: "push_clientid 不能为空" };
	}

	// 使用 context.APPID 自动获取当前项目的 AppID
	const uniPush = uniCloud.getPushManager({ 
		appId: context.APPID || "__UNI__71E31D5" 
	});

	try {
		const res = await uniPush.sendMessage({
			"push_clientid": push_clientid,
			"title": title || "设备告警",
			"content": content || "您有一条新消息",
			"payload": {
				"alarm_id": alarm_id
			}
		});
		return {
			code: 200,
			msg: "发送成功",
			data: res
		};
	} catch (err) {
		return {
			code: 500,
			msg: "发送失败",
			error: err.message
		};
	}
};