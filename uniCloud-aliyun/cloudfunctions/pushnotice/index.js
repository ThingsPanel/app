// 简单的使用示例  
'use strict';  
const uniPush = uniCloud.getPushManager({  
appId: "__UNI__0B0F90D"  
})  
exports.main = async (event) => {  
	let obj = JSON.parse(event.body)
	const res = await uniPush.sendMessage({  
		"push_clientid": obj.cids,
		"title": obj.title,
		"content": obj.content,
		"payload": obj.payload,
		"category": obj.category, // HarmonyOS NEXT系统（纯血鸿蒙、非安卓鸿蒙）的消息分类，要给鸿蒙设备推送时才必传  
		"request_id": obj.request_id,
		"options":obj.options,
		force_notification:true,
	})
	return res;  
};