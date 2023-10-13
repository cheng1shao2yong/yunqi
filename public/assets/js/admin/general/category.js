import table from "../../components/Table.js";
import form from "../../components/Form.js";
export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        data:Yunqi.data.row || {},
        extend:{
            index_url: 'general/category/index',
            add_url: 'general/category/add',
            edit_url: 'general/category/edit',
            del_url: 'general/category/del',
            multi_url: 'general/category/multi'
        },
        columns:[
            {checkbox: true},
            {field: 'id',title:'ID',width:80,edit:'hidden'},
            {field: 'type', title: __('所属分组'),width:120,searchList:Yunqi.data.typeList,edit: {form:'select',change:'changeType'},rules:'required',formatter:Yunqi.formatter.tag},
            {field: 'pid',title:__('父级'),edit: {form:'slot',value:'0'},visible:'none'},
            {field: 'name',title:__('名称'),edit:'text',rules:'required',formatter:function(data){
                let html=Yunqi.formatter.html;
                html.value=data.replace(/&nbsp;/g,'&nbsp;&nbsp;');
                return html;
            }},
            {field: 'nickname',title:__('昵称'),edit:'text'},
            {field: 'image', title: __('图片'),width:90, edit:'image',formatter: function (data){
                let image=Yunqi.formatter.image;
                image.value=data;
                image.width=30;
                image.height=30;
                return image;
            }},
            {field: 'weigh', title: __('权重'),width:80,edit:(Yunqi.config.route[2]=='edit')?'number':false},
            {field: 'status', title: __('状态'),width:120, edit:'switch',searchList: {'normal': __('Normal'),'hidden': __('Hidden')},formatter:Yunqi.formatter.switch},
            {treeExpand:true},
            {
                field: 'operate',
                title: __('操作'),
                width:150,
                action:{sort:true,edit:true,del:true}
            }
        ]
    },
    methods: {
        changeType:function (data,row){
            row.pid='0';
        }
    }
}