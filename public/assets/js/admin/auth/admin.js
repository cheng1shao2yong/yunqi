import table from "../../components/Table.js";
import form from "../../components/Form.js";
import {inArray} from "../../util.js";
export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        extend:{
            index_url: 'auth/admin/index',
            add_url: 'auth/admin/add',
            edit_url: 'auth/admin/edit',
            del_url: 'auth/admin/del',
            multi_url: 'auth/admin/multi'
        },
        data:Yunqi.data.row || {},
        columns:[
            {checkbox: true,selectable:function (row,index){
                for(let i in row.groupids){
                    if(inArray(Yunqi.data.groupids,row.groupids[i].id)){
                        return false;
                    }
                }
                return true;
            }},
            {field: 'id',title: __('ID'),width:80,edit:'hidden',operate:false},
            {field: 'username', title: __('用户名'),edit:'text',rules:'required',operate:'like'},
            {field: 'nickname', title: __('昵称'),edit:'text',rules:'required',operate:'like'},
            {field: 'mobile', title: __('手机号'),edit:'text',rules:'required;mobile'},
            {
                field: 'groupids',
                title: __('所属组别'),
                edit:{form:'slot',value:[]},
                formatter:Yunqi.formatter.slot,
                rules:'required',
                operate:false
            },
            {field: 'password', title: __('密码'),edit:'password',visible:'none',operate:false},
            {field: 'status', title: __('状态'),operate:false, edit:{form:'radio',value:'normal'},searchList: {'normal': __('正常'),'hidden': __('隐藏')},formatter:function(data,row){
                let sw=Yunqi.formatter.switch;
                sw.activeValue='normal';
                sw.inactiveValue='hidden';
                sw.value=row.status;
                sw.disabled=false;
                for(let i in row.groupids){
                    if(inArray(Yunqi.data.groupids,row.groupids[i].id)){
                        sw.disabled=true;
                    }
                }
                return sw;
            }},
            {
                field: 'operate',
                title: __('操作'),
                width:100,
                action:{
                    edit:function(row){
                        for(let i in row.groupids){
                            if(inArray(Yunqi.data.groupids,row.groupids[i].id)){
                                return false;
                            }
                        }
                        return true;
                    },
                    del:function(row){
                        for(let i in row.groupids){
                            if(inArray(Yunqi.data.groupids,row.groupids[i].id)){
                                return false;
                            }
                        }
                        return true;
                    }
                }
            }
        ]
    },
    methods: {

    }
}