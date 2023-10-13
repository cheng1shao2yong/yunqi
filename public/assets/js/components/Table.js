import {formatDate, formatDateTime, copyObj, inArray, formatTime} from '../util.js';
import selectpage from '../components/SelectPage.js';
import template from './template/TableTemp.js';
const setValue=function(obj, path, value){
    const keys = path.split('.');
    if (keys.length === 1) {
        obj[path] = value;
        return;
    }
    const currentKey = keys[0];
    if (!obj.hasOwnProperty(currentKey)) {
        obj[currentKey] = {};
    }
    const nextObj = obj[currentKey];
    const nextPath = keys.slice(1).join('.');
    setValue(nextObj, nextPath, value);
}
const getValue=function(row,field){
    let fieldarr=field.split('.');
    for(let i=0;i<fieldarr.length;i++){
        row=row[fieldarr[i]];
        if(row==undefined){
            return row;
        }
    }
    return row;
}
const countChild=function (arr){
    let i=arr.length;
    for(let k in arr){
        if(arr[k].children){
            if(arr[k]._expand){
                arr[k]._expand=false;
                i+=countChild(arr[k].children);
            }
        }
    }
    return i;
}
const getTreeChildren=function(arr,id){
    let childIds = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].pid === id) {
            childIds.push(arr[i].id);
            childIds = childIds.concat(getTreeChildren(arr, arr[i].id));
        }
    }
    return childIds;
}

