'use strict';
const crypto = require('crypto');
const config = require('./config.private.json');
exports.main = async (event, context) => {
	// Only the server-side plugin may invoke this URL. Fail closed on missing configuration.
 const expected = config.cloudToken;
 const supplied = event.headers?.authorization || event.headers?.Authorization || '';
 if (!expected || expected.length < 32) return { code: 503, msg: '推送服务未配置' };
 const left = crypto.createHash('sha256').update(supplied).digest();
 const right = crypto.createHash('sha256').update('Bearer ' + expected).digest();
 if (!crypto.timingSafeEqual(left, right)) return { code: 401, msg: '未授权' };
 // 从 event 中获取参数
	const {
		body
	} = event;

	// 解析参数
	let input;
	try {
		input = JSON.parse(body);
		if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid body');
	} catch (_) {
		return { code: 400, msg: "请求内容必须是 JSON 对象" };
	}
	const {push_clientid,title,content,alarm_id,alarm_kind,tenant_id,user_id,message_id} = input;

	// 校验必要参数，防止客户端漏传导致报错
	if (typeof push_clientid !== 'string' || !push_clientid.trim() || push_clientid.length > 256 || /[,\s]/.test(push_clientid)) {
		return { code: 400, msg: "push_clientid 不能为空" };
	}

	// 使用 context.APPID 自动获取当前项目的 AppID
	try {
		const uniPush = uniCloud.getPushManager({
			appId: config.appId
		});

		const res = await uniPush.sendMessage({
			"push_clientid": push_clientid,
            ...(message_id ? { request_id: crypto.createHash('sha256').update(message_id).digest('hex').slice(0,32) } : {}),
			"title": title || "设备告警",
			"content": content || "您有一条新消息",
			"payload": {
				"alarm_id": alarm_id, "alarm_kind": alarm_kind, "tenant_id": tenant_id, "user_id": user_id, "message_id": message_id
			}
		});
		if (!res || res.errCode !== 0) {
			return { code: 502, msg: "推送服务未确认受理", data: { errCode: res && res.errCode } };
		}
		return {
			code: 200,
			msg: "推送服务已受理",
			data: res
		};
	} catch (err) {
		return {
			code: 500,
			msg: "发送失败",
			error: "provider_unavailable"
		};
	}
};
