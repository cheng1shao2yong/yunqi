import table from "../../components/Table.js";
import form from "../../components/Form.js";
import {inArray} from "../../util.js";

const doCheck=function (tree,checkKey){
    tree.forEach(res=>{
        checkKey.push(res.id);
        if(res.children && res.children.length>0){
            doCheck(res.children,checkKey);
        }
    });
}
export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        extend:{
            index_url: 'auth/group/index',
            add_url: 'auth/group/add',
            edit_url: 'auth/group/edit',
            del_url: 'auth/group/del',
            multi_url: 'auth/group/multi'
        },
        data:Yunqi.data.row || {pid:Yunqi.data.groupdata?Yunqi.data.groupdata[0].id:0},
        columns:[
            {checkbox: true,selectable:function (row,index){
                if(inArray(Yunqi.data.groupids,row.id)){
                    return false;
                }
                return true;
            }},
            {field: 'id',title: __('ID'),width:80,edit:'hidden'},
            {field: 'pid', title: __('父级'),visible:'none',edit:'slot',rules:'required'},
            {field: 'rules',title: __('权限'),edit:'slot',visible:'none'},
            {field: 'name', title: __('名称'),edit:'text',rules:'required',formatter:function (data){
                let html=Yunqi.formatter.html;
                html.value=data.replace(/&nbsp;/g,'&nbsp;&nbsp;');
                return html;
            }},
            {field: 'status', title: __('状态'), edit:{form:'radio',value:'normal'},searchList: {'normal': __('正常'),'hidden': __('隐藏')},formatter:function(data,row){
                  let sw=Yunqi.formatter.switch;
                  sw.activeValue='normal';
                  sw.inactiveValue='hidden';
                  sw.value=row.status;
                  if(inArray(Yunqi.data.groupids,row.id)){
                      sw.disabled=true;
                  }else{
                      sw.disabled=false;
                  }
                  return sw;
            }},
            {treeExpand: true},
            {
                field: 'operate',
                title: __('操作'),
                width:150,
                action:{
                    edit:function(row){
                        return !inArray(Yunqi.data.groupids,row.id);
                    },
                    del:function(row){
                        return !inArray(Yunqi.data.groupids,row.id);
                    }
                }
            }
        ],
        checkAll:false,
        expandAll:false,
        checkedKey:[],
        treedata:[],

    },
    onShow:{
        add:function (){
            this.roletree(Yunqi.data.groupdata[0].id);
        },
        edit:function (){
            this.roletree(Yunqi.data.row.pid);
            this.checkedKey = Yunqi.data.row.rules.split(',');
        }
    },
    watch:{
        checkAll:function (data){
            if (data) {
                let checkedKey = [];
                doCheck(this.treedata, checkedKey);
                this.checkedKey = checkedKey;
            } else {
                for(let i=0;i<this.$refs.tree.store._getAllNodes().length;i++){
                    this.$refs.tree.store._getAllNodes()[i].checked = false;
                }
            }
        },
        expandAll:function (data) {
            if (data) {
                for(let i=0;i<this.$refs.tree.store._getAllNodes().length;i++){
                    this.$refs.tree.store._getAllNodes()[i].expanded = true;
                }
            } else {
                for(let i=0;i<this.$refs.tree.store._getAllNodes().length;i++){
                    this.$refs.tree.store._getAllNodes()[i].expanded = false;
                }
            }
        }
    },
    methods: {
        changePid:function (pid){
            this.roletree(pid);
        },
        roletree:function (pid){
            Yunqi.ajax.get('auth/group/roletree',{groupid:pid},true,false,true).then(res=>{
                this.treedata=res;
            });
        },
        onSubmit:function (){
            let row=this.$refs.yunform.form_.data;
            let s1=this.$refs.tree.getCheckedKeys();
            let s2=this.$refs.tree.getHalfCheckedKeys();
            row.rules=s1.join(',');
            row.auth_rules=s2.concat(s1).join(',');
            return true;
        }
    }
}