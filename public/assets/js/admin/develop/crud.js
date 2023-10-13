import selectpage from "../../components/SelectPage.js";
import fieldlist from '../../components/Fieldlist.js';
import checkicon from "../../components/CheckIcon.js";
import {inArray} from "../../util.js";
function isImage(name)
{
    if(
        name.indexOf('imgs')!=-1 ||
        name.indexOf('images')!=-1 ||
        name.indexOf('logos')!=-1 ||
        name.indexOf('photos')!=-1 ||
        name.indexOf('pictures')!=-1 ||
        name.indexOf('icons')!=-1
    ){
        return 'images';
    }
    if(
        name.indexOf('img')!=-1 ||
        name.indexOf('image')!=-1 ||
        name.indexOf('logo')!=-1 ||
        name.indexOf('photo')!=-1 ||
        name.indexOf('picture')!=-1 ||
        name.indexOf('icon')!=-1
    ){
        return 'image';
    }
    return false;
}
function getAccept()
{
    let mimetype=Yunqi.config.upload.mimetype.split(',');
    let accept=[];
    mimetype.forEach(res=>{
        accept.push('.'+res);
    });
    accept=accept.join(',');
    return accept;
}
function parseShort(data){
    let short=data.short;
    switch (short){
        case '=':
            data.form='input';
            data.type='text';
            data.filter='=';
            break;
        case '<>':
            data.form='input';
            data.type='text';
            data.filter='<>';
            break;
        case 'like':
            data.form='input';
            data.type='text';
            data.filter='LIKE';
            break;
        case 'not like':
            data.form='input';
            data.type='text';
            data.filter='NOT LIKE';
            break;
        case 'null':
            data.form='hidden';
            data.filter='IS NULL';
            break;
        case 'not null':
            data.form='hidden';
            data.filter='IS NOT NULL';
            break;
        case 'select':
            data.form='select';
            data.filter='=';
            break;
        case 'selects':
            data.form='select';
            data.filter='IN';
            data.multiple=1;
            data.value='[]';
            break;
        case 'checkbox':
            data.form='checkbox';
            data.filter='IN';
            data.value='[]';
            break;
        case 'radio':
            data.form='radio';
            data.filter='=';
            break;
        case 'find_in_set':
            data.form='select';
            data.filter='FIND_IN_SET';
            break;
        case 'between':
            data.form='between';
            data.filter='BETWEEN';
            data.value='[]';
            break;
        case 'not between':
            data.form='between';
            data.filter='NOT BETWEEN';
            data.value='[]';
            break;
        case 'date':
            data.form='date-picker';
            data.type='date';
            data.filter='=';
            break;
        case 'datetime':
            data.form='date-picker';
            data.type='datetime';
            data.filter='=';
            break;
        case 'daterange':
            data.form='date-picker';
            data.type='daterange';
            data.filter='BETWEEN TIME';
            break;
        case 'time':
            data.form='time-picker';
            data.type='time';
            data.filter='=';
            break;
        case 'timerange':
            data.form='time-picker';
            data.type='timerange';
            data.filter='BETWEEN';
            break;
        case 'selectpage':
            data.form='selectpage';
            data.filter='=';
            data.keyField='id';
            data.labelField='name';
            data.url='';
            break;
        case 'cascader':
            data.form='cascader';
            data.filter='=';
            data.cascaderType='url';
            data.level=2;
            data.url='';
            break;
        case 'area':
            data.form='cascader';
            data.filter='=';
            data.cascaderType='url';
            data.level=3;
            data.url='ajax/area';
            break;
        case 'category':
            data.form='cascader';
            data.filter='=';
            data.cascaderType='url';
            data.level=2;
            data.url='ajax/category';
            break;
        case 'hidden':
            data.form='input';
            data.type='hidden';
            break;
        case 'text':
            data.form='input';
            data.type='text';
            break;
        case 'password':
            data.form='input';
            data.type='password';
            break;
        case 'readonly':
            data.form='input';
            data.type='text';
            data.readonly=1;
            break;
        case 'number':
            data.form='input';
            data.type='number';
            break;
        case 'textarea':
            data.form='input';
            data.type='textarea';
            data.rows=4;
            break;
        case 'editor':
            data.form='editor';
            data.width='100%';
            data.height='350px';
            break;
        case 'switch':
            data.form='switch';
            break;
        case 'image':
            data.form='attachment';
            data.limit=1;
            break;
        case 'images':
            data.form='attachment';
            data.limit=10;
            break;
        case 'file':
            data.form='files';
            data.limit=1;
            break;
        case 'files':
            data.form='files';
            data.limit=10;
            break;
        case 'fieldlist':
            data.form='fieldlist';
            data.label=['键名','键值'];
            data.value='{}';
            break;
        case 'slot':
            data.form='slot';
            break;
    }
}
export default{
    components:{'SelectPage':selectpage,'CheckIcon':checkicon,'FieldList':fieldlist},
    data:{
        fields:[],
        actions:[],
        operateDialog:{
            show:false,
            row:'',
            filter:[],
            searchList: '',
            data:''
        },
        searchListDialog:{
            show: false,
            row: '',
            searchList: ''
        },
        relationDialog:{
            show: false,
            row: '',
            fields:[],
            data:{
                table:'',
                relationField:'',
                filterField:'',
                showField:'',
                ralationType:'one'
            }
        },
        formDialog:{
            show:false,
            row:'',
            searchList: '',
            data:''
        },
        codeDialog:{
            show:false,
            row:[],
        },
        formatter:{
            text:__('文本'),
            image:__('图片'),
            images:__('多图'),
            date:__('日期'),
            datetime:__('日期时间'),
            tag:__('标签'),
            tags:__('多标签'),
            switch:__('开关'),
            select:__('下拉框'),
            link:__('链接'),
            html:__('HTML'),
            slot:__('自定义插槽'),
        },
        short:{
            table:[
                {key:'=',label:__('单行文本框，field等于输入值')},
                {key:'<>',label:__('单行文本框，field不等于输入值')},
                {key:'like',label:__('单行文本框，field文本包含输入值')},
                {key:'not like',label:__('单行文本框，field文本不包含输入值')},
                {key:'null',label:__('隐藏过滤器，field字段为空值')},
                {key:'not null',label:__('隐藏过滤器，field字段为非空值')},
                {key:'select',label:__('下拉框(单选)，field等于选项')},
                {key:'selects',label:__('下拉框(多选)，field包含于选项,如2包含于[1,2,3]')},
                {key:'checkbox',label:__('多选输入框，field包含于选项,,如2包含于[1,2,3]')},
                {key:'radio',label:__('单选输入框，field等于选项')},
                {key:'find_in_set',label:__('下拉框(单选)，field文本包含选项，如“1,2,3”包含2')},
                {key:'between',label:__('并排输入框，field介于两个数字之间')},
                {key:'not between',label:__('并排输入框，field介于两个数字之外')},
                {key:'date',label:__('日期选择框，field等于选项')},
                {key:'datetime',label:__('日期+时间选择框，field等于选项')},
                {key:'daterange',label:__('日期区间选择框，field介于两个日期之间')},
                {key:'time',label:__('时间选择框，field等于选项')},
                {key:'timerange',label:__('时间区间选择框，field介于两个时间之间')},
                {key:'selectpage',label:__('关联表分页选择框，field等于表的keyField')},
                {key:'cascader',label:__('多级树形选择框，field等于最后一级的id')},
                {key:'area',label:__('省/市/区县选择框，field等于最后一级的id')},
                {key:'category',label:__('分类表category选择框，field等于最后一级的id')}
            ],
            form:[
                {key:'hidden',label:__('隐藏表单')},
                {key:'text',label:__('单行文本输入框')},
                {key:'number',label:__('数字输入框')},
                {key:'readonly',label:__('单行只读文本输入框')},
                {key:'password',label:__('密码输入框')},
                {key:'textarea',label:__('多行文本输入框')},
                {key:'editor',label:__('富文本输入框')},
                {key:'select',label:__('下拉框(单选)')},
                {key:'selects',label:__('下拉框(多选)')},
                {key:'radio',label:__('单选框')},
                {key:'checkbox',label:__('复选框')},
                {key:'switch',label:__('开关')},
                {key:'date',label:__('选择日期')},
                {key:'datetime',label:__('选择日期+时间')},
                {key:'daterange',label:__('选择日期区间')},
                {key:'time',label:__('选择时间')},
                {key:'timerange',label:__('选择时间区间')},
                {key:'selectpage',label:__('关联表分页选择框')},
                {key:'cascader',label:__('多级树形选择框')},
                {key:'image',label:__('选择单张图片')},
                {key:'images',label:__('选择多张图片')},
                {key:'file',label:__('选择单个文件')},
                {key:'files',label:__('选择多个文件')},
                {key:'fieldlist',label:__('JSON输入框')},
                {key:'area',label:__('选择省/市/区县')},
                {key:'category',label:__('分类表category选择框')},
                {key:'slot',label:__('自定义插槽')},
            ]
        },
        formtype:{
            table:[
                {key:'hidden',label:__('隐藏表单')},
                {key:'input',label:__('文本输入框')},
                {key:'select',label:__('下拉框')},
                {key:'radio',label:__('单选框')},
                {key:'checkbox',label:__('复选框')},
                {key:'between',label:__('并排输入框')},
                {key:'date-picker',label:__('日期选择框')},
                {key:'time-picker',label:__('时间选择框')},
                {key:'cascader',label:__('多级树形选择框')},
                {key:'selectpage',label:__('关联表分页选择框')},
            ],
            form:[
                {key:'input',label:__('文本输入框')},
                {key:'select',label:__('下拉框')},
                {key:'radio',label:__('单选框')},
                {key:'checkbox',label:__('复选框')},
                {key:'editor',label:__('富文本输入框')},
                {key:'switch',label:__('开关')},
                {key:'date-picker',label:__('日期选择框')},
                {key:'time-picker',label:__('时间选择框')},
                {key:'cascader',label:__('多级树形选择框')},
                {key:'selectpage',label:__('关联表分页选择框')},
                {key:'attachment',label:__('相册')},
                {key:'files',label:__('上传文件')},
                {key:'fieldlist',label:__('输入JSON')},
                {key:'slot',label:__('自定义插槽')},
            ]
        },
        filter:[
            {key:'=',label:__('等于')},
            {key:'<>',label:__('不等于')},
            {key:'>',label:__('大于')},
            {key:'>=',label:__('大于等于')},
            {key:'<',label:__('小于')},
            {key:'<=',label:__('小于等于')},
            {key:'< TIME',label:__('早于')},
            {key:'<= TIME',label:__('早于等于')},
            {key:'> TIME',label:__('晚于')},
            {key:'>= TIME',label:__('晚于等于')},
            {key:'BETWEEN TIME',label:__('时间介于')},
            {key:'NOT BETWEEN TIME',label:__('时间不介于')},
            {key:'LIKE',label:__('包含字符')},
            {key:'NOT LIKE',label:__('不包含字符')},
            {key:'FIND_IN_SET',label:__('序列包含')},
            {key:'NOT FIND_IN_SET',label:__('序列不包含')},
            {key:'IN',label:__('包含于数组')},
            {key:'NOT IN',label:__('不包含于数组')},
            {key:'BETWEEN',label:__('介于')},
            {key:'NOT BETWEEN',label:__('不介于')},
            {key:'IS NULL',label:__('为空')},
            {key:'IS NOT NULL',label:__('不为空')},
        ],
        tableData:'',
        crudForm:{
            table:'',
            controller:'',
            model:'',
            reduced:false,
            isTree:false,
            treeTitle:'',
            pagination:false,
            summary:false,
            expand:false,
            tabs:'',
            menu:{
                pid:'0',
                title:'菜单名称',
                icon:'fa fa-th-large',
                action:'index',
                menutype:'addtabs'
            },
            actionList:'',
            recyclebin:false
        }
    },
    methods:{
        inArray:inArray,
        havaPid:function (){
            if(!this.tableData){
                return false;
            }
            for(let k in this.tableData){
                if(this.tableData[k].field=='pid'){
                    return true;
                }
            }
            return false;
        },
        changeTable:function (table){
            this.crudForm.table=table;
            Yunqi.ajax.get('develop/getFields',{table:table}).then(res=>{
                this.fields=res;
                this.parseAction();
                this.parseController();
                this.parseModel();
                this.parseTable();
            });
        },
        parseTable:function (){
            this.tableData='';
            let list=[];
            for(let k in this.fields){
                let item=this.fields[k];
                let obj={
                    field:item.name,
                    title:this.parseTitle(item),
                    type:item.type,
                    visible:this.parseVisible(item),
                    formatter:this.parseFormatter(item),
                    operate:'',
                    searchList:'',
                    relation:'',
                    sortable:[],
                    search:[],
                    edit:'',
                    rules:'',
                    recyclebin:[]
                };
                this.parseFields(obj);
                list.push(obj);
            }
            Vue.nextTick(()=>{
                this.tableData=list;
            });
        },
        parseTitle:function (row){
            if(row.title){
                return row.title;
            }
            if(row.name=='deletetime'){
                return __('删除时间');
            }
            if(row.name=='createtime'){
                return __('创建时间');
            }
            if(row.name=='updatetime'){
                return __('修改时间');
            }
            if(row.name=='pid'){
                return __('父级');
            }
            if(row.name=='status'){
                return __('状态');
            }
            if(row.name=='id'){
                return __('ID');
            }
            if(row.name=='weigh'){
                return __('权重');
            }
            return row.name;
        },
        parseController:function (){
            let table=this.crudForm.table.replace(Yunqi.data.tablePrefix,'');
            table=table.replace(table[0],table[0].toUpperCase());
            table=table.replace(/_([a-z])/g,function (all,letter){
                return letter.toUpperCase();
            });
            this.crudForm.controller='app\\admin\\controller\\'+table;
        },
        parseModel:function (){
            let table=this.crudForm.table.replace(Yunqi.data.tablePrefix,'');
            table=table.replace(table[0],table[0].toUpperCase());
            table=table.replace(/_([a-z])/g,function (all,letter){
                return letter.toUpperCase();
            });
            this.crudForm.model='app\\common\\model\\'+table;
        },
        parseAction:function (){
            this.crudForm.actionList='';
            let list={index:__('查看'),add:__('添加'),edit:__('编辑'),multi:__('更新'),del:__('删除'),import:__('导入'),download:__('下载')};
            for(let k in this.fields){
                let item=this.fields[k];
                if(item.name=='deletetime'){
                    list.recyclebin=__('回收站');
                    this.crudForm.recyclebin=true;
                }
            }
            Vue.nextTick(()=>{
                this.crudForm.actionList=list;
            });
        },
        parseFormatter:function (row){
            if(row.name.endsWith('time')){
                return 'datetime';
            }
            let image=isImage(row.name);
            if(image){
                return image;
            }
            if(row.name=='status'){
                return 'switch';
            }
            if(row.type=='tinyint'){
                return 'select';
            }
            return 'text';
        },
        parseVisible:function (row){
            if(row.name=='deletetime'){
                return 'none';
            }
            if(row.name=='updatetime'){
                return false;
            }
            return true;
        },
        parseFields:function (obj){
            obj.operate=this.parseOperate(obj);
            obj.searchList=this.parseSearchList(obj);
            obj.edit=this.parseEdit(obj);
            obj.rules=this.parseRules(obj);
        },
        parseEdit:function (row){
            if(row.field=='id'){
                return 'hidden';
            }
            if(row.field=='pid'){
                return 'slot';
            }
            if(row.field=='createtime' || row.field=='updatetime' || row.field=='deletetime'){
                return '';
            }
            let image=isImage(row.field);
            if(image){
                return image;
            }
            if(row.field=='status'){
                return 'switch';
            }
            if(row.searchList){
                return 'select';
            }
            if(row.type=='tinyint' || row.type=='int'){
                return 'number';
            }
            return 'text';
        },
        parseRules:function (row){
            if(row.edit=='hidden' || !row.edit){
                return '';
            }
            if(row.field=='pid'){
                return 'required';
            }
            if(row.field=='status' || row.type=='int'){
                return '';
            }
            return 'required';
        },
        parseOperate:function (row){
            if(row.field=='pid' || row.field=='id'){
                return '';
            }
            if(row.formatter=='text'){
                return '=';
            }
            if(row.formatter=='date'){
                return 'date';
            }
            if(row.formatter=='datetime'){
                return 'daterange';
            }
            if(row.formatter=='tag'){
                return 'like';
            }
            if(row.formatter=='tags'){
                return 'find_in_set';
            }
            if(row.formatter=='switch' || row.formatter=='select'){
                return 'select';
            }
            return '';
        },
        parseSearchList:function (row){
            let r='';
            if(row.visible=='none'){
                return r;
            }
            if(row.formatter=='switch' ||  row.formatter=='select'){
                if(row.field=='status'){
                    r={'normal':__('正常'),'hidden':__('隐藏')};
                }else if(row.type=='tinyint' || row.type=='int'){
                    r={'1':__('是'),'0':__('否')};
                }else{
                    r={'key1':'选项1','key2':'选项2'};
                }
            }
            if(!r && (
                row.operate=='SELECT' ||
                row.operate=='SELECTS' ||
                row.operate=='RADIO' ||
                row.operate=='FIND_IN_SET' ||
                row.operate=='CHECKBOX')
            ){
                r={'key1':'选项1','key2':'选项2'};
            }
            if(r){
                r=JSON.stringify(r);
            }
            return r;
        },
        parseOperateForm:function (){
            let data=this.operateDialog.data;
            let showFilter=[];
            let form=data.form;
            switch (form){
                case 'hidden':
                    showFilter='all';
                    break;
                case 'input':
                    if(!inArray(['text','number','password','color'],data.type)){
                        data.type='text';
                    }
                    showFilter=['=','<>','>','>=','<','<=','LIKE','NOT LIKE','FIND_IN_SET','NOT FIND_IN_SET'];
                    break;
                case 'select':
                case 'cascader':
                case 'selectpage':
                    if(data.multiple){
                        showFilter=['IN','NOT IN'];
                    }else{
                        showFilter=['=','<>','>','>=','<','<=','LIKE','NOT LIKE','FIND_IN_SET','NOT FIND_IN_SET'];
                    }
                    break;
                case 'radio':
                    showFilter=['=','<>','>','>=','<','<=','LIKE','NOT LIKE','FIND_IN_SET','NOT FIND_IN_SET'];
                    break;
                case 'checkbox':
                    showFilter=['IN','NOT IN'];
                    break;
                case 'between':
                    showFilter=['BETWEEN','NOT BETWEEN'];
                    break;
                case 'date-picker':
                    if(!inArray(['date','datetime','daterange'],data.type)){
                        data.type='date';
                    }
                    if(data.type=='date' || data.type=='datetime'){
                        showFilter=['=','< TIME','<= TIME','> TIME','>= TIME'];
                    }
                    if(data.type=='daterange'){
                        showFilter=['BETWEEN TIME','NOT BETWEEN TIME'];
                    }
                    break;
                case 'time-picker':
                    if(!inArray(['time','timerange'],data.type)){
                        data.type='time';
                    }
                    if(data.type=='time'){
                        showFilter=['=','< TIME','<= TIME','> TIME','>= TIME'];
                    }
                    if(data.type=='timerange'){
                        showFilter=['BETWEEN TIME','NOT BETWEEN TIME'];
                    }
                    break;
            }
            this.operateDialog.searchList='';
            if(form=='checkbox' || form=='select' || form=='radio'){
                Vue.nextTick(()=>{
                    let searchList=this.operateDialog.row.searchList?JSON.parse(this.operateDialog.row.searchList): {};
                    this.operateDialog.searchList=searchList;
                });
            }
            this.operateDialog.filter=this.parseFilter(showFilter);
        },
        parseFilter:function (arr){
            if(arr=='all'){
                return this.filter;
            }else{
                let filter=[];
                for(let i=0;i<this.filter.length;i++){
                    if(inArray(arr,this.filter[i].key)){
                        filter.push(this.filter[i]);
                    }
                }
                return filter;
            }
        },
        showOperate:function (row){
            this.operateDialog.row=row;
            let obj={
                short:row.operate,
                form:'',
                type:'',
                filter:'',
                placeholder:'',
                size:'default',
                append:'',
                prepend:'',
                value:'',
                url:'',
                labelField:'name',
                keyField:'id',
                cascaderType:'url',
                options:'',
                level:2,
                multiple:0
            };
            if(row.operate.startsWith("{") && row.operate.endsWith("}")){
                let operate=JSON.parse(row.operate);
                if(operate.multiple){
                    operate.multiple=1;
                }
                this.operateDialog.data=Object.assign(obj,operate);
            }else{
                this.operateDialog.data=obj;
                parseShort(this.operateDialog.data);
                this.parseOperateForm();
            }
            this.operateDialog.show=true;
        },
        changeShort:function (type){
            if(type=='table'){
                this.operateDialog.data.value='';
                parseShort(this.operateDialog.data);
                this.parseOperateForm();
            }
            if(type=='form'){
                this.formDialog.data.value='';
                this.formDialog.data.readonly=0;
                parseShort(this.formDialog.data);
                this.parseForm();
            }
        },
        changeForm:function (type){
            if(type=='table'){
                this.parseOperateForm();
                this.operateDialog.data.value='';
                this.operateDialog.data.filter=this.operateDialog.filter[0].key;
                if(this.operateDialog.data.form=='select' || this.operateDialog.data.form=='selectpage' || this.operateDialog.data.form=='cascader'){
                    if(this.operateDialog.data.multiple){
                        this.operateDialog.data.value='[]';
                    }
                }
                if(this.operateDialog.data.form=='date-picker' || this.operateDialog.data.form=='time-picker'){
                    if(this.operateDialog.data.type=='daterange' || this.operateDialog.data.type=='timerange'){
                        this.operateDialog.data.value='[]';
                    }
                }
                if(this.operateDialog.data.form=='checkbox' || this.operateDialog.data.form=='between'){
                    this.operateDialog.data.value='[]';
                }
            }
            if(type=='form'){
                this.parseForm();
                this.formDialog.data.value='';
                if(this.formDialog.data.form=='select' || this.formDialog.data.form=='selectpage' || this.formDialog.data.form=='cascader'){
                    if(this.formDialog.data.multiple){
                        this.formDialog.data.value='[]';
                    }
                }
                if(this.formDialog.data.form=='date-picker' || this.formDialog.data.form=='time-picker'){
                    if(this.formDialog.data.type=='daterange' || this.formDialog.data.type=='timerange'){
                        this.formDialog.data.value='[]';
                    }
                }
                if(this.formDialog.data.form=='checkbox'){
                    this.formDialog.data.value='[]';
                }
                if(this.formDialog.data.form=='fieldlist'){
                    this.formDialog.data.value='{}';
                }
            }
        },
        parseForm:function (){
            let data=this.formDialog.data;
            let form=data.form;
            this.formDialog.searchList='';
            if(form=='input' && !inArray(['text','number','hidden','textarea','password','color'],data.type)){
                data.type='text';
            }
            if(form=='date-picker' && !inArray(['date','datetime','daterange'],data.type)){
                data.type='date';
            }
            if(form=='time-picker' && !inArray(['time','timerange'],data.type)){
                data.type='time';
            }
            if(form=='checkbox' || form=='select' || form=='radio'){
                Vue.nextTick(()=>{
                    let searchList=this.formDialog.row.searchList?JSON.parse(this.formDialog.row.searchList): {};
                    this.formDialog.searchList=searchList;
                });

            }else if(form=='switch'){
                Vue.nextTick(()=>{
                    let json={'normal':'正常','hidden':'隐藏'};
                    data.value='normal';
                    let type=this.formDialog.row.type;
                    if(type=='int'){
                        json={'0':'否','1':'是'};
                        data.value='1';
                    }
                    let searchList=this.formDialog.row.searchList?JSON.parse(this.formDialog.row.searchList):json;
                    this.formDialog.searchList=searchList;
                });
            }
        },
        confirmFilter:function (){
            let data=this.operateDialog.data;
            let row=this.operateDialog.row;
            let field=[];
            switch (data.form){
                case 'hidden':
                    field=['form','filter','value'];
                    break;
                case 'input':
                    field=['form','type','filter','placeholder','size','append','prepend','value'];
                    break;
                case 'select':
                    field=['form','filter','placeholder','size','value','multiple'];
                    break;
                case 'cascader':
                    if(data.cascaderType=='url'){
                        field=['form','filter','placeholder','size','value','url','level','multiple'];
                    }
                    if(data.cascaderType=='options'){
                        field=['form','filter','placeholder','size','value','options','multiple'];
                    }
                    break;
                case 'selectpage':
                    field=['form','filter','placeholder','size','value','url','labelField','keyField','multiple'];
                    break;
                case 'radio':
                    field=['form','filter','size','value'];
                    break;
                case 'checkbox':
                    field=['form','filter','size','value'];
                    break;
                case 'between':
                    field=['form','filter','size','value'];
                    break;
                case 'date-picker':
                    field=['form','type','placeholder','filter','size','value'];
                    break;
                case 'time-picker':
                    field=['form','type','placeholder','filter','size','value'];
                    break;
            }
            let r={};
            for(let key in data){
                if(inArray(field,key)){
                    if(!data[key]){
                        continue;
                    }
                    if(key=='multiple'){
                        if(!data[key]){
                            continue;
                        }else{
                            data[key]=true;
                        }
                    }
                    if(key=='size' && data[key]=='default'){
                        continue;
                    }
                    r[key]=data[key];
                }
            }
            row.operate=JSON.stringify(r);
            if(this.operateDialog.searchList && Object.keys(this.operateDialog.searchList).length>0){
                row.searchList=JSON.stringify(this.operateDialog.searchList);
            }else{
                row.searchList='';
            }
            this.operateDialog.show=false;
        },
        changeSearchList:function (row){
            if(row.field=='searchlist'){
                this.searchListDialog.searchList=row.value;
            }
            if(row.field=='operate'){
                this.operateDialog.searchList=row.value;
            }
            if(row.field=='form'){
                this.formDialog.searchList=row.value;
            }
        },
        showSearchList:function (row){
            this.searchListDialog.searchList='';
            Vue.nextTick(()=>{
                this.searchListDialog.searchList=row.searchList?JSON.parse(row.searchList): {};
            });
            this.searchListDialog.row=row;
            this.searchListDialog.show=true;
        },
        confirmSearchList:function (){
            let row= this.searchListDialog.row;
            if(this.searchListDialog.searchList && Object.keys(this.searchListDialog.searchList).length>0){
                row.searchList=JSON.stringify(this.searchListDialog.searchList);
            }else{
                row.searchList='';
            }
            this.searchListDialog.show=false;
        },
        showRelation:function (row){
            this.relationDialog.row=row;
            this.relationDialog.show=true;
        },
        changeRelationTable:function (table){
            this.relationDialog.data.table=table;
            Yunqi.ajax.get('develop/getFields',{table:table}).then(res=>{
                this.relationDialog.fields=res;
                this.relationDialog.data.relationField=res[0].name;
            });
        },
        confirmRelation:function (){
            let row=this.relationDialog.row;
            let data=this.relationDialog.data;
            for(let k in data){
                if(!data[k]){
                    Yunqi.message.error(__('每一项都必须填写完整'));
                    return;
                }
            }
            row.relation=JSON.stringify(data);
            if(row.operate.startsWith('{') && row.operate.endsWith('}')){
                let operate=JSON.parse(row.operate);
                let table=data.table.replace(Yunqi.data.tablePrefix,'');
                operate.name=table+'.'+data.filterField;
                row.operate=JSON.stringify(operate);
            }else{
                let obj={
                    short:row.operate
                };
                parseShort(obj);
                let table=data.table.replace(Yunqi.data.tablePrefix,'');
                obj.name=table+'.'+data.filterField;
                delete obj.short;
                row.operate=JSON.stringify(obj);
            }
            this.relationDialog.show=false;
            this.relationDialog.data={
                table:'',
                relationField:'',
                filterField:'',
                showField:'',
                ralationType:'one'
            };
        },
        showFormDialog:function (row){
            this.formDialog.row=row;
            let obj={
                short:row.edit,
                form:'',
                type:'',
                placeholder:'',
                append:'',
                prepend:'',
                readonly:0,
                value:'',
                url:'',
                labelField:'name',
                keyField:'id',
                cascaderType:'url',
                options:'',
                level:2,
                width:'100%',
                height:'400px',
                limit:1,
                disks:'local_public',
                accept:getAccept(),
                multiple:0,
                label:['键名','键值']
            };
            if(row.edit.startsWith("{") && row.edit.endsWith("}")){
                let edit=JSON.parse(row.edit);
                if(edit.multiple){
                    edit.multiple=1;
                }
                if(edit.readonly){
                    edit.readonly=1;
                }
                this.formDialog.data=Object.assign(obj,edit);
            }else{
                this.formDialog.data=obj;
                parseShort(this.formDialog.data);
                this.parseForm();
            }
            this.formDialog.show=true;
        },
        confirmForm:function (){
            let data=this.formDialog.data;
            let row=this.formDialog.row;
            let field=[];
            switch (data.form){
                case 'input':
                    field=['form','type','placeholder','append','prepend','readonly','value'];
                    break;
                case 'select':
                    field=['form','placeholder','placeholder','value','multiple'];
                    break;
                case 'radio':
                case 'checkbox':
                case 'switch':
                    field=['form','value'];
                    break;
                case 'editor':
                    field=['form','width','height','value'];
                    break;
                case 'date-picker':
                case 'time-picker':
                    field=['form','type','placeholder','value'];
                    break;
                case 'cascader':
                    if(data.cascaderType=='url'){
                        field=['form','placeholder','url','level','multiple','value'];
                    }
                    if(data.cascaderType=='options'){
                        field=['form','placeholder','options','multiple','value'];
                    }
                    break;
                case 'selectpage':
                    field=['form','placeholder','url','labelField','keyField','multiple','value'];
                    break;
                case 'attachment':
                    field=['form','limit','value'];
                    break;
                case 'files':
                    if(data.limit>1){
                        data.multiple=1;
                    }
                    field=['form','limit','accept','disks','value','multiple'];
                    break;
                case 'fieldlist':
                    field=['form','label','value'];
                    break;
                case 'slot':
                    field=['form'];
                    break;
            }
            let r={};
            for(let key in data){
                if(inArray(field,key)){
                    if(!data[key]){
                        continue;
                    }
                    if(key=='multiple' || key=='readonly'){
                        if(!data[key]){
                            continue;
                        }else{
                            data[key]=true;
                        }
                    }
                    r[key]=data[key];
                }
            }
            row.edit=JSON.stringify(r);
            if(this.formDialog.searchList && Object.keys(this.formDialog.searchList).length>0){
                row.searchList=JSON.stringify(this.formDialog.searchList);
            }else{
                row.searchList='';
            }
            this.formDialog.show=false;
        },
        changeAction:function (action){
            let recyclebin=false;
            for(let k in action){
                if(k=='recyclebin'){
                    recyclebin=true;
                    break;
                }
            }
            this.crudForm.recyclebin=recyclebin;
            this.crudForm.actionList=action;
        },
        isShowEdit:function (row){
            if(!row.edit){
                return false;
            }
            if(row.edit=='hidden'){
                return false
            }
            if(row.edit.startsWith("{") && row.edit.endsWith("}")){
                let edit=JSON.parse(row.edit);
                if(edit.form=='input' && edit.type=='hidden'){
                    return false;
                }
            }
            return true;
        },
        openIconPanel:function (){
            this.$refs.checkicon.open();
        },
        selectIcon:function (i){
            this.crudForm.menu.icon=i;
        },
        clear:function (){
            Yunqi.confirm(__('支持清除一个小时内的操作,你确定要清除吗')).then(res=>{
                let postdata={
                    table:this.crudForm.table,
                    controller:this.crudForm.controller,
                    model:this.crudForm.model,
                    fields:this.tableData,
                    actionList:this.crudForm.actionList,
                    actions:{menu:0, table:0,form:0}
                };
                Yunqi.ajax.json('develop/clear',postdata,true,true);
            });
        },
        submit:function (type){
            let postdata={
                table:this.crudForm.table,
                controller:this.crudForm.controller,
                model:this.crudForm.model,
                menu:this.crudForm.menu,
                reduced:this.crudForm.reduced,
                actionList:this.crudForm.actionList,
                fields:this.tableData,
                isTree:this.crudForm.isTree,
                treeTitle:this.crudForm.treeTitle,
                pagination:!this.crudForm.pagination,
                tabs:this.crudForm.tabs,
                summary:this.crudForm.summary,
                expand:this.crudForm.expand,
                type:type,
                actions:{
                    menu:0,
                    table:0,
                    form:0
                }
            };
            if(inArray(this.actions,'menu')){
                postdata.actions.menu=1;
            }
            if(inArray(this.actions,'table')){
                postdata.actions.table=1;
            }
            if(inArray(this.actions,'form')){
                postdata.actions.form=1;
            }
            Yunqi.ajax.json('develop/crud',postdata,true,true).then(res=>{
                if(type=='file'){
                    Yunqi.api.addtabs({
                        url:res,
                        title:__('查看'),
                        menutype:'menu',
                        icon:'fa fa-th-large',
                    });
                }
                if(type=='code'){
                    this.codeDialog.row=res;
                    this.codeDialog.show=true;
                }
            });
        }
    }
}