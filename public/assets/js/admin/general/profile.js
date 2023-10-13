import table from "../../components/Table.js";
import form from "../../components/Form.js";
import uploadimg from "../../components/UploadImg.js";
export default{
    components:{'YunTable':table,'YunForm':form,'UploadImg':uploadimg},
    data:{
        extend:{
            index_url: 'general/profile/index',
            edit_url: 'general/profile/update'
        },
        columns:[
            {field: 'username', title: __('用户名'),edit:'readonly'},
            {field: 'mobile', title: __('手机号'),edit:'text',rules:'required;mobile'},
            {field: 'nickname', title: __('昵称'),edit:'text',rules:'required'},
            {field: 'password', title: __('密码'),edit: {form:'input',type:'password',placeholder:'不修改密码请留空'}},
        ],
        log:[
            {field: 'id',title: __('ID'),width:70},
            {field: 'title',title: __('标题')},
            {field: 'url',title: __('链接'),formatter: Yunqi.formatter.link,width:240},
            {field: 'ip',title: __('IP'),width:140},
            {field: 'createtime',title: __('访问时间'),sortable: true,width:150,formatter:Yunqi.formatter.datetime},
        ],
        avatar:'',
    },
    onShow:{
        index:function (){
            this.avatar=this.$refs.yunform.data.avatar;
        }
    },
    methods: {
        changeImg:function (r){
            this.avatar=r;
        },
        onSubmit:function (data){
            data.avatar=this.avatar;
            return true;
        }
    }
}