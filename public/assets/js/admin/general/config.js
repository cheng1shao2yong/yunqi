import form from "../../components/Form.js";
import {formatDate, formatDateTime, inArray} from "../../util.js";
export default{
    components:{'YunForm':form},
    data:{
        extend:{
            index_url: 'general/config/index',
            add_url: 'general/config/add',
            edit_url: 'general/config/edit',
            del_url: 'general/config/del'
        },
        addconfig:[
            {field:'group',title:__('分组'),searchList:Yunqi.data.groupList,edit: {form:'select',value:'basic',change:'changeGroup'},rules:'required'},
            {field:'addons_pack',title:__('扩展包名'),edit:{form:'input',type:'text',visible:false}},
            {field:'type',title:__('类型'),searchList:Yunqi.data.typeList,edit: {form:'select',change:'changeType',value:'text'},rules:'required'},
            {field:'title',title:__('变量标题'),edit:'text',rules:'required'},
            {field:'name',title:__('变量名'),edit:'text',rules:'required'},
            {field:'url',title:__('分页列表Url'),edit: {form:'input',type:'text',visible:false}},
            {field:'labelField',title:__('显示字段'),edit: {form:'input',type:'text',placeholder:'请输入显示字段labelField',visible:false}},
            {field:'keyField',title:__('存储字段'),edit: {form:'input',type:'text',placeholder:'请输入显示字段keyField',visible:false}},
            {field:'options',title:__('选项'),edit: {form:'fieldlist',label:['键名','键值'],visible:false}},
            {field:'value',title:__('默认值'),edit:'text'},
            {field:'label',title:__('数组标题'),edit: {form:'input',type:'text',placeholder:'请输入Fieldlist的标题label，用“,”隔开',visible:false}},
            {field:'tips',title:__('提示信息'),edit:'text'},
            {field:'rules',title:__('验证规则'),edit:{form:'input',type:'text',placeholder:'请输入验证规则，多个规则用“,”隔开'}},
        ],
        groupList:Yunqi.data.groupList,
        typeList:Yunqi.data.typeList,
        tableList:[],
        fieldList:[],
        tabValue:'basic',
        columns:''
    },
    onLoad:{
        index:function (){
            this.getSiteList();
        }
    },
    methods: {
        getSiteList:function (){
            Yunqi.ajax.get(this.extend.index_url,{group:this.tabValue}).then(res=>{
                if(this.tabValue=='addons'){
                    let columns=[];
                    for(let i=0;i<res.length;i++){
                        let value={key:res[i].key,type:res[i].type,name:res[i].name};
                        columns.push({field:'addons', edit:{form:'slot',value:value}});
                        let row=this.formatColumns(res[i].list);
                        columns=columns.concat(row);
                    }
                    this.columns=columns;
                }else{
                    this.columns=this.formatColumns(res);
                }
            });
        },
        tabChange:function (tab){
            this.columns='';
            this.tabValue=tab;
            this.getSiteList();
        },
        delVar:function (name){
            Yunqi.ajax.post(this.extend.del_url,{group:this.tabValue,name:name}).then(res=>{
                location.reload();
            });
        },
        formatVar:function (field,addons){
            if(addons){
                return 'site_config('+this.tabValue+'.'+addons+'.'+field+'")';
            }else{
                return 'site_config("'+this.tabValue+'.'+field+'")';
            }
        },
        formatColumns:function (list){
            let one=[];
            for(let i=0;i<list.length;i++){
                let obj={
                    id:list[i].id,
                    field:list[i].name,
                    title:list[i].title,
                    can_delete:list[i].can_delete,
                    edit: {}
                };
                if(list[i].rules){
                    obj.rules=list[i].rules;
                }
                if(list[i].type=='text'){
                    obj.edit.form='input';
                    obj.edit.type='text';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='textarea'){
                    obj.edit.form='input';
                    obj.edit.type='textarea';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='password'){
                    obj.edit.form='input';
                    obj.edit.type='password';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='number'){
                    obj.edit.form='input';
                    obj.edit.type='number';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='date'){
                    obj.edit.form='date-picker';
                    obj.edit.type='date';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='time'){
                    obj.edit.form='time-picker';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='datetime'){
                    obj.edit.form='date-picker';
                    obj.edit.type='datetime';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='daterange'){
                    obj.edit.form='date-picker';
                    obj.edit.type='daterange';
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='timerange'){
                    obj.edit.form='time-picker';
                    obj.edit.isRange=true;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='select'){
                    obj.searchList=list[i].extend;
                    obj.edit.form='select';
                    obj.edit.value=list[i].value.toString();
                }
                if(list[i].type=='selects'){
                    obj.edit.form='select';
                    obj.searchList=list[i].extend;
                    obj.edit.multiple=true;
                    obj.edit.value=list[i].value || [];
                }
                if(list[i].type=='selectpage'){
                    obj.edit.form='selectpage';
                    obj.edit.url='general/config/selectpage?id='+list[i].id;
                    obj.edit.keyField=list[i].setting.primarykey;
                    obj.edit.labelField=list[i].setting.field;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='selectpages'){
                    obj.edit.form='selectpage';
                    obj.edit.url='general/config/selectpage?id='+list[i].id;
                    obj.edit.keyField=list[i].setting.primarykey;
                    obj.edit.labelField=list[i].setting.field;
                    obj.edit.multiple=true;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='radio'){
                    obj.edit.form='radio';
                    obj.searchList=list[i].extend;
                    obj.edit.value=list[i].value.toString();
                }
                if(list[i].type=='checkbox'){
                    obj.edit.form='checkbox';
                    obj.searchList=list[i].extend;
                    obj.edit.value=list[i].value || [];
                }
                if(list[i].type=='image'){
                    obj.edit.form='attachment';
                    obj.edit.limit=1;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='images'){
                    obj.edit.form='attachment';
                    obj.edit.limit=10;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='file'){
                    obj.edit.form='files';
                    obj.edit.limit=1;
                    let mimetype=Yunqi.config.upload.mimetype.split(',');
                    let accept=[];
                    mimetype.forEach(res=>{
                        accept.push('.'+res);
                    });
                    obj.edit.accept=accept;
                    obj.edit.multiple=false;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='files'){
                    obj.edit.form='files';
                    let mimetype=Yunqi.config.upload.mimetype.split(',');
                    let accept=[];
                    mimetype.forEach(res=>{
                        accept.push('.'+res);
                    });
                    obj.edit.accept=accept;
                    obj.edit.multiple=true;
                    obj.edit.value=list[i].value;
                }
                if(list[i].type=='json'){
                    obj.edit.form='fieldlist';
                    obj.edit.value=list[i].value;
                    obj.edit.label=list[i].extend;
                }
                if(list[i].type=='switch'){
                    obj.edit.form='switch';
                    obj.edit.inactiveValue='0';
                    obj.edit.activeValue='1'
                    obj.edit.value=list[i].value;
                }
                if(list[i].tip){
                    obj.edit.placeholder=list[i].tip;
                }
                one.push(obj);
            }
            return one;
        },
        changeType:function (data,row){
            this.$refs.yunform.hideField(['label','url','labelField','keyField','options']);
            if(data=='selectpage' || data=='selectpages'){
                this.$refs.yunform.showField(['url','labelField','keyField']);
            }else if(data=='array'){
                this.$refs.yunform.showField('label');
            }else if(inArray(['select','selects','radio','checkbox'],data)){
                this.$refs.yunform.showField('options');
            }
        },
        changeGroup:function (data){
            if(data=='addons'){
                this.$refs.yunform.showField('addons_pack');
            }else{
                this.$refs.yunform.hideField('addons_pack');
            }
        },
        onSubmit:function (row){
            row.group=this.tabValue;
            return true;
        },
        onSuccess:function (){
            if(this.tabValue=='dictionary'){
                location.reload();
            }
        }
    }
}