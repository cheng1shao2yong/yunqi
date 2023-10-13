import {formatDate,formatDateTime,formatTime,copyObj,inArray} from '../util.js';
import fieldlist from '../components/Fieldlist.js';
import selectpage from '../components/SelectPage.js';
import attachment from "../components/Attachment.js";
import wangeditor from "../components/editor/Wangeditor.js";
import template from './template/FormTemp.js';

const getParams=function(obj,str) {
    const regex = /{([^}]+)}/g;
    const matches = str.match(regex);
    if (!matches) return str;
    matches.forEach(match => {
        const key = match.replace('{', '').replace('}', '');
        let value = obj[key];
        if(value instanceof Array){
            value=value.join(',');
        }
        str = str.replace(match, value);
    });
    return str;
}
export default {
    name: "YunForm",
    components:{'Fieldlist':fieldlist,'SelectPage':selectpage,'Attachment':attachment,'Wangeditor':wangeditor},
    data: function () {
        return {
            isLayer:false,
            documentWidth:'',
            activeStep:0,
            form_:{
                columns:[],
                data:{},
                rules:{}
            }
        }
    },
    mounted:function(){
        this.documentWidth=document.documentElement.clientWidth;
        if(top!=window){
            let iframe = top.document.querySelector('iframe[src="'+window.location.href+'"][class="layer-iframe"]');
            if(iframe){
                this.isLayer=true;
            }
        }
        this.reset();
    },
    props:{
        data:{
            type:Object,
            default:{}
        },
        action:{
            type:String
        },
        steps:{
            type:Array
        },
        columns:{
            type: Array,
            required: true
        },
        labelPosition:{
            type:String,
            default:'right'
        },
        labelWidth:{
            type:Number,
            default:120
        },
        requireAsteriskPosition:{
            type:String,
            default:'left'
        },
        appendWidth:{
            type:Number,
            default:0
        },
        onRender:{
            type:Function,
            default:function(){}
        },
        onSubmit:{
            type:Function,
            default:function(){return true}
        },
        onSuccess:{
            type:Function,
            default:function(res){}
        },
        onFail:{
            type:Function,
            default:function(res){}
        },
        onStep:{
            type:Function,
            default:function(res){}
        }
    },
    template:template,
    methods:{
        reset:function(){
            let columns=this.columns;
            let promise=[];
            for(let i=0;i<columns.length;i++){
                //格式化表单
                let edit={form:'input',value:'',placeholder:'',blur:'',change:''};
                /**简写begin**/
                if(columns[i].edit=='hidden' || columns[i].edit=='HIDDEN'){
                    edit.type='hidden';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='text' || columns[i].edit=='TEXT'){
                    edit.type='text';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='readonly' || columns[i].edit=='READONLY'){
                    edit.type='text';
                    edit.readonly=true;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='password' || columns[i].edit=='PASSWORD'){
                    edit.type='password';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='textarea' || columns[i].edit=='TEXTAREA'){
                    edit.type='textarea';
                    edit.rows=4;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='number' || columns[i].edit=='NUMBER'){
                    edit.type='number';
                    columns[i].edit=edit;
                }

                if(columns[i].edit=='select' || columns[i].edit=='SELECT'){
                    edit.form='select';
                    edit.clearable=true;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='selects' || columns[i].edit=='SELECTS'){
                    edit.form='select';
                    edit.clearable=true;
                    edit.multiple=true;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='checkbox' || columns[i].edit=='CHECKBOX'){
                    edit.form='checkbox';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='radio' || columns[i].edit=='RADIO'){
                    edit.form='radio';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='editor' || columns[i].edit=='EDITOR'){
                    edit.form='editor';
                    edit.width='100%';
                    edit.height='350px';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='switch' || columns[i].edit=='SWITCH'){
                    edit.form='switch';
                    if(columns[i].searchList){
                        let j=0,k0,k1;
                        for(let k in columns[i].searchList){
                            if(j===0)k0=k;
                            if(j===1)k1=k;
                            j++;
                        }
                        edit.activeValue=k0;
                        edit.value=k0;
                        edit.inactiveValue=k1;
                    }else{
                        edit.inactiveValue=0;
                        edit.activeValue=1;
                        edit.value=1;
                    }
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='date' || columns[i].edit=='DATE'){
                    edit.form='date-picker';
                    edit.type='date';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='datetime' || columns[i].edit=='DATETIME'){
                    edit.form='date-picker';
                    edit.type='datetime';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='daterange' || columns[i].edit=='DATERANGE'){
                    edit.form='date-picker';
                    edit.type='daterange';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='time' || columns[i].edit=='TIME'){
                    edit.form='time-picker';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='timerange' || columns[i].edit=='TIMERANGE'){
                    edit.form='time-picker';
                    edit.isRange=true;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='area' || columns[i].edit=='AREA'){
                    edit.form='cascader';
                    edit.url='ajax/area';
                    edit.level=3;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='category' || columns[i].edit=='CATEGORY'){
                    edit.form='cascader';
                    edit.url='ajax/category';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='image' || columns[i].edit=='IMAGE'){
                    edit.form='attachment';
                    edit.limit=1;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='images' || columns[i].edit=='IMAGES'){
                    edit.form='attachment';
                    edit.limit=10;
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='file' || columns[i].edit=='FILE'){
                    let mimetype=Yunqi.config.upload.mimetype.split(',');
                    let accept=[];
                    mimetype.forEach(res=>{
                        accept.push('.'+res);
                    });
                    edit.form='files';
                    edit.accept=accept.join(',');
                    edit.multiple=false;
                    edit.limit=1;
                    edit.category='';
                    edit.disks='local_public';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='files' || columns[i].edit=='FILES'){
                    let mimetype=Yunqi.config.upload.mimetype.split(',');
                    let accept=[];
                    mimetype.forEach(res=>{
                        accept.push('.'+res);
                    });
                    edit.form='files';
                    edit.accept=accept.join(',');
                    edit.multiple=true;
                    edit.limit=10;
                    edit.category='';
                    edit.disks='local_public';
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='fieldlist' || columns[i].edit=='FIELDLIST'){
                    edit.form='fieldlist';
                    edit.label=['键名','键值'];
                    edit.value= [{"0":"", "1":""},{"0":"", "1":""}];
                    columns[i].edit=edit;
                }
                if(columns[i].edit=='slot' || columns[i].edit=='SLOT'){
                    edit.form='slot';
                    columns[i].edit=edit;
                }
                /**简写end**/
                if(typeof columns[i].edit=='object'){
                    for(let k in columns[i].edit){
                        if(k=='blur' || k=='change'){
                            continue;
                        }
                        if(typeof columns[i].edit[k]=='string' && k!='value' && k!='url'){
                            columns[i].edit[k]=columns[i].edit[k].toLowerCase();
                        }
                    }
                    if(columns[i].edit.form=='fieldlist'){
                        edit.label=['键名','键值'];
                        edit.value= [{"0":"", "1":""},{"0":"", "1":""}];
                    }
                    if(columns[i].edit.form=='cascader'){
                        columns[i].edit.props=Object.assign({expandTrigger:'hover',multiple:false,children:'childlist',value:'id',label:'name',lazy:false},columns[i].edit.props);
                        if(columns[i].edit.url && columns[i].edit.level){
                            columns[i].edit.props.lazy=true;
                            columns[i].edit.props.expandTrigger='click';
                            let url=columns[i].edit.url;
                            columns[i].edit.props.lazyLoad=function(node,resolve){
                                let pid=0;
                                let level=columns[i].edit.level;
                                if(node.level){
                                    pid=node.value;
                                }
                                Yunqi.ajax.get(url,{pid:pid}).then(res=>{
                                    if(res instanceof Array){
                                        res.map(t=>{
                                            if(node.level>=level-1){
                                                t.leaf=true;
                                            }
                                            return t;
                                        });
                                        resolve(res);
                                    }else{
                                        resolve([]);
                                    }
                                });
                            };
                            delete columns[i].edit.options;
                        }
                        if(columns[i].edit.url && !columns[i].edit.level){
                            let pro=new Promise((resolve,reject)=>{
                                Yunqi.ajax.get(columns[i].edit.url).then(res=>{
                                    resolve(res);
                                });
                            });
                            promise.push(pro);
                        }
                    }
                    if(columns[i].edit.form=='date-picker'){
                        if(columns[i].edit.type=='year'){
                            edit.format='YYYY年';
                        }
                        if(columns[i].edit.type=='month'){
                            edit.format='YYYY年MM月';
                        }
                        if(columns[i].edit.type=='daterange') {
                            edit.shortcuts = [
                                {text:'今天',value:function(){
                                    const start = new Date();
                                    return [start, start];
                                }},
                                {text:'昨天',value:function(){
                                    const start = new Date();
                                    start.setTime(start.getTime()-3600*1000*24*1);
                                    return [start, start];
                                }},
                                {text:'最近7天',value:function(){
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime()-3600*1000*24*6);
                                    return [start, end];
                                }},
                                {text:'最近30天',value:function(){
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime()-3600*1000*24*29);
                                    return [start, end];
                                }},
                                {text:'本月',value:function(){
                                    const end = new Date();
                                    const start=new Date(formatDate(end).slice(0,7)+'-01');
                                    return [start, end];
                                }},
                                {text:'上月',value:function(){
                                    const currentDate = new Date();
                                    let lastMonth = currentDate.getMonth() - 1;
                                    let year = currentDate.getFullYear();
                                    if (lastMonth < 0) {
                                        year--;
                                        lastMonth = 11;
                                    }
                                    let firstDay = new Date(year, lastMonth, 1);
                                    let lastDay = new Date(year, lastMonth + 1, 0);
                                    return [firstDay, lastDay];
                                }},
                                {text:'今年',value:function(){
                                    let currentDate = new Date();
                                    let year = currentDate.getFullYear();
                                    let start = new Date(year, 0, 1);
                                    let end = new Date(year, 11, 31);
                                    return [start, end];
                                }},
                                {text:'去年',value:function(){
                                    let currentDate = new Date();
                                    let year = currentDate.getFullYear() - 1;
                                    let start = new Date(year, 0, 1);
                                    let end = new Date(year, 11, 31);
                                    return [start, end];
                                }},
                            ];
                        }
                    }
                    if(columns[i].title){
                        //定义placeholder
                        edit.placeholder='请输入'+columns[i].title;
                        if(columns[i].edit.form=='time' || columns[i].edit.form=='select' || columns[i].edit.form=='selectpage' || columns[i].edit.form=='cascader'){
                            edit.placeholder='请选择'+columns[i].title;
                        }
                    }
                    //如果用户自定义了属性，则优先使用
                    for(let key in edit){
                        columns[i].edit[key]=columns[i].edit[key]?columns[i].edit[key]:edit[key];
                        if(key=='blur' || key=='change'){
                            let fun=columns[i].edit[key];
                            if(!fun){
                                fun=function(){};
                                columns[i].edit[key]=fun;
                            }
                            if(typeof fun=='string'){
                                columns[i].edit[key]=function(data,row){
                                    if(Yunqi.app[fun]==undefined){
                                        throw new Error('找不到方法：'+fun);
                                    }
                                    Yunqi.app[fun](data,row);
                                };
                            }
                        }
                    }
                }
                if(typeof columns[i].searchList=='function'){
                    columns[i].searchList=columns[i].searchList();
                }
            }
            Promise.all(promise).then(res=>{
                let j=0;
                for(let i=0;i<columns.length;i++){
                    //初始化cascader
                    if(
                        columns[i].edit
                        && columns[i].edit.form=='cascader'
                        && columns[i].edit.url
                        && !columns[i].edit.props.lazy
                    ){
                        columns[i].edit.options=res[j];
                        j++;
                    }
                }
                this.form_.columns=columns;
                this.formatData();
                this.formatRules();
                this.onRender(this.form_.data);
                if(this.steps){
                    this.activeStep=0;
                }
            });
        },
        //初始化数据
        formatData:function(){
            let columns=this.columns;
            let data=copyObj(this.data);
            for(let i=0;i<columns.length;i++){
                if(columns[i].edit){
                    let value;
                    //设置默认值
                    if(columns[i].edit.form=='checkbox' && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.form=='select' && columns[i].edit.multiple && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='dates' && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.form=='cascader' && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.form=='files' && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.form=='selectpage' && columns[i].edit.multiple && !columns[i].edit.value){
                        value=[];
                    }else if(columns[i].edit.value && columns[i].edit.value instanceof Object && typeof columns[i].edit.value=='object'){
                        value=copyObj(columns[i].edit.value);
                    }else if(columns[i].edit.value && columns[i].edit.value instanceof Object && typeof columns[i].edit.value=='function'){
                        value=columns[i].edit.value(this.data);
                    }else{
                        value=columns[i].edit.value;
                    }
                    //替换默认值
                    value=data[columns[i].field]!==undefined?data[columns[i].field]:value;
                    //根据表单类型修改表单项目的值
                    if(columns[i].edit.form=='files'){
                        if(value && typeof value=='string'){
                            let files=value.split(',');
                            value=[];
                            files.forEach(res=>{
                                let locase=res.toLowerCase();
                                if(locase.endsWith('.png') || locase.endsWith('.jpg') || locase.endsWith('.jpeg') || locase.endsWith('.gif') || locase.endsWith('.bmp')){
                                    value.push({
                                        name:'',
                                        url:res,
                                        postUrl:res
                                    });
                                }else{
                                    value.push({
                                        name:'',
                                        url:getfileImage(res),
                                        postUrl:res
                                    });
                                }
                            });
                        }
                        if(!value){
                            value=[];
                        }
                    }
                    if(columns[i].edit.form=='select' && columns[i].edit.multiple && typeof value=='string'){
                        value=value.split(',');
                    }
                    if(columns[i].edit.form=='select' && columns[i].edit.multiple && value instanceof Array){
                        value=value.map(res=>{
                            return res+'';
                        });
                    }
                    if(columns[i].edit.form=='checkbox' && typeof value=='string'){
                        value=value.split(',');
                    }
                    if(columns[i].edit.form=='checkbox' && value instanceof Array){
                        value=value.map(res=>{
                            return res+'';
                        });
                    }
                    if(columns[i].edit.form=='input' && columns[i].edit.type=='password'){
                        value='';
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='date' && value && typeof value=='string'){
                        value=new Date(value);
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='datetime' && value && typeof value=='string'){
                        value=new Date(value);
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='date' && value && typeof value=='number'){
                        value=new Date(value*1000);
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='datetime' && value && typeof value=='number'){
                        value=new Date(value*1000);
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='dates'){
                         if(!value){
                             value=[];
                         }else if(typeof value=='string'){
                             value=value.split(',');
                         }
                         value=value.map(res=>{
                             res=new Date(res);
                             return res;
                         });
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='year' && value){
                        let date=formatDate(new Date());
                        value=new Date(value+date.slice(4));
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='month' && value){
                        let date=formatDate(new Date());
                        value=new Date(value+date.slice(7));
                    }
                    if(columns[i].edit.form=='date-picker' && columns[i].edit.type=='daterange' && value){
                        if(typeof value=='string'){
                            value=value.split(',');
                        }
                        value=value.map(res=>{
                            res=new Date(res);
                            return res;
                        });
                    }
                    if(columns[i].edit.form=='time-picker' && !columns[i].edit.isRange && value){
                        let date=formatDate(new Date());
                        value=new Date(date+' '+value);
                    }
                    if(columns[i].edit.form=='time-picker' && columns[i].edit.isRange && value){
                        if(typeof value=='string'){
                            value=value.split(',');
                        }
                        let date=formatDate(new Date());
                        value=value.map(res=>{
                            res=new Date(date+' '+res);
                            return res;
                        });
                    }
                    if(typeof value=='number'){
                        value=value.toString();
                    }
                    data[columns[i].field]=value;
                }
                if(this.steps && columns[i].step==undefined){
                    columns[i].step=1;
                }
            }
            this.form_.data=data;
        },
        //格式化rules
        formatRules:function () {
            let rules={};
            let columns=this.columns;
            for(let i=0;i<columns.length;i++){
                if(columns[i].rules instanceof Object){
                    if(columns[i].rules instanceof Function){
                        const trigger = (columns[i].edit.form === 'input') ? 'blur' : 'change';
                        const validator=columns[i].rules;
                        rules[columns[i].field]=[{validator,trigger}];
                    }else if(Array.isArray(columns[i].rules)){
                        rules[columns[i].field]=copyObj(columns[i].rules);
                    }else{
                        rules[columns[i].field]=[copyObj(columns[i].rules)];
                    }
                }
                if(typeof columns[i].rules=='string'){
                    const ruleArr = columns[i].rules.split(';');
                    const ruleList = [];
                    ruleArr.forEach(rule => {
                        const trigger = (columns[i].edit.form === 'input') ? 'blur' : 'change';
                        let validator;
                        let message;
                        let required;
                        if(rule.startsWith('required')){
                            required=true;
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback(new Error());
                                }else if(value instanceof Array && value.length==0){
                                    callback(new Error('请至少选择一项'));
                                }else{
                                    callback();
                                }
                            };
                            message=columns[i].title+'不能为空！';
                        }else if(rule.startsWith('checked')){
                            let f=rule.indexOf('~')==-1;
                            let d=rule.slice(8);
                            let drr=d.slice(0,d.length-1).split('~');
                            validator = (rule, value, callback) => {
                                if(drr[0] && f && value.length!=parseInt(drr[0])){
                                    callback(new Error(`请选择${drr[0]}项`));
                                }else if(drr[0] && value.length<parseInt(drr[0])){
                                    callback(new Error(`至少选择${drr[0]}项`));
                                }else if(drr[1] && value.length>parseInt(drr[1])){
                                    callback(new Error(`至多选择${drr[1]}项`));
                                }else if (!value || value.length === 0) {
                                    callback(new Error(`至少选择一项`));
                                } else {
                                    callback();
                                }
                            };
                        }else if(rule.startsWith('integer')){
                            validator = (tx, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                if (rule=='integer' && !(/^-?\d+$/.test(value))) {
                                    callback(new Error('请输入整数'));
                                } else if (rule=='integer(+)' && !(/^[1-9]\d*$/.test(value))) {
                                    callback(new Error('请输入正整数'));
                                } else if (rule=='integer(+0)' && !(/^0$/.test(value))) {
                                    callback(new Error('请输入大于或等于0的整数'));
                                } else if (rule=='integer(-)' && !(/^(-\d+)$/.test(value))) {
                                    callback(new Error('请输入负整数'));
                                } else if (rule=='integer(-0)' && !(/^(-\d+|0)$/.test(value))) {
                                    callback(new Error('请输入小于或等于0的整数'));
                                } else {
                                    callback();
                                }
                            };
                        }else if(rule.startsWith('range')){
                            validator = (tx, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                let f=rule.indexOf('~')==-1;
                                let d=rule.slice(6);
                                let drr=d.slice(0,d.length-1).split('~');
                                if(drr[0] && Number(value)<Number(drr[0])){
                                    callback(new Error(`请填写不小于${drr[0]}的数`));
                                }else if(drr[1] && Number(value)>Number(drr[1])){
                                    callback(new Error(`请填写不大于${drr[1]}的数`));
                                }else {
                                    callback();
                                }
                            }
                        }else if(rule.startsWith('length')){
                            let f=rule.indexOf('~')==-1;
                            let d=rule.slice(7);
                            let drr=d.slice(0,d.length-1).split('~');
                            validator = (rule, value, callback) => {
                                if(drr[0] && f && value.length!=parseInt(drr[0])){
                                    callback(new Error(`请输入${drr[0]}个字符`));
                                }else if(drr[0] && value.length<parseInt(drr[0])){
                                    callback(new Error(`至少输入${drr[0]}个字符`));
                                }else if(drr[1] && value.length>parseInt(drr[1])){
                                    callback(new Error(`至多输入${drr[1]}个字符`));
                                }else {
                                    callback();
                                }
                            };
                        }else if(rule.startsWith('chinaChar')){
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                for(let j=0;j<value.length;j++){
                                    let s=value.charAt(j);
                                    let reg = /[\u4e00-\u9fa5]{1}/;
                                    if(!reg.test(s)){
                                        callback(new Error());
                                        return;
                                    }
                                }
                                callback();
                            };
                            message='只能输入中文';
                        }else if(rule.startsWith('unChinaChar')){
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                for(let j=0;j<value.length;j++){
                                    let s=value.charAt(j);
                                    let reg = /[\u4e00-\u9fa5]{1}/;
                                    if(reg.test(s)){
                                        callback(new Error());
                                        return;
                                    }
                                }
                                callback();
                            };
                            message='不能输入中文';
                        }else if(rule.startsWith('mobile')){
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                const reg = /^1[3456789]\d{9}$/;
                                if (!reg.test(value)) {
                                    callback(new Error());
                                } else {
                                    callback();
                                }
                            };
                            message=`请输入手机号！`;
                        }else if(rule.startsWith('email')){
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/;
                                if (!reg.test(value)) {
                                    callback(new Error());
                                } else {
                                    callback();
                                }
                            };
                            message=`请输入邮箱地址！`;
                        }else if(rule.startsWith('idcard')){
                            validator = (rule, value, callback) => {
                                if(value==='' || value===null){
                                    callback();
                                    return;
                                }
                                const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                                if (!reg.test(value)) {
                                    callback(new Error());
                                } else {
                                    callback();
                                }
                            };
                            message=`请输入身份证号！`;
                        }
                        ruleList.push({required,validator,message,trigger});
                    });
                    rules[columns[i].field]=ruleList;
                }
            }
            this.form_.rules=rules;
        },
        handlePictureCardPreview:function (uploadfile){
            let img=uploadfile.url;
            Yunqi.api.previewImg(img);
        },
        showField:function (fields){
            if(typeof fields=='string'){
                fields=[fields];
            }
            for(let i=0;i<this.form_.columns.length;i++){
                if(inArray(fields,this.form_.columns[i].field)){
                    delete this.form_.columns[i].edit.visible;
                }
            }
        },
        hideField:function (fields){
            if(typeof fields=='string'){
                fields=[fields];
            }
            for(let i=0;i<this.form_.columns.length;i++){
                if(inArray(fields,this.form_.columns[i].field)){
                    this.form_.columns[i].edit.visible=false;
                }
            }
        },
        setField:function (field,key,value){
            for(let i=0;i<this.form_.columns.length;i++){
                if(this.form_.columns[i].field==field){
                    this.form_.columns[i][key]=value;
                    if(key=='edit' && value instanceof Object && value.value!==undefined){
                        this.form_.data[field]=value.value;
                    }
                    return;
                }
            }
        },
        setValue:function (key,value){
            if(typeof value=='number'){
                value=value.toString();
            }
            this.form_.data[key]=value;
        },
        getValue:function (key){
            return this.form_.data[key];
        },
        setError:function (field,message){
            for(let i=0;i<this.form_.columns.length;i++){
                if(this.form_.columns[i].field==field){
                    let edit=this.form_.columns[i].edit;
                    edit.error=message;
                    this.$refs.formRef.scrollToField(field);
                    return;
                }
            }
        },
        changeFieldlist:function (r){
            this.form_.data[r.field]=r.value;
        },
        changeSelectpage:function (r){
            this.form_.data[r.field]=r.value;
        },
        changeAttachment:function (r){
            this.form_.data[r.field]=r.value;
        },
        changeEditor:function (r){
            this.form_.data[r.field]=r.value;
        },
        isYesOrNo:function (searchList){
            let r=true;
            let i=0;
            for(let k in searchList){
                if(i===0 && k!=0 && k!='0'){
                    r=false;
                }
                if(i===1 && k!=1 && k!='1'){
                    r=false;
                }
                if(i===2){
                    r=false;
                }
                i++;
            }
            return r;
        },
        fileUploadSuccess:function (e,f){
            if(!e.code){
                Yunqi.message.error(__(e.msg));
                return;
            }
            f.url=e.data.thumburl;
            f.postUrl=e.data.fullurl;
        },
        fileUploadBefore:function (file){
            let maxsize=Number(Yunqi.config.upload.maxsize);
            if(file.size>1024*1024*maxsize){
                Yunqi.message.error(__('文件大小不能超过'+maxsize+'mb'));
                return false;
            }
            return true;
        },
        parsePostValue:function (postdata,key,value,havaname=false){
            if(value===undefined || value===null){
                value='';
            }
            if(value instanceof Object && Object.keys(value).length==0){
                value='';
            }
            if(havaname){
                postdata[havaname]=value;
            }else{
                postdata['row['+key+']']=value;
            }
        },
        nextStep:function(){
            let columns=this.form_.columns;
            let promiseAll=[];
            for(let i=0;i<columns.length;i++){
                if(columns[i].edit && columns[i].step==this.activeStep){
                    let promise=new Promise((resolve,reject)=>{
                        this.$refs.formRef.validateField(columns[i].field,valid=>{
                            if(valid){
                                resolve();
                            }else{
                                reject();
                            }
                        });
                    });
                    promiseAll.push(promise);
                }
            }
            Promise.all(promiseAll).then(()=>{
                this.activeStep++;
                this.onStep(this.activeStep,this.form_.data);
            });
        },
        preStep:function (){
            this.activeStep--;
            this.onStep(this.activeStep,this.form_.data);
        },
        submit:function (e) {
           let tokenEle=document.querySelector('input[name="__token__"]');
           let token=tokenEle?tokenEle.value:'';
           this.$refs.formRef.validate((valid, fields)=>{
                if(valid){
                    let r=this.onSubmit(this.form_.data);
                    if(r===true){
                        let action=this.action;
                        if(!action){
                            action=Yunqi.config.url;
                        }
                        let postdata={};
                        for(let k in this.form_.data){
                            let havaname=false;
                            let isFile=false;
                            let isFieldList=false;
                            let dateType=false;
                            let isTime=false;
                            for(let i=0;i<this.columns.length;i++){
                                if(this.columns[i].edit==undefined){
                                    continue;
                                }
                                if(this.columns[i].field==k && this.columns[i].edit.name!=undefined){
                                    havaname=this.columns[i].edit.name;
                                }
                                if(this.columns[i].field==k && this.columns[i].edit.form=='files'){
                                    isFile=true;
                                }
                                if(this.columns[i].field==k && this.columns[i].edit.form=='fieldlist'){
                                    isFieldList=true;
                                }
                                if(this.columns[i].field==k && this.columns[i].edit.form=='date-picker'){
                                    dateType=this.columns[i].edit.type;
                                }
                                if(this.columns[i].field==k && this.columns[i].edit.form=='time-picker'){
                                    isTime=true;
                                }
                            }
                            let issetpost=false;
                            if(isFile){
                                issetpost=true;
                                let data=this.form_.data[k];
                                let r=[];
                                if(data){
                                    for(let i in data){
                                        r.push(data[i].postUrl);
                                    }
                                }
                                if(r.length>0){
                                    this.parsePostValue(postdata,k,r.join(','),havaname);
                                }
                            }
                            if(dateType){
                                issetpost=true;
                                let dateValue=this.form_.data[k];
                                if(dateValue){
                                    switch (dateType){
                                        case 'date':
                                            dateValue=formatDate(dateValue);
                                            break;
                                        case 'datetime':
                                            dateValue=formatDateTime(dateValue);
                                            break;
                                        case 'dates':
                                            if(dateValue.length>0){
                                                dateValue=dateValue.map(res=>{
                                                    res=formatDate(res);
                                                    return res;
                                                });
                                            }else{
                                                dateValue='';
                                            }
                                            break;
                                        case 'year':
                                            dateValue=dateValue.getFullYear();
                                            break;
                                        case 'month':
                                            dateValue=formatDate(dateValue).slice(0,7);
                                            break;
                                        case 'daterange':
                                            if(dateValue.length){
                                                let begin1=formatDate(dateValue[0])+' 00:00:00';
                                                let end1=formatDate(dateValue[1])+' 23:59:59';
                                                dateValue=[begin1,end1];
                                            }else{
                                                dateValue='';
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    this.parsePostValue(postdata,k,dateValue,havaname);
                                }
                            }
                            if(isTime){
                                issetpost=true;
                                let timeValue=this.form_.data[k];
                                if(timeValue){
                                    if(timeValue instanceof Array){
                                        timeValue=[formatTime(timeValue[0]),formatTime(timeValue[1])];
                                    }else{
                                        timeValue=formatTime(timeValue);
                                    }
                                    this.parsePostValue(postdata,k,timeValue,havaname);
                                }
                            }
                            if(isFieldList){
                                issetpost=true;
                                let strlist=JSON.stringify(this.form_.data[k]);
                                if(strlist!='{}' && strlist!='[]'){
                                    this.parsePostValue(postdata,k,JSON.stringify(this.form_.data[k]),havaname);
                                }
                            }
                            if(!issetpost){
                                this.parsePostValue(postdata,k,this.form_.data[k],havaname);
                            }
                        }
                        if(token){
                            postdata.__token__=token;
                        }
                        Yunqi.ajax.post(action,postdata,true).then(res=>{
                            this.onSuccess(res);
                            Yunqi.api.closelayer(Yunqi.config.window.id,true);
                        }).catch(err=>{
                            this.onFail(err);
                        });
                    }
                }
           });
        }
    },
};
