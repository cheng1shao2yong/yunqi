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

export function formatDuration(seconds,showSeconds=true) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    let formattedDuration = "";
    if (days > 0) {
        formattedDuration += `${days}天 `;
    }
    if (hours > 0) {
        formattedDuration += `${hours}小时 `;
    }
    if (minutes > 0) {
        formattedDuration += `${minutes}分 `;
    }
    if (remainingSeconds > 0 && showSeconds) {
        formattedDuration += `${remainingSeconds}秒`;
    }
    if(!formattedDuration){
        return remainingSeconds+'秒';
    }
    return formattedDuration.trim();
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

export function getUniqid() {
    var currentDate = new Date();
    var timestamp = currentDate.getTime().toString(36); // 使用36进制
    var unique = (currentDate.getUTCMilliseconds() + Math.random()).toString(36).slice(2, 7); // 随机数
    return (timestamp + unique).replace('.','');
}

export function getfileImage(filename){
    let $domain=location.origin;
    let start = filename.lastIndexOf('.');
    let $ext= start>-1?filename.slice(start + 1):'';
    if (inArray(['jpg', 'png', 'bmp', 'jpeg', 'gif'],$ext)) {
        return $domain+'/assets/img/fileicon/image.png';
    }else if(inArray(['doc', 'docx'],$ext)) {
        return $domain+'/assets/img/fileicon/doc.png';
    }else if(inArray(['ppt', 'pptx'],$ext)) {
        return $domain+'/assets/img/fileicon/ppt.png';
    }else if(inArray(['xls', 'xlsx'],$ext)) {
        return $domain+'/assets/img/fileicon/xls.png';
    }else if(inArray(['mp3','wav','wma','ogg'],$ext)) {
        return $domain+'/assets/img/fileicon/audio.png';
    }else if(inArray(['mp4', 'avi', 'rmvb','swf', 'flv','rm', 'ram', 'mpeg', 'mpg', 'wmv', 'mov'],$ext)) {
        return $domain+'/assets/img/fileicon/video.png';
    }else if(inArray(['zip', 'rar', '7z', 'gz', 'tar'],$ext)) {
        return $domain+'/assets/img/fileicon/zip.png';
    }else if(inArray(['apk','tiff','exe','html','pdf','psd','visio','svg','txt','xml'],$ext)){
        return $domain+'/assets/img/fileicon/'+$ext+'.png';
    }else{
        return $domain+'/assets/img/fileicon/wz.png';
    }
}