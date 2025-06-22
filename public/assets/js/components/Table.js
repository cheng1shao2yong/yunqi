import {formatDate, formatDateTime, copyObj, inArray, formatTime} from '../util.js';
import selectpage from '../components/SelectPage.js';
import tableTemp from './template/TableTemp.js';
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

export default {
    name: "Table",
    components:{'SelectPage':selectpage},
    data: function () {
        return {
            menutype:Yunqi.app.window.menutype,
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
            tabList:{},
            tabsValue:'',
            rightToolOption:{type:'font',list:{large:'大',default:'中',small:'小'}},
            pageFont:'default',
            download:{
                show:false,
                field:[],
                filter:1,
                page:0,
            },
            importResult:{
                show:false,
                success:0,
                fail:[]
            }
        }
    },
    template:tableTemp,
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
        multiHeader:{
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
                height:550
            }
        },
        editForm:{
            type:Object,
            default:{
                icon:'fa fa-pencil-square-o',
                title:__('编辑'),
                expand:false,
                width:800,
                height:550
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
    methods:{
        reset:function(){
            let columns=copyObj(this.columns);
            for(let i=0;i<columns.length;i++){
                if(this.isTree && i===1){
                    columns[i].type='';
                }
                if(columns[i].children){
                    columns[i].visible=true;
                    for(let j=0;j<columns[i].children.length;j++){
                        if(columns[i].children[j].children){
                            columns[i].children[j].visible=true;
                            for (let k=0;k<columns[i].children[j].children.length;k++){
                                columns[i].children[j].children[k]=this.formatColumn(columns[i].children[j].children[k]);
                            }
                        }else{
                            columns[i].children[j]=this.formatColumn(columns[i].children[j]);
                        }
                    }
                }else{
                    columns[i]=this.formatColumn(columns[i]);
                }
            }
            this.table_.columns=columns;
            this.searchValue='';
            this.currentPage=1;
            this.list=[];
            this.total=0;
            this.selections=[];
            this.dataList();
        },
        formatColumn:function (column){
            let operate={form:'input',value:'',size:'default',placeholder:column.title};
            /**简写begin**/
            if((column.field && column.operate==undefined) || column.operate=='='){
                operate.filter='=';
                operate.type='text';
                column.operate=operate;
            }
            if(column.operate=='!=' || column.operate=='<>'){
                operate.filter='<>';
                operate.type='text';
                column.operate=operate;
            }
            if(column.operate=='null' || column.operate=='NULL'){
                operate.filter='IS NULL';
                operate.form='hidden';
                column.operate=operate;
            }
            if(column.operate=='not null' || column.operate=='NOT NULL'){
                operate.filter='IS NOT NULL';
                operate.form='hidden';
                column.operate=operate;
            }
            if(column.operate=='like' || column.operate=='LIKE'){
                operate.filter='LIKE';
                operate.type='text';
                column.operate=operate;
            }
            if(column.operate=='not like' || column.operate=='NOT LIKE'){
                operate.filter='NOT LIKE';
                operate.type='text';
                column.operate=operate;
            }
            if(column.operate=='select' || column.operate=='SELECT'){
                operate.filter='=';
                operate.form='select';
                column.operate=operate;
            }
            if(column.operate=='selects' || column.operate=='SELECTS'){
                operate.filter='in';
                operate.form='select';
                operate.multiple=true;
                operate.value=[];
                column.operate=operate;
            }
            if(column.operate=='checkbox' || column.operate=='CHECKBOX'){
                operate.filter='in';
                operate.form='checkbox';
                operate.value=[];
                column.operate=operate;
            }
            if(column.operate=='radio' || column.operate=='RADIO'){
                operate.filter='=';
                operate.form='radio';
                column.operate=operate;
            }
            if(column.operate=='find_in_set' || column.operate=='FIND_IN_SET'){
                operate.filter='FIND_IN_SET';
                operate.form='select';
                column.operate=operate;
            }
            if(column.operate=='between' || column.operate=='BETWEEN'){
                operate.filter='between';
                operate.form='between';
                operate.value=[];
                column.operate=operate;
            }
            if(column.operate=='not between' || column.operate=='NOT BETWEEN'){
                operate.filter='not between';
                operate.form='between';
                operate.value=[];
                column.operate=operate;
            }
            if(column.operate=='date' || column.operate=='DATE'){
                operate.filter='=';
                operate.form='date-picker';
                operate.type='date';
                column.operate=operate;
            }
            if(column.operate=='datetime' || column.operate=='DATETIME'){
                operate.filter='=';
                operate.form='date-picker';
                operate.type='datetime';
                column.operate=operate;
            }
            if(column.operate=='daterange' || column.operate=='DATERANGE'){
                operate.filter='between time';
                operate.form='date-picker';
                operate.type='daterange';
                column.operate=operate;
            }
            if(column.operate=='time' || column.operate=='TIME'){
                operate.form='time-picker';
                operate.filter='=';
                operate.type='time';
                column.operate=operate;
            }
            if(column.operate=='timerange' || column.operate=='TIMERANGE'){
                operate.form='time-picker';
                operate.type='timerange';
                operate.filter='between';
                column.operate=operate;
            }
            if(column.operate=='area' || column.operate=='AREA'){
                operate.form='cascader';
                operate.url='ajax/area';
                operate.level=3;
                column.operate=operate;
            }
            if(column.operate=='category' || column.operate=='CATEGORY'){
                operate.form='cascader';
                operate.url='ajax/category';
                operate.level=2;
                column.operate=operate;
            }
            /**简写end**/
            if(typeof column.operate=='object'){
                for(let k in column.operate){
                    if(typeof column.operate[k]=='string'){
                        column.operate[k]=column.operate[k].toLowerCase();
                    }
                }
                if(column.operate.form=='selectpage'){
                    operate.filter='=';
                }
                if(column.operate.form=='cascader'){
                    column.operate.props=Object.assign({expandTrigger:'hover',multiple:false,children:'childlist',value:'id',label:'name',lazy:false},column.operate.props);
                    if(column.operate.url && column.operate.level){
                        column.operate.props.lazy=true;
                        column.operate.props.expandTrigger='click';
                        let url=column.operate.url;
                        column.operate.props.lazyLoad=function(node,resolve){
                            let pid=0;
                            let level=column.operate.level;
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
                        delete column.operate.options;
                    }
                    operate.filter='=';
                }
                if(column.operate.form=='date-picker'){
                    if(column.operate.type=='date'){
                        operate.format='YYYY-MM-DD';
                        operate.filter='=';
                    }
                    if(column.operate.type=='year'){
                        operate.format='YYYY年';
                        operate.filter='=';
                    }
                    if(column.operate.type=='month'){
                        operate.format='YYYY年MM月';
                        operate.filter='=';
                    }
                    if(column.operate.type=='dates'){
                        operate.format='YYYY-MM-DD';
                        operate.filter='=';
                    }
                    if(column.operate.type=='datetime'){
                        operate.format='YYYY-MM-DD HH:mm:ss';
                        operate.filter='=';
                    }
                    if(column.operate.type=='daterange') {
                        operate.format = 'YYYY-MM-DD';
                        operate.filter='between time';
                        operate.shortcuts = [
                            {
                                text: '今天', value: function () {
                                    const start = new Date();
                                    return [start, start];
                                }
                            },
                            {
                                text: '昨天', value: function () {
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
                                    return [start, start];
                                }
                            },
                            {
                                text: '最近7天', value: function () {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
                                    return [start, end];
                                }
                            },
                            {
                                text: '最近30天', value: function () {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
                                    return [start, end];
                                }
                            },
                            {
                                text: '本月', value: function () {
                                    const end = new Date();
                                    const start = new Date(formatDate(end).slice(0, 7) + '-01');
                                    return [start, end];
                                }
                            },
                            {
                                text: '上月', value: function () {
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
                                }
                            },
                            {
                                text: '今年', value: function () {
                                    let currentDate = new Date();
                                    let year = currentDate.getFullYear();
                                    let start = new Date(year, 0, 1);
                                    let end = new Date(year, 11, 31);
                                    return [start, end];
                                }
                            },
                            {
                                text: '去年', value: function () {
                                    let currentDate = new Date();
                                    let year = currentDate.getFullYear() - 1;
                                    let start = new Date(year, 0, 1);
                                    let end = new Date(year, 11, 31);
                                    return [start, end];
                                }
                            },
                        ];
                    }
                }
                //如果用户自定义了属性，则优先使用
                for(let key in operate){
                    column.operate[key]=(column.operate[key]!==undefined)?column.operate[key]:operate[key];
                }
            }
            //通过visible隐藏数据
            if(column.visible!='none'){
                column.visible=(column.visible===false)?false:true;
            }
            if(column.field=='operate' || column.checkbox || column.treeExpand){
                if(column.field=='operate' && !column.direction){
                    column.direction='row';
                }
                if(column.field=='operate' && !column.align){
                    column.align='center';
                }
                if(column.field=='operate' && column.action){
                    for(let kss in column.action){
                        if(typeof column.action[kss]=='object' && typeof column.action[kss].method=='string'){
                            column.action[kss].method=Yunqi.app[column.action[kss].method];
                        }
                        if(typeof column.action[kss]=='object' && !column.action[kss].visible){
                            column.action[kss].visible=function(){return true;};
                        }
                    }
                }
                return column;
            }
            //默认格式
            column.formatter=(column.field && (column.formatter===undefined || column.formatter===false))?Yunqi.formatter.text:column.formatter;
            //初始化tabs
            if(this.tabs && column.field==this.tabs){
                this.tabList=column.searchList || {};
            }
            return column;
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
                json.isTree=this.isTree;
                if(this.download.page){
                    json.page=this.currentPage;
                    json.limit=this.pageSize;
                }else{
                    json.page=1;
                    json.limit=100000;
                }
                if(this.download.filter){
                    json.filter=filter;
                }
                Yunqi.ajax.json(this.extend.download_url,json,true,false).then(data=>{
                    let url=Yunqi.config.baseUrl+this.extend.download_url;
                    if(url.indexOf('?')!=-1){
                        url+='&file='+data;
                    }else{
                        url+='?file='+data;
                    }
                    location.href=url;
                    this.loading=false;
                    this.download.show=false;
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
                this.formatRow(row);
                if(row.childlist){
                    this.render(row.childlist);
                }
            }
            this.list=list;
        },
        formatRow:function (row){
            row._formatter={};
            for(let i=0;i<this.table_.columns.length;i++){
                let columns1=this.table_.columns[i];
                if(columns1.children){
                    for(let j=0;j<columns1.children.length;j++){
                        let columns2=this.table_.columns[i].children[j];
                        if(columns2.children){
                            for(let k=0;k<columns2.children.length;k++){
                                let columns3=columns2.children[k];
                                if(columns3.field===undefined){
                                    continue;
                                }
                                let formatter=this.getFormatter(row,columns3);
                                row._formatter[columns3.field]=formatter;
                            }
                        }else{
                            if(columns2.field===undefined){
                                continue;
                            }
                            let formatter=this.getFormatter(row,columns2);
                            row._formatter[columns2.field]=formatter;
                        }
                    }
                }else{
                    if(columns1.field===undefined){
                        continue;
                    }
                    let formatter=this.getFormatter(row,columns1);
                    row._formatter[columns1.field]=formatter;
                }
            }
        },
        getFormatter:function (row,columns){
            let value=getValue(row,columns.field);
            let formatter=copyObj(Yunqi.formatter.text);
            if(columns.searchList){
                value=(columns.searchList[value]!==undefined)?columns.searchList[value]:value;
            }
            if(columns.field=='operate'){
                return true;
            }
            if(!columns.formatter){
                formatter.value=value;
            }
            if(columns.formatter && typeof columns.formatter=='function'){
                let rx=columns.formatter(value,row);
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
            if(columns.formatter && typeof columns.formatter=='object'){
                formatter=copyObj(columns.formatter);
                if(formatter._name=='images'){
                    value=value?value.split(','):[];
                }
                if(formatter._name=='date' && typeof value=='number'){
                    value=formatDate(new Date(value*1000));
                }
                if(formatter._name=='datetime'){
                    if(typeof value=='number'){
                        value=formatDateTime(new Date(value*1000)).slice(0,16);
                    }else if(!value){
                        value='-';
                    }
                }
                if(formatter._name=='select'){
                    for(let k in columns.searchList){
                        if(value==columns.searchList[k]){
                            value=k;
                        }
                    }
                }
                if(formatter._name=='tags'){
                    if(value instanceof Array){

                    }else{
                        value=value?value.split(','):[];
                    }
                    if(columns.searchList){
                        value=value.map(ts=>{
                            ts=(columns.searchList[ts]!==undefined)?columns.searchList[ts]:ts;
                            return ts;
                        });
                    }
                }
                if(formatter._name=='switch' && columns.searchList){
                    let xs=0,activeValue,inactiveValue;
                    for(let k in columns.searchList){
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
                        if(value==columns.searchList[k]){
                            value=k;
                        }
                        xs++;
                    }
                    formatter.activeValue=activeValue;
                    formatter.inactiveValue=inactiveValue;
                }
                formatter.value=value;
            }
            return formatter;
        },
        rowDrop:function(){
            const _this = this;
            const tbody = document.querySelector('.el-table__body-wrapper tbody');
            class TreeClass{
                constructor(index) {
                    this.index = index;
                    this.j = 0;
                    this.arr=[];
                }
                getItem(list) {
                    for(let i=0;i<list.length;i++){
                        if(this.j===this.index){
                            return list[i];
                        }
                        this.j++;
                        if(list[i].childlist && list[i].childlist.length>0){
                            let item = this.getItem(list[i].childlist);
                            if(item){
                                return item;
                            }
                        }
                    }
                    return false;
                }
                getList(list,pid){
                    for(let i=0;i<list.length;i++){
                        if(list[i].pid==pid){
                            this.arr.push(list[i]);
                        }
                        if(list[i].childlist && list[i].childlist.length>0){
                            this.getList(list[i].childlist,pid);
                        }
                    }
                    return this.arr;
                }
            };
            Sortable.create(tbody, {
                //  指定父元素下可被拖拽的子元素
                draggable: ".el-table__row",
                animation: 100,
                handle:'.sortableButton',
                ghostClass: "sortable-ghost",
                chosenClass: "sortable-chosen",
                dragClass: "sortable-drag",
                onEnd ({ newIndex, oldIndex }) {
                    let data=[];
                    if(_this.isTree){
                        let new_item=(new TreeClass(newIndex)).getItem(_this.list);
                        let old_item=(new TreeClass(oldIndex)).getItem(_this.list);
                        if(new_item.weigh===undefined || old_item.weigh===undefined){
                            Yunqi.message.error(__('没有weigh属性，排序失败'));
                            return;
                        }
                        if(new_item.pid!==old_item.pid){
                            Yunqi.message.error(__('只支持在同级别表内拖拽'));
                            return;
                        }
                        //找到影响拖拽的其他行，并修改weigh属性
                        let list=(new TreeClass(oldIndex)).getList(_this.list,old_item.pid);
                        let weigh=new_item.weigh;
                        data.push({id:old_item.id,weigh:weigh});
                        //从上往下拖
                        if(newIndex>oldIndex){
                            for(let i=list.length-1;i>=0;i--){
                                if(list[i].id==old_item.id){
                                    break;
                                }
                                if(list[i].weigh<new_item.weigh){
                                    continue;
                                }
                                if(list[i].weigh<=old_item.weigh){
                                    data.push({
                                        id:list[i].id,
                                        weigh:list[i].weigh+1
                                    });
                                }
                            }
                        }
                        //从下往上拖
                        if(newIndex<oldIndex){
                            for(let i=0;i<list.length;i++){
                                if(list[i].id==old_item.id){
                                    break;
                                }
                                if(list[i].weigh<=new_item.weigh){
                                    data.push({
                                        id:list[i].id,
                                        weigh:list[i].weigh-1
                                    });
                                }
                            }
                        }
                    }else{
                        let new_weigh=_this.list[newIndex].weigh;
                        let old_weigh=_this.list[oldIndex].weigh;
                        if(new_weigh===undefined || old_weigh===undefined){
                            Yunqi.message.error(__('没有weigh属性，排序失败'));
                            return;
                        }
                        data.push({id:_this.list[oldIndex].id,weigh:new_weigh});
                        let line=Math.abs(oldIndex-newIndex);
                        let weigh=_this.list[newIndex].weigh;
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
            let columns=this.table_.columns;
            for(let i=0;i<columns.length;i++){
                if(columns[i].children){
                    let show1=false;
                    for(let j=0;j<columns[i].children.length;j++){
                        if(columns[i].children[j].children){
                            let show2=false;
                            for (let k=0;k<columns[i].children[j].children.length;k++){
                                if(columns[i].children[j].children[k].field==field){
                                    columns[i].children[j].children[k].visible=!columns[i].children[j].children[k].visible;
                                }
                                show2=show2 || columns[i].children[j].children[k].visible;
                            }
                            columns[i].children[j].visible=show2;
                        }else{
                            if(columns[i].children[j].field==field){
                                columns[i].children[j].visible=!columns[i].children[j].visible;
                            }
                        }
                        show1=show1 || columns[i].children[j].visible;
                    }
                    columns[i].visible=show1;
                }else{
                    if(columns[i].field==field){
                        columns[i].visible=!columns[i].visible;
                    }
                }
            }
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
                let show=[];
                let columns=this.table_.columns;
                for(let i=0;i<columns.length;i++){
                    if(columns[i].children){
                        for(let j=0;j<columns[i].children.length;j++){
                            if(columns[i].children[j].children){
                                for (let k=0;k<columns[i].children[j].children.length;k++){
                                    show.push(columns[i].children[j].children[k]);
                                }
                            }else{
                                show.push(columns[i].children[j]);
                            }
                        }
                    }else{
                        show.push(columns[i]);
                    }
                }
                this.rightToolOption={type:'column',list:show};
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
        clickLink:function (str,triger='copy'){
            if(triger=='redict'){
                window.open(str,'_blank');
            }
            if(triger=='copy'){
                navigator.clipboard.writeText(str);
                Yunqi.message.success('复制成功');
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
            let table={
                width:'80%',
                height:690,
                title:__('回收站'),
                url:this.extend.recyclebin_url+'?action=list',
                icon:'fa fa-recycle',
                close:function (){
                    let id=top.Yunqi.app.activeTab.id;
                    let tab=top.document.getElementById('addtabs-'+id).contentWindow;
                    let doc=tab.document.getElementsByClassName('refresh');
                    if(doc.length>0){
                        doc[0].click();
                    }
                }
            };
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
                let id=top.Yunqi.app.activeTab.id;
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
                        let id=top.Yunqi.app.activeTab.id;
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
                this.importResult.success=res.success;
                this.importResult.fail=res.fail;
                this.importResult.show=true;
                this.reload();
            });
        }
    }
};