/**
 * Created by xiongjie on 2023-4-12.
 */
import table from "../../components/Table.js";
import form from "../../components/Form.js";

export default {
    components: {'YunTable':table,'YunForm':form},
    data:{
        extend:{
            index_url: 'auth/adminlog/index',
            del_url: 'auth/adminlog/del',
            detail_url: 'auth/adminlog/detail',
        },
        columns:[
            {checkbox: true},
            {field: 'id',title:'ID',width:80,operate:false},
            {field: 'username', title: __('用户名'),width:100,operate:'='},
            {field: 'title', title: __('标题'), operate:'='},
            {field: 'controller', title: __('控制器'), operate:'='},
            {field: 'action', title: __('方法'), operate:'like',width:100},
            {field: 'url', title: __('访问链接'),operate:'like',width:300},
            {field: 'ip', title: __('IP'),width:140},
            {field: 'createtime', title: __('创建时间'),sortable: true,width:150,operate:false},
            {
                field: 'operate',
                fixed: 'right',
                title: __('操作'),
                width:140,
                action:{
                    detail:{
                        tooltip:false,
                        type:'primary',
                        icon:'fa fa-list',
                        text:'详情',
                        method:'showDetail'
                    },
                    del:true
                }
            }
        ],
        detail:[]
    },
    onShow:{
        detail:function (){
            let detail=[];
            let row=Yunqi.data.row;
            for(let k in row){
                detail.push({
                    title:k,
                    content:row[k]
                });
            }
            this.detail=detail;
        }
    },
    methods: {
        showDetail:function (rows){
            Yunqi.api.open({
                title:'详情',
                height:450,
                width:900,
                icon:'fa fa-list',
                url:this.extend.detail_url+'?ids='+rows.id
            });
        }
    }
}