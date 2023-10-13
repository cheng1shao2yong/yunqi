import table from "../../components/Table.js";
import form from "../../components/Form.js";
import {formatDateTime} from "../../util.js";
export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        extend:{
            index_url: 'user/index/index',
            edit_url: 'user/index/edit',
            del_url: 'user/index/del',
            multi_url: 'user/index/multi',
            download_url: 'user/index/download'
        },
        row:Yunqi.data.row,
        columns:[
            {checkbox: true},
            {field: 'id',title: __('ID'),width:80,edit:'hidden',sortable: true},
            {field: 'username',title: __('用户名'),width:120,edit:'text',rules:'required',operate:'='},
            {field: 'avatar', title: __('头像'), width:90,formatter: Yunqi.formatter.image, operate: false},
            {field: 'nickname',title: __('昵称'),edit:'readonly',rules:'required',operate: 'LIKE',formatter: Yunqi.formatter.tag},
            {field: 'sex', title: __('性别'), edit: 'radio',rules:"required",width:100, searchList: {1: __('男'), 2: __('女')},operate:'select',formatter:Yunqi.formatter.select},
            {field: 'email',title: __('邮箱'),rules:'email',edit:'text',operate:'LIKE',width:250},
            {field: 'mobile',title: __('手机'),edit:'text',rules:'mobile',width:130,operate: '='},
            {field: 'level', title: __('等级'),edit:{form:'select', value:1}, width:120,sortable: true,operate:'selects',searchList:{0:'普通',1:'1级',2:'2级',3:'3级',4:'4级'}},
            {field: 'score', title: __('积分'),width:80,sortable: true,operate:'between'},
            {field: 'balance', title: __('余额'),width:80,sortable: true,operate:'between'},
            {field: 'status', title: __('状态'), edit:'switch',width:100,searchList: {'normal': __('正常'),'hidden': __('隐藏')},formatter:Yunqi.formatter.switch,operate:'select'},
            {field: 'createtime', title: __('创建时间'), width:160,formatter: Yunqi.formatter.datetime,operate:false,sortable: true},
            {
                field: 'operate',
                title: __('操作'),
                width:180,
                fixed:'right',
                action:{
                    recharge:{
                        tooltip:true,
                        icon:'fa fa-plug',
                        type:'warning',
                        text:__('会员充值'),
                        method:'recharge'
                    },
                    detail:{
                        tooltip:true,
                        icon:'fa fa-list',
                        type:'info',
                        text:__('会员明细'),
                        method:'detail'
                    },
                    edit:true,
                    del:true
                }
            }
        ],
        rechargeColumn:[
            {field: 'user_id',title: __('会员ID'),edit:'hidden'},
            {field: 'nickname',title: __('充值会员'),edit:'readonly'},
            {field: 'module_type',title: __('充值类型'),edit:'radio',searchList:Yunqi.data.moduletype},
            {field: 'now',title: __('当前'),edit:'slot'},
            {field: 'recharge_type',title: __('充值方式'),edit:'radio',searchList: {add:'增加',minus:'减少',last:'最终'}},
            {field: 'change',title: __('变化'),edit:'slot',rules:'required;range(0~)'},
            {field: 'remark',title: __('备注'),edit:'textarea'}
        ],
        rechargeData:'',
        rechargeDetail: [
            {field: 'createtime', title: __('时间'),operate: {form:'date-picker',type:'daterange',size:'large'}},
            {field: 'before', title: __('交易前'),operate:false},
            {field: 'change', title: __('变化数目'),operate:false},
            {field: 'after', title: __('交易后'),operate:false},
            {field: 'order_no', title: __('订单编号')},
            {field: 'remark', title: __('备注'),operate:false}
        ],
        activeType:'',
        recharge_url:''
    },
    onLoad:{
        recharge:function (){
            this.rechargeData={
                user_id:Yunqi.data.user.id,
                nickname:Yunqi.data.user.nickname,
                module_type:Object.keys(Yunqi.data.moduletype)[0],
                recharge_type:'add'
            };
        },
        detail:function (){
            this.activeType=Object.keys(Yunqi.data.moduletype)[0];
            this.refreshLog();
        }
    },
    methods: {
        refreshLog:function (){
            console.log(this.activeType)
            this.recharge_url='';
            Vue.nextTick(()=>{
                this.recharge_url={
                    index_url:'user/index/detail?type='+this.activeType+'&ids='+Yunqi.data.user.id
                };
            });
        },
        getModuleTypeName:function (type){
            return  Yunqi.data.moduletype[type];
        },
        recharge:function (row){
            Yunqi.api.open({
                url:'user/index/recharge?ids='+row.id,
                title:__('会员充值'),
                icon:'fa fa-plug'
            });
        },
        detail:function (row){
            Yunqi.api.open({
                url:'user/index/detail?ids='+row.id,
                width:1000,
                title:__('会员明细'),
                icon:'fa fa-list'
            });
        },
        formatDateTime:function (e){
            return formatDateTime(new Date(e*1000));
        }
    }
}