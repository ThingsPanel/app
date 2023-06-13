//
var time = {
	//
	humanize:function(dataTime){
		//
		if(!dataTime) return ;
		var dateTimeStamp = new Date(dataTime).getTime();
		// 
		var minute = 1000 * 60;      			// 把分，时，天，周，半个月，一个月用毫秒表示
		var hour = minute * 60;
		var day = hour * 24;
		var week = day * 7;
		var halfamonth = day * 15;
		var month = day * 30;
		var now = new Date().getTime();   		// 获取当前时间毫秒
		// console.log(now)	 
		var diffValue = now - dateTimeStamp;	// 时间差	
		if(diffValue < 0){
		    return;
		}
		var minC = diffValue/minute;  			// 计算时间差的分，时，天，周，月
		var hourC = diffValue/hour;
		var dayC = diffValue/day;
		var weekC = diffValue/week;
		var monthC = diffValue/month;
		if(monthC >= 1 && monthC <= 3){
		    result = " " + parseInt(monthC) + "月前"
		}else if(weekC >= 1 && weekC <= 3){
		    result = " " + parseInt(weekC) + "周前"
		}else if(dayC >= 1 && dayC <= 6){
		    result = " " + parseInt(dayC) + "天前"
		}else if(hourC >= 1 && hourC <= 23){
		    result = " " + parseInt(hourC) + "小时前"
		}else if(minC >= 1 && minC <= 59){
		    result =" " + parseInt(minC) + "分钟前"
		}else if(diffValue >= 0 && diffValue <= minute){
		    result = "刚刚"
		}else {
		    var datetime = new Date();
		    datetime.setTime(dateTimeStamp);
		    var Nyear = datetime.getFullYear();
		    var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
		    var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
		    var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
		    var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
		    var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
		    result = Nyear + "-" + Nmonth + "-" + Ndate
		}
		return result;
		//
	},
	// 
	timestampToTime:function(timestamp) {
		var timeStamp = timestamp.toString().length<13 ? (parseInt(timestamp) * 1000):parseInt(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
		var date = new Date(timeStamp); 
		var Y = date.getFullYear() + '-';
		var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
		var D = date.getDate() + ' ';
		var h = date.getHours() + ':';
		var m = date.getMinutes() + ':';
		var s = date.getSeconds();
		return Y + M + D + h + m + s;
	},
	// 根据生日算年龄
	birthdayToAge:function(strBirthday){
		// 
		var r = strBirthday.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})/);
		//
		if(r==null) return  false;
		//
		var returnAge;				
		var strBirthdayArr = strBirthday.split("-");				
		var birthYear = strBirthdayArr[0];				
		var birthMonth = strBirthdayArr[1];				
		var birthDay = strBirthdayArr[2];				
		var d = new Date();
		var nowYear = d.getFullYear();
		var nowMonth = d.getMonth() + 1;
		var nowDay = d.getDate();
		// 
		if (nowYear == birthYear) {				
			returnAge = 0;//同年 则为0岁 				
		} else {
			var ageDiff = nowYear - birthYear; //年之差 				
			if (ageDiff > 0) {
				if (nowMonth == birthMonth) {
					// 
					var dayDiff = nowDay - birthDay;//日之差  
					if (dayDiff < 0) {
						returnAge = ageDiff - 1;
					} else {
						returnAge = ageDiff;
					}
					// 
				} else {
					//
					var monthDiff = nowMonth - birthMonth;//月之差  
					// 
					if (monthDiff < 0) {
						returnAge = ageDiff - 1;
					} else {
						returnAge = ageDiff;				
					}
					//
				}				
			} else {
				//
				returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天  
				// 
			}
			//
		}
		//
		return returnAge;	//返回周岁年龄 
		// 
	}
};
// 
module.exports = {
	time: time,
}
