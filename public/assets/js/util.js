export function inArray(arr,val){
	for(let i=0;i<arr.length;i++){
		if(arr[i]==val){
			return true;
		}
	}
	return false;
}

export function formatDate(date){
    if(typeof date=='string'){
        return date;
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if(month<10){
        month='0'+month;
    }
    let day = date.getDate();
    if(day<10){
        day='0'+day;
    }
    return year+'-'+month+'-'+day;
}

export function formatDateTime(date){
    if(typeof date=='string'){
        return date;
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if(month<10){
        month='0'+month;
    }
    let day = date.getDate();
    if(day<10){
        day='0'+day;
    }
    let hour=date.getHours();
    if(hour<10){
        hour='0'+hour;
    }
    let minis=date.getMinutes();
    if(minis<10){
        minis='0'+minis;
    }
    let seconds=date.getSeconds();
    if(seconds<10){
        seconds='0'+seconds;
    }
    return year+'-'+month+'-'+day+' '+hour+':'+minis+':'+seconds;
}


export function formatTime(date){
    let hour=date.getHours();
    if(hour<10){
        hour='0'+hour;
    }
    let minis=date.getMinutes();
    if(minis<10){
        minis='0'+minis;
    }
    let seconds=date.getSeconds();
    if(seconds<10){
        seconds='0'+seconds;
    }
    return hour+':'+minis+':'+seconds;
}

export function rand(n,m){
	return Math.floor(Math.random() * (m - n + 1)) + n;
}

export function parseNumber(number){
	if(parseInt(number, 10) != number){
		return Number(parseFloat(number).toFixed(2));
	}
	return parseInt(number);
}

//用递归的方式深拷贝对象
export function copyObj(obj){
    let r=JSON.parse(JSON.stringify(obj));
    for(let i in obj){
        if(typeof obj[i]=='function'){
            r[i]=obj[i];
        }
        if(typeof obj[i]=='object'){
            r[i]=copyObj(obj[i]);
        }
    }
    return r;
}