export default {
    name: "Table",
    components:{'SelectPage':selectpage},
    data: function () {
        return {
            loading:true,
            sortData:'',
            expandRowKeys:[],
            /*需要reset的数据begin*/
            list:[],
            total:0,
            summary:'',
            currentPage:1,
            pageSize:10,
            selections:[],
            searchValue:'',
            /*需要reset的数据end*/
            table_:{
                columns:'',
                toolbar:[],
                searchFormVisible:true,
            },
            treeExpandAll_:false,
            mainFrameExpand:false,
            tabList:[],
            tabsValue:'',
            rightToolOption:{type:'font',list:{large:'大',default:'中',small:'小'}},
            pageFont:'default',
            download:{
                show:false,
                field:[],
                filter:1,
                page:0,
            }
        }
    },
    template:template,
    props:{
        columns:{
            type: Array,
            required: true
        },
        extend:{
            type:Object,
            default:{
                index_url: '',
                add_url: '',
                edit_url: '',
                del_url: '',
                multi_url: '',
                download_url:'',
                import_url:'',
                recyclebin_url:''
            }
        },
        searchFormVisible:{
            type:Boolean,
            default:true
        },
        commonSearch:{
            type:Boolean,
            default:true
        },
        search:{
            type:String,
            default:''
        },
        style:{
            type:Object,
            default: {width:'100%'}
        },
        pagination:{
            type:Boolean,
            default:true
        },
        toolbar:{
            type:String,
            default:'refresh,add,edit,del'
        },
        pk:{
            type:String,
            default:'id'
        },
        sortName:{
            type:String,
            default:'id'
        },
        order:{
            type:String,
            default:'desc'
        },
        tabs:{
            type:String,
            default:''
        },
        isTree:{
            type:Boolean,
            default:false
        },
        treeExpandAll:{
            type:Boolean,
            default:false
        },
        showSummary:{
            type:Boolean,
            default:false
        },
        auth:{
            type:Object,
            default:{
                edit: true,
                add: true,
                multi:true,
                del:true,
                import:true,
                download:true,
                recyclebin:true
            }
        },
        addForm:{
            type:Object,
            default:{
                icon:'fa fa-plus-square-o',
                title:__('添加'),
                expand:false,
                width:800,
                height:500
            }
        },
        editForm:{
            type:Object,
            default:{
                icon:'fa fa-pencil-square-o',
                title:__('编辑'),
                expand:false,
                width:800,
                height:500
            }
        },
        onRender:{
            type:Function,
            default:function(){}
        },
    },
    mounted:function(){
        this.table_.searchFormVisible=this.searchFormVisible;
        this.table_.toolbar=this.toolbar.split(',');
        if(!this.pagination){
            this.pageSize=10000;
        }
        this.reset();
        this.rowDrop();
    },
    watch:{
        loading:function (data) {
            if(!data){
                let colgroup=document.getElementsByTagName('colgroup');
                for(let i=0;i<colgroup.length;i++){
                    let col=colgroup[i].childNodes;
                    if(col.length>0){
                        col[col.length-1].style.display='none';
                    }
                }
            }
        }
    },
    methods:{
        reset:function(){
            let promise=[];
            let columns=copyObj(this.columns);
            for(let i=0;i<columns.length;i++){
                //格式化operate
                let operate={form:'input',value:'',size:'default',placeholder:columns[i].title};
                /**简写begin**/
                if((columns[i].field && columns[i].operate==undefined) || columns[i].operate=='='){
                    operate.filter='=';
                    operate.type='text';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='!=' || columns[i].operate=='<>'){
                    operate.filter='<>';
                    operate.type='text';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='null' || columns[i].operate=='NULL'){
                    operate.filter='IS NULL';
                    operate.form='hidden';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='not null' || columns[i].operate=='NOT NULL'){
                    operate.filter='IS NOT NULL';
                    operate.form='hidden';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='like' || columns[i].operate=='LIKE'){
                    operate.filter='LIKE';
                    operate.type='text';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='not like' || columns[i].operate=='NOT LIKE'){
                    operate.filter='NOT LIKE';
                    operate.type='text';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='select' || columns[i].operate=='SELECT'){
                    operate.filter='=';
                    operate.form='select';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='selects' || columns[i].operate=='SELECTS'){
                    operate.filter='in';
                    operate.form='select';
                    operate.multiple=true;
                    operate.value=[];
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='checkbox' || columns[i].operate=='CHECKBOX'){
                    operate.filter='in';
                    operate.form='checkbox';
                    operate.value=[];
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='radio' || columns[i].operate=='RADIO'){
                    operate.filter='=';
                    operate.form='radio';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='find_in_set' || columns[i].operate=='FIND_IN_SET'){
                    operate.filter='FIND_IN_SET';
                    operate.form='select';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='between' || columns[i].operate=='BETWEEN'){
                    operate.filter='between';
                    operate.form='between';
                    operate.value=[];
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='not between' || columns[i].operate=='NOT BETWEEN'){
                    operate.filter='not between';
                    operate.form='between';
                    operate.value=[];
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='date' || columns[i].operate=='DATE'){
                    operate.filter='=';
                    operate.form='date-picker';
                    operate.type='date';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='datetime' || columns[i].operate=='DATETIME'){
                    operate.filter='=';
                    operate.form='date-picker';
                    operate.type='datetime';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='daterange' || columns[i].operate=='DATERANGE'){
                    operate.filter='between time';
                    operate.form='date-picker';
                    operate.type='daterange';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='time' || columns[i].operate=='TIME'){
                    operate.form='time-picker';
                    operate.filter='=';
                    operate.type='time';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='timerange' || columns[i].operate=='TIMERANGE'){
                    operate.form='time-picker';
                    operate.type='timerange';
                    operate.filter='between';
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='area' || columns[i].operate=='AREA'){
                    operate.form='cascader';
                    operate.url='ajax/area';
                    operate.level=3;
                    columns[i].operate=operate;
                }
                if(columns[i].operate=='category' || columns[i].operate=='CATEGORY'){
                    operate.form='cascader';
                    operate.url='ajax/category';
                    operate.level=2;
                    columns[i].operate=operate;
                }
                /**简写end**/
                if(typeof columns[i].operate=='object'){
                    for(let k in columns[i].operate){
                        if(typeof columns[i].operate[k]=='string'){
                            columns[i].operate[k]=columns[i].operate[k].toLowerCase();
                        }
                    }
                    if(columns[i].operate.form=='selectpage'){
                        operate.filter='=';
                    }
                    if(columns[i].operate.form=='cascader'){
                        columns[i].operate.props=Object.assign({expandTrigger:'hover',multiple:false,children:'childlist',value:'id',label:'name',lazy:false},columns[i].operate.props);
                        if(columns[i].operate.url && columns[i].operate.level){
                            columns[i].operate.props.lazy=true;
                            columns[i].operate.props.expandTrigger='click';
                            let url=columns[i].operate.url;
                            columns[i].operate.props.lazyLoad=function(node,resolve){
                                let pid=0;
                                let level=columns[i].operate.level;
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
                            delete columns[i].operate.options;
                        }
                        operate.filter='=';
                    }
                    if(columns[i].operate.form=='date-picker'){
                        if(columns[i].operate.type=='date'){
                            operate.format='YYYY-MM-DD';
                            operate.filter='=';
                        }
                        if(columns[i].operate.type=='year'){
                            operate.format='YYYY年';
                            operate.filter='=';
                        }
                        if(columns[i].operate.type=='month'){
                            operate.format='YYYY年MM月';
                            operate.filter='=';
                        }
                        if(columns[i].operate.type=='dates'){
                            operate.format='YYYY-MM-DD';
                            operate.filter='=';
                        }
                        if(columns[i].operate.type=='datetime'){
                            operate.format='YYYY-MM-DD HH:mm:ss';
                            operate.filter='=';
                        }
                        if(columns[i].operate.type=='daterange') {
                            operate.format = 'YYYY-MM-DD';
                            operate.filter='between time';
                            operate.shortcuts = [
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
                    //如果用户自定义了属性，则优先使用
                    for(let key in operate){
                        columns[i].operate[key]=(columns[i].operate[key]!==undefined)?columns[i].operate[key]:operate[key];
                    }
                }
                //通过visible隐藏数据
                if(columns[i].visible!='none'){
                    columns[i].visible=(columns[i].visible===false)?false:true;
                }
                if(columns[i].field=='operate' || columns[i].checkbox || columns[i].treeExpand){
                    if(columns[i].field=='operate' && !columns[i].direction){
                        columns[i].direction='row';
                    }
                    if(columns[i].field=='operate' && columns[i].action){
                        for(let kss in columns[i].action){
                            if(typeof columns[i].action[kss]=='object' && typeof columns[i].action[kss].method=='string'){
                                columns[i].action[kss].method=Yunqi.app[columns[i].action[kss].method];
                            }
                            if(typeof columns[i].action[kss]=='object' && !columns[i].action[kss].visible){
                                columns[i].action[kss].visible=function(){return true;};
                            }
                        }
                    }
                    continue;
                }
                //默认格式
                columns[i].formatter=(columns[i].field && (columns[i].formatter===undefined || columns[i].formatter===false))?Yunqi.formatter.text:columns[i].formatter;
            }
            Promise.all(promise).then(res=>{
                let j=0;
                let tabList=[];
                for(let i=0;i<columns.length;i++){
                    //初始化cascader
                    if(
                        columns[i].operate
                        && columns[i].operate.form=='cascader'
                        && typeof columns[i].operate.options=='string'
                        && !columns[i].operate.props.lazy
                    ){
                        columns[i].operate.options=res[j];
                        j++;
                    }
                    //初始化tabs
                    if(this.tabs && columns[i].field==this.tabs){
                        this.tabList=columns[i].searchList || [];
                    }
                }
                this.table_.columns=columns;
                this.searchValue='';
                this.currentPage=1;
                this.list=[];
                this.total=0;
                this.selections=[];
                this.dataList();
            });
        },
        dataList:function(){
            this.loading=true;
            //设置排序规则
            let sort=this.sortName;
            let order=this.order;
            if(this.sortData && this.sortData.order.startsWith('desc')){
                order='desc';
                sort=this.sortData.prop;
            }
            if(this.sortData && this.sortData.order.startsWith('asc')){
                order='asc';
                sort=this.sortData.prop;
            }
            //设置filter
            let filter=[];
            if(this.tabs && this.tabsValue){
                filter.push({
                    field:this.tabs,
                    op:'=',
                    value:this.tabsValue
                });
            }
            for(let i=0;i<this.table_.columns.length;i++){
                if(this.table_.columns[i].operate){
                    if(this.table_.columns[i].operate.value instanceof Array && this.table_.columns[i].operate.value.length===0){
                        continue;
                    }
                    if(this.table_.columns[i].operate.value==='' || this.table_.columns[i].operate.value===null || this.table_.columns[i].operate.value===undefined){
                        continue;
                    }
                    let value=this.table_.columns[i].operate.value;
                    if(value instanceof Function){
                        value=value();
                    }
                    if(this.table_.columns[i].operate.form=='cascader'){
                        value=value[value.length-1];
                    }
                    //格式化日期时间
                    if(this.table_.columns[i].operate.form=='date-picker'){
                        switch (this.table_.columns[i].operate.type){
                            case 'date':
                                value=formatDate(this.table_.columns[i].operate.value);
                                break;
                            case 'dates':
                                value=value.map(res=>{
                                    res=formatDate(res);
                                    return res;
                                });
                                break;
                            case 'year':
                                value=this.table_.columns[i].operate.value.getFullYear();
                                break;
                            case 'month':
                                value=formatDate(this.table_.columns[i].operate.value).slice(0,7);
                                break;
                            case 'daterange':
                                let begin1=formatDate(this.table_.columns[i].operate.value[0])+' 00:00:00';
                                let end1=formatDate(this.table_.columns[i].operate.value[1])+' 23:59:59';
                                value=[begin1,end1];
                                break;
                        }
                    }
                    if(this.table_.columns[i].operate.form=='time-picker'){
                        let timeValue=this.table_.columns[i].operate.value;
                        if(timeValue instanceof Array){
                            value=[formatTime(timeValue[0]),formatTime(timeValue[1])];
                        }else{
                            value=formatTime(timeValue);
                        }
                    }
                    filter.push({
                        field:this.table_.columns[i].operate.name?this.table_.columns[i].operate.name:this.table_.columns[i].field,
                        op:this.table_.columns[i].operate.filter?this.table_.columns[i].operate.filter:false,
                        value:value
                    });
                }
            }
            let json={
                sort:sort,
                order:order,
                filter:[]
            };
            //下载
            if(this.download.show){
                let field=[];
                let searchList={};
                json.listAction=this.extend.index_url;
                this.table_.columns.forEach(res=>{
                    if(inArray(this.download.field,res.field)){
                        field.push({
                            field:res.field,
                            title:res.title,
                        });
                        if(res.searchList){
                            searchList[res.field]=res.searchList;
                        }
                    }
                });
                json.field=field;
                json.searchList=searchList;
                if(this.download.page){
                    json.page=this.currentPage;
                    json.limit=this.pageSize;
                }
                if(this.download.filter){
                    json.filter=filter;
                }
                Yunqi.ajax.json(this.extend.download_url,json,true,false).then(data=>{
                    location.href=Yunqi.config.baseUrl+this.extend.download_url+'?file='+data;
                    this.loading=false;
                }).catch(error=>{
                    this.loading=false;
                });
            }else{
                json.searchValue=this.searchValue;
                json.search=this.search;
                json.filter=filter;
                json.page=this.currentPage;
                json.limit=this.pageSize;
                Yunqi.ajax.json(this.extend.index_url,json).then(data=>{
                    this.total=data.total;
                    this.render(data.rows);
                    Vue.nextTick(()=>{
                        this.onRender(this.list);
                    });
                    this.summary=data.summary;
                    this.loading=false;
                }).catch(error=>{
                    this.loading=false;
                });
            }
        },
        render:function(list){
            for(let j=0;j<list.length;j++){
                let row=list[j];
                row._formatter={};
                for(let i=0;i<this.table_.columns.length;i++){
                    if(this.table_.columns[i].field==undefined){
                        continue;
                    }
                    let value=getValue(row,this.table_.columns[i].field);
                    let formatter=copyObj(Yunqi.formatter.text);
                    if(this.table_.columns[i].searchList){
                        value=(this.table_.columns[i].searchList[value]!==undefined)?this.table_.columns[i].searchList[value]:value;
                    }
                    if(!this.table_.columns[i].formatter){
                        formatter.value=value;
                    }
                    if(this.table_.columns[i].formatter && typeof this.table_.columns[i].formatter=='function'){
                        let rx=this.table_.columns[i].formatter(value,row);
                        if(rx===undefined || rx===''){
                            rx='-';
                        }
                        if(typeof rx == 'object'){
                            formatter=copyObj(rx);
                            if(formatter._name=='button' && typeof formatter.click=='string'){
                                let clickstr=formatter.click;
                                formatter.click=function(row){
                                    Yunqi.app[clickstr](row);
                                }
                            }
                        }else{
                            formatter.value=rx;
                        }
                    }
                    if(this.table_.columns[i].formatter && typeof this.table_.columns[i].formatter=='object'){
                        formatter=copyObj(this.table_.columns[i].formatter);
                        if(formatter._name=='images'){
                            value=value?value.split(','):[];
                        }
                        if(formatter._name=='date' && typeof value=='number'){
                            value=formatDate(new Date(value*1000));
                        }
                        if(formatter._name=='datetime' && typeof value=='number'){
                            value=formatDateTime(new Date(value*1000)).slice(0,16);
                        }
                        if(formatter._name=='select'){
                            for(let k in this.table_.columns[i].searchList){
                                if(value==this.table_.columns[i].searchList[k]){
                                    value=k;
                                }
                            }
                        }
                        if(formatter._name=='tags'){
                            if(value instanceof Array){

                            }else{
                                value=value?value.split(','):[];
                            }
                            if(this.table_.columns[i].searchList){
                                value=value.map(ts=>{
                                    ts=(this.table_.columns[i].searchList[ts]!==undefined)?this.table_.columns[i].searchList[ts]:ts;
                                    return ts;
                                });
                            }
                        }
                        if(formatter._name=='switch' && this.table_.columns[i].searchList){
                            let xs=0,activeValue,inactiveValue;
                            for(let k in this.table_.columns[i].searchList){
                                if(k==='0')k=0;
                                if(k==='1')k=1;
                                if(k===0 || k===1){
                                    activeValue=1;
                                    inactiveValue=0;
                                }else if(k==='normal' || k==='hidden'){
                                    activeValue='normal';
                                    inactiveValue='hidden';
                                }else{
                                    if(xs===0){
                                        activeValue=k;
                                    }
                                    if(xs===1){
                                        inactiveValue=k;
                                    }
                                }
                                if(value==this.table_.columns[i].searchList[k]){
                                    value=k;
                                }
                                xs++;
                            }
                            formatter.activeValue=activeValue;
                            formatter.inactiveValue=inactiveValue;
                        }
                        formatter.value=value;
                    }
                    row._formatter[this.table_.columns[i].field]=formatter;
                }
            }
            this.list=list;
            if(this.treeExpandAll && !this.treeExpandAll_){
                this.expandAllTree();
            }
        },
        rowDrop:function(){
            const tbody = document.querySelector('.el-table__body-wrapper tbody');
            const _this = this;
            Sortable.create(tbody, {
                //  指定父元素下可被拖拽的子元素
                draggable: ".el-table__row",
                animation: 100,
                handle:'.sortableButton',
                ghostClass: "sortable-ghost",
                chosenClass: "sortable-chosen",
                dragClass: "sortable-drag",
                onEnd ({ newIndex, oldIndex }) {
                    let order=_this.order;
                    if(_this.sortData && _this.sortData.order.startsWith('desc')){
                        order='desc';
                    }
                    if(_this.sortData && _this.sortData.order.startsWith('asc')){
                        order='asc';
                    }
                    //权重差值
                    let weigh_new=_this.list[newIndex].weigh;
                    let weigh=weigh_new;
                    let id=_this.list[oldIndex].id;
                    let line=Math.abs(oldIndex-newIndex);
                    let data=[{id,weigh:weigh}];
                    if(order=='desc'){
                        (newIndex>oldIndex)?weigh++:weigh--;
                        let i=0;
                        while(i<line){
                            data.push({
                                id:(newIndex>oldIndex)?_this.list[newIndex-i].id:_this.list[newIndex+i].id,
                                weigh:(newIndex>oldIndex)?weigh++:weigh--
                            });
                            i++;
                        }
                    }
                    if(order=='asc'){
                        (newIndex>oldIndex)?weigh--:weigh++;
                        let i=0;
                        while(i<line){
                            data.push({
                                id:(newIndex>oldIndex)?_this.list[newIndex-i].id:_this.list[newIndex+i].id,
                                weigh:(newIndex>oldIndex)?weigh--:weigh++
                            });
                            i++;
                        }
                    }
                    const elloading=ElementPlus.ElLoading.service({text:'排序中..'});
                    const promise=data.map(res=>{
                        return new Promise((resolve, reject)=>{
                             Yunqi.ajax.post(_this.extend.multi_url,{ids:res.id,field:'weigh',value:res.weigh},false,false).then(res=>{
                                 resolve();
                             }).catch(err=>{
                                 reject();
                             });
                        });
                    });
                    Promise.all(promise).then(res=>{
                        elloading.close();
                        top.ElementPlus.ElMessage({
                            message: '排序完成',
                            type: 'success'
                        });
                        _this.reload();
                    }).catch(err=>{
                        elloading.close();
                    });
                }
            });
        },
        rowsExpand:function(row){
            let key='';
            for(let i=0;i<this.list.length;i++){
                if(this.list[i]==row){
                    key=row[this.pk];
                }
            }
            let index=-1;
            for(let i=0;i<this.expandRowKeys.length;i++){
                if(this.expandRowKeys[i]==key){
                    index=i;
                }
            }
            if(index==-1){
                row.isExpand=true;
                this.expandRowKeys.push(key);
            }else{
                row.isExpand=false;
                this.expandRowKeys.splice(index,1);
            }
        },
        tabChange:function (e){
            this.tabsValue=e;
            this.reload();
        },
        reload:function(){
            this.selections=[];
            this.dataList();
        },
        blurSearch:function(){
            this.dataList();
        },
        del:function(){
            let ids=[];
            this.selections.forEach(res=>{
                ids.push(res[this.pk]);
            });
            Yunqi.api.del(this.extend.del_url,ids,()=>{
                this.dataList();
                this.selections=[];
            });
        },
        delOne:function(row){
            Yunqi.api.del(this.extend.del_url,row[this.pk],()=>{
                this.dataList();
                this.selections=[];
            });
        },
        selectOne:function(e){
            this.selections=e;
        },
        submit:function(){
            this.currentPage=1;
            this.dataList();
        },
        selectAll:function(e){
            this.selections=e;
        },
        handleSizeChange:function(size){
            this.pageSize=size;
            this.dataList();
        },
        handleCurrentChange:function(page){
            this.currentPage=page;
            this.dataList();
        },
        changeSort:function(e){
            if(!e.order){
                this.sortData='';
            }else{
                this.sortData=e;
            }
            this.dataList();
        },
        changeVisiable:function(field){
            this.table_.columns.forEach(res=>{
                if(res.field==field){
                    res.visible=!res.visible;
                }
            });
        },
        changeShow:function(status){
            let ids=[];
            this.selections.forEach(res=>{
                ids.push(res[this.pk]);
            });
            let options={
                ids:ids,
                field:'status',
                value:status
            };
            Yunqi.api.multi(this.extend.multi_url,options,()=>{
                this.dataList();
                this.selections=[];
            });
        },
        changeSwitch:function(row,field){
            let value=row._formatter[field].value;
            setValue(row,field,value);
            let options={
                ids:row[this.pk],
                field:field,
                value:value
            };
            Yunqi.api.multi(this.extend.multi_url,options,()=>{
                this.render(this.list);
            });
        },
        changeSelect:function(row,field){
            let value=row._formatter[field].value;
            setValue(row,field,value);
            let options={
                ids:row[this.pk],
                field:field,
                value:value
            };
            Yunqi.api.multi(this.extend.multi_url,options,()=>{
                this.render(this.list);
            });
        },
        changeExpand:function () {
            this.mainFrameExpand=!this.mainFrameExpand;
            if(this.mainFrameExpand){
                Yunqi.api.expand();
            }else{
                Yunqi.api.compress();
            }
        },
        expandAllTree:function (){
            this.treeExpandAll_=!this.treeExpandAll_;
            let hide=this.treeExpandAll_?'':'hide';
            this.list.forEach(res=>{
                if(res.pid){
                    let el=document.querySelector('.row-id-'+res.id);
                    if(el){
                        el.className='row-id-'+res.id+' '+hide;
                    }
                }
            });
        },
        expandTree:function (topid){
            let ids=getTreeChildren(this.list,topid);
            let show=false;
            for(let i=0;i<ids.length;i++){
                let id=ids[i];
                let el=document.querySelector('.row-id-'+id);
                //检查第一个子项是打开还是关闭，如果是打开，就全部关闭，如果是关闭，就全部打开
                if(i===0 && inArray(el.classList,'hide')){
                    show=true;
                }
                if(show){
                    el.className='row-id-'+id;
                }else{
                    el.className='row-id-'+id+' hide';
                }
            }
        },
        rowClassName:function (e){
            if(this.isTree){
                let c='row-id-'+e.row.id;
                if(e.row.pid && !this.treeExpandAll_){
                    return c+' hide';
                }
                return c;
            }
        },
        changeSelectpage:function (r){
            for(let i=0;i<this.table_.columns.length;i++){
                if(this.table_.columns[i].field==r.field){
                    this.table_.columns[i].operate.value=r.value;
                    return;
                }
            }
        },
        clickRightToolBar:function (btn){
            if(btn=='column'){
                this.rightToolOption={type:'column',list:this.table_.columns};
            }
            if(btn=='font'){
                this.rightToolOption={type:'font',list:{large:'大',default:'中',small:'小'}};
            }
            if(btn=='download'){
                if(!this.extend.download_url){
                    Yunqi.message.error('download_url未设置');
                    return;
                }
                this.download.show=true;
            }
        },
        changeFont:function (key){
            this.pageFont=key;
            this.$refs.rightToolSelect.visible=false
            this.table_.searchFormVisible=!this.table_.searchFormVisible;
            setTimeout(()=>{
                this.table_.searchFormVisible=!this.table_.searchFormVisible;
            },50);
        },
        recyclebin:function (){
            if(this.extend.recyclebin_url==undefined){
                Yunqi.message.error(__('recyclebin_url未设置'));
                return;
            }
            let table={width:'80%',height:690,title:__('回收站'),url:this.extend.recyclebin_url+'?action=list',icon:'fa fa-recycle'};
            Yunqi.api.open(table);
        },
        add:function () {
            if(this.extend.add_url==undefined){
                Yunqi.message.error(__('add_url未设置'));
                return;
            }
            let form={...this.addForm,title:__('添加'),url:this.extend.add_url,icon:'fa fa-plus'};
            if(form.expand==undefined){
                form.expand=false;
            }
            form.close=function (refresh=false){
                if(!refresh){
                    return
                }
                let id=top.Yunqi.app.activeMenu.id;
                let tab=top.document.getElementById('addtabs-'+id).contentWindow;
                let doc=tab.document.getElementsByClassName('refresh');
                if(doc.length>0){
                    doc[0].click();
                }
            };
            Yunqi.api.open(form);
        },
        edit:function (row) {
            if(this.extend.edit_url==undefined){
                Yunqi.message.error(__('edit_url未设置'));
                return;
            }
            let form={...this.editForm,title:__('编辑'),icon:'fa fa-pencil-square-o'};
            if(form.expand==undefined){
                form.expand=false;
            }
            let ids=[];
            if(row){
                ids.push(row[this.pk]);
            }else{
                this.selections.forEach(res=>{
                    ids.push(res[this.pk]);
                });
            }
            let time=0;
            ids.forEach(res=>{
                setTimeout(()=>{
                    form.url=(this.extend.edit_url.indexOf('?')!=-1)?this.extend.edit_url+'&ids='+res:this.extend.edit_url+'?ids='+res,
                    form.close=function (refresh=false){
                        if(!refresh){
                            return;
                        }
                        let id=top.Yunqi.app.activeMenu.id;
                        let tab=top.document.getElementById('addtabs-'+id).contentWindow;
                        let doc=tab.document.getElementsByClassName('refresh');
                        if(doc.length>0){
                            doc[0].click();
                        }
                    };
                    Yunqi.api.open(form);
                },time);
                time+=100;
            });
        },
        previewImg(imgs){
            Yunqi.api.previewImg(imgs);
        },
        importExcel:function (){
            document.querySelector('.importUpload button').click();
        },
        handleImportSuccess:function (e){
            let file=e.data.url;
            if(!this.extend.import_url){
                Yunqi.message.error('import_url未设置');
                return;
            }
            Yunqi.ajax.post(this.extend.import_url,{file:file}).then(res=>{
                this.reload();
            });
        }
    }
};