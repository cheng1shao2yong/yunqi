import table from "../../components/Table.js";
import form from "../../components/Form.js";
import checkicon from "../../components/CheckIcon.js";
export default{
    components:{'YunTable':table,'YunForm':form,'CheckIcon':checkicon},
    data:{
        data:Yunqi.data.row || {},
        extend:{
            index_url: 'auth/rule/index',
            add_url: 'auth/rule/add',
            edit_url: 'auth/rule/edit',
            del_url: 'auth/rule/del',
            multi_url: 'auth/rule/multi'
        },
        indexColumns:[
            {checkbox: true,selectable:function (row,index){
                if(!row.ismenu){
                    return false;
                }
                return true;
            }},
            {field: 'id',title: __('ID'),width:80},
            {field: 'title', title: __('标题'),width:400,formatter:function(data){
                let html=Yunqi.formatter.html;
                html.value=data.replace(/&nbsp;/g,'&nbsp;&nbsp;');
                return html;
            }},
            {field: 'controller', title: __('控制器'),width:350,align:'left'},
            {field: 'action', title: __('方法')},
            {field: 'icon',width:80, title: __('图标'),formatter:Yunqi.formatter.slot},
            {field: 'ismenu',width:80, title: __('菜单'),formatter:function(data){
                if(data==1){
                    return __('是');
                }
                return __('否');
            }},
            {field: 'weigh', title: __('权重'),width:80},
            {field: 'status', title: __('状态'),width:80,searchList: {'normal': __('正常'),'hidden': __('隐藏')},formatter: Yunqi.formatter.switch},
            {treeExpand: true},
            {
                field: 'operate',
                title: __('操作'),
                width:150,
                action:{sort:true,edit:true, del:true}
            }
        ],
        eidtColumns:[
            {field: 'id',edit:'hidden'},
            {field: 'ismenu',title: __('菜单'),edit: {form:'radio',change:'changeMenu',value:'1'},searchList: {'1':__('是'),'0':__('否')}},
            {field: 'pid',title: __('父级'),edit:'slot',rules:'required'},
            {field: 'title', title: __('名称'),edit:'text'},
            {field: 'controller', title: __('控制器'),edit:'text'},
            {field: 'action', title: __('方法'),edit:'text'},
            {
                field: 'actions',
                title: __('方法'),
                edit: {
                    form:'fieldlist',
                    label:[__('方法名'),__('功能描述')],
                    visible:false,
                    value:{index:__('查看'),add:__('添加'),edit:__('编辑'),multi:__('更新'),del:__('删除'),import:__('导入'),download:__('下载')}
                }
            },
            {field: 'menutype', title: __('类型'),edit:{form:'radio',value:'addtabs'},searchList: Yunqi.data.menutypeList},
            {field: 'icon', title: __('图标'),edit: {form:'slot',value: 'fa fa-th-large'}},
            {field: 'extend', title: __('扩展属性'),edit: {form:'input',type:'textarea',placeholder:'请输入菜单的扩展属性，格式为json'}},
            {field: 'weigh', title: __('权重'),edit:Yunqi.config.route[2]=='edit'?'number':false},
            {field: 'status', title: __('状态'),edit: {form:'radio',value:'normal'},searchList: {'normal': __('正常'),'hidden': __('隐藏')}}
        ],
        pageinit:false
    },
    methods: {
        onRender:function (data){
            let action=Yunqi.config.route[2];
            if(action=='index'){
                if(this.pageinit){
                    return;
                }
                this.treeinit(data);
                this.pageinit=true;
            }
            if(action=='edit'){
                if(parseInt(data.ismenu)===0){
                    let title=JSON.parse(data.title);
                    let action=JSON.parse(data.action);
                    let actions={};
                    for(let i=0;i<title.length;i++){
                        actions[action[i]]=title[i];
                    }
                    data.actions=actions;
                    this.changeMenu(0);
                }
            }
        },
        treeinit:function (list){
            for(let i=0;i<list.length;i++){
                let controller=list[i].controller;
                let action=list[i].action;
                let ismenu=list[i].ismenu;
                if(ismenu && controller && action){
                    Vue.nextTick(()=>{
                        this.$refs.yuntable.expandTree(list[i].id);
                    });
                }
            }
        },
        changeMenu:function (data){
            data=parseInt(data);
            if(data){
                this.$refs.yunform.showField('title');
                this.$refs.yunform.showField('action');
                this.$refs.yunform.showField('icon');
                this.$refs.yunform.showField('extend');
                (Yunqi.config.route[2]=='edit') && this.$refs.yunform.showField('weigh');
                this.$refs.yunform.showField('menutype');
                this.$refs.yunform.showField('status');
                this.$refs.yunform.hideField('actions');
            }else{
                this.$refs.yunform.hideField('title');
                this.$refs.yunform.hideField('action');
                this.$refs.yunform.hideField('icon');
                this.$refs.yunform.hideField('extend');
                (Yunqi.config.route[2]=='edit') && this.$refs.yunform.hideField('weigh');
                this.$refs.yunform.hideField('menutype');
                this.$refs.yunform.hideField('status');
                this.$refs.yunform.showField('actions');
            }
        },
        openIconPanel:function (){
            this.$refs.checkicon.open();
        },
        selectIcon:function (i){
            this.$refs.yunform.form_.data.icon=i;
        }
    }
}