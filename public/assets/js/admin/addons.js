import table from "../components/Table.js";
import form from "../components/Form.js";
import {rand} from "../util.js";

//生成订单号
function create_out_trade_no()
{
    let date=new Date();
    let year=date.getFullYear();
    let month=date.getMonth()+1;
    let day=date.getDate();
    if(day<10){
        date='0'+day;
    }
    let hour=date.getHours();
    if(hour<10){
        hour='0'+hour;
    }
    let minute=date.getMinutes();
    if(minute<10){
        minute='0'+minute;
    }
    let seconds=date.getSeconds();
    if(seconds<10){
        seconds='0'+seconds;
    }
    let r=''+year+month+day+hour+minute+seconds+rand(10000,99999);
    return r;
}
function formatTime(seconds)
{
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return `${interval}年后`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return `${interval}月后`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return `${interval}天后`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return `${interval}小时后`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return `${interval}分钟后`;
    }
    return `${Math.floor(seconds)}秒后`;
}
export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        extend:{
            index_url: 'addons/index',
            multi_url: 'addons/multi'
        },
        type:Yunqi.data.type,
        tabsValue:'plugin',
        plain:'all',
        columns:[
            {field:"plain",visible:'none',operate:{form:'hidden',value:function (){return Yunqi.app.plain},filter:false}},
            {
                field:"pack",
                title:"包名",
                edit:{form: 'input',type:'text',placeholder: '请输入包名，包名只能由小写字母、数字、下划线组成'},
                step:0,
                rules: {
                    required:true,
                    validator:function(rule, value, callback){
                        if(!/^[a-z0-9_]+$/.test(value)){
                            callback(new Error(__('包名必须为小写字母、数字、下划线组成')));
                        }
                        callback();
                    },
                    trigger: 'blur'
                },
                visible: 'none'
            },
            {field:"name",title:"扩展名称",edit:'text',step:0,rules:'required;length(2~30)',width: 180},
            {field:"type",title:"扩展类型",width: 100,searchList:Yunqi.data.type,edit:{form:'select',value:'plugin'},step:0,operate:false,rules:'required'},
            {field:"author",title:"作者",width: 150,edit:'text',step:0},
            {field:"price",title:"价格",width: 80,edit:{form:'input',type:'number',append:'元'},step:0,rules:'required;range(0~)',formatter:function (data) {
                let tag=Yunqi.formatter.tag;
                if (data) {
                    tag.type='';
                    tag.value='￥'+data;
                }else{
                    tag.type='success';
                    tag.value='免费';
                }
                return tag;
            }},
            {field:"version",title:"版本号",width: 80,edit:{form:'input',type:'number',placeholder: '请输入100到1999之间的数字，对应版本号为1.0.0或19.9.9'},rules:'required;range(100~1999)',step:0},
            {field:"document",title:"说明文档",edit:{form:'input',type:'text',placeholder:'请输入文档链接'},step:0,formatter: function (data){
                if(data) {
                    let link=Yunqi.formatter.link;
                    link.value = data;
                    return link;
                }else{
                    return '';
                }
            }},
            {field:"description",title:"简介",width:400,edit:'textarea',step:0},
            {field: "files",title:'扩展文件',edit:{form:'input',type:'textarea',rows:6,placeholder:'请输入扩展文件目录或扩展文件，相对系统根目录路径，每一行一个目录或文件'},step:1,rules:'required',visible: 'none'},
            {field: "unpack",title:'过滤文件',edit:{form:'input',type:'textarea',rows:3,placeholder:'请输入打包时需要过滤掉的目录或文件，每一行一个目录或文件'},step:1,visible: 'none'},
            {field: "require",title:'依赖文件',edit:{form:'input',type:'textarea',rows:3,placeholder:'请输入依赖的类，每一行一个完整类名，如\\Yansongda\\Pay\\Pay'},step:1,visible: 'none'},
            {field: "tables",title:'选择表',edit:'slot',visible: 'none'},
            {field: "config",title:'选择配置',edit:'slot',visible: 'none'},
            {field: "menu",title:'选择菜单',edit:'slot',visible: 'none'},
            {
                field:"local",
                title:"本地",
                width: 80,
                formatter: function (data){
                    let tag=Yunqi.formatter.tag;
                    if(data){
                        tag.value='是';
                        tag.type='success';
                    }else{
                        tag.value='否';
                        tag.type='danger';
                    }
                    return tag;
                }
            },
            {
                field:"packed",
                title:"打包",
                width: 80,
                formatter:function (data,row){
                    if(!row.local){
                        return '';
                    }
                    let tag=Yunqi.formatter.tag;
                    if(data){
                        tag.value='是';
                        tag.type='';
                    }else{
                        tag.value='否';
                        tag.type='danger';
                    }
                    return tag;
                }
            },
            {
                field:"open",
                title:"开放",
                width: 80,
                formatter:function (data,row){
                    if(!row.local){
                        return '';
                    }
                    let sw=Yunqi.formatter.switch;
                    sw.activeValue=1;
                    sw.inactiveValue=0;
                    sw.value=row.packed?data:0;
                    sw.disabled=true;
                    if(row.packed){
                        sw.disabled=false;
                    }
                    return sw;
                }
            },
            {
                field: 'operate',
                title: __('操作'),
                direction:'column',
                width:100,
                action:{
                    download:{
                        text:__('下载'),
                        type:'primary',
                        tooltip:false,
                        icon:'fa fa-download',
                        method:'downloadAddon',
                        visible:function (row) {
                            return !row.download;
                        }
                    },
                    install:{
                        text:__('安装'),
                        type:'primary',
                        tooltip:false,
                        icon:'fa fa-wrench',
                        method:'installAddon',
                        visible:function (row) {
                            return row.download && !row.install;
                        }
                    },
                    pack:{
                        text:__('打包'),
                        type:'primary',
                        tooltip:false,
                        icon:'fa fa-briefcase',
                        method:'packAddon',
                        visible:function (row) {
                            return row.download && row.install && !row.packed;
                        }
                    },
                    uninstall:{
                        text:__('卸载'),
                        type:'danger',
                        tooltip:false,
                        icon:'fa fa-remove',
                        method:'uninstallAddon',
                        visible:function (row) {
                            return row.install;
                        }
                    },
                    remove:{
                        text:__('删除'),
                        type:'danger',
                        tooltip:false,
                        icon:'fa fa-remove',
                        method:'delAddon',
                        visible:function (row) {
                            return row.download && !row.install;
                        }
                    },
                },
            }
        ],
        buyDialog:{
            show:false,
            out_trade_no:'',
            transaction_id:'',
            expire_time:0,
            status:0,
            message:'',
            code_url:'',
            row:''
        },
        unistallField:[],
        //创建扩展menu相关
        checkedKey:[],
        treedata:[],
        //卸载扩展相关
        menu:Yunqi.data.menu,
        conf:Yunqi.data.conf,
        tables:Yunqi.data.tables,
    },
    onLoad:{
        index:function (){
            setInterval(()=>{
                this.checkPayStatus();
            },2000)
        },
        uninstall:function (){
            this.unistallField=[
                {field:"name",title:"扩展名称",edit: {form:'input',type:'text',readonly:true,value:Yunqi.data.addon.name}},
                {field:"key",title:"关键字",edit: {form:'input',type:'hidden',value:Yunqi.data.addon.key}},
                {field:"actions",title:"卸载内容",edit:{form:'checkbox',value:['menu','config','tables']},searchList:{'menu':'菜单','config':'配置','tables':'数据表'}},
                {field:"content",edit:'slot'},
            ]
        }
    },
    onShow:{
        create:function (){
            Yunqi.ajax.get('auth/group/roletree',{groupid:1},true,false,true).then(res=>{
                this.treedata=res;
            });
        }
    },
    methods:{
        onSubmit:function (row){
            let s1=this.$refs.tree.getCheckedKeys();
            let s2=this.$refs.tree.getHalfCheckedKeys();
            row.menu=s2.concat(s1).join(',');
            return true;
        },
        changePlain:function (plain) {
            this.plain = plain;
            this.$refs.yuntable.submit();
        },
        packAddon:function(row) {
            Yunqi.ajax.post('addons/pack',{key:row.key}).then(res=>{
                this.$refs.yuntable.reload();
            });
        },
        downloadAddon:function(row){
            if(row.price>0){
                this.buyDialog.out_trade_no=create_out_trade_no();
                this.buyDialog.code_url=Yunqi.config.baseUrl+'addons/payCode?key='+row.key+'&out_trade_no='+this.buyDialog.out_trade_no;
                this.buyDialog.show=true;
                this.buyDialog.row=row;
            }else{
                Yunqi.ajax.post('addons/download',row).then(res=>{
                    this.$refs.yuntable.reload();
                });
            }
        },
        payDownload:function (){
            let postdata={...this.buyDialog.row,transaction_id:this.buyDialog.transaction_id}
            Yunqi.ajax.post('addons/download',postdata).then(res=>{
                this.closeBuyDialog();
                this.$refs.yuntable.reload();
            });
        },
        checkPayStatus:function (){
            if(this.buyDialog.show){
                Yunqi.ajax.get('addons/checkPayStatus',{out_trade_no:this.buyDialog.out_trade_no,key:this.buyDialog.row.key}).then(res=>{
                    if(res){
                        this.buyDialog.transaction_id=res.transaction_id;
                        this.buyDialog.expire_time=res.expire_time;
                        this.buyDialog.message='支付成功';
                        this.buyDialog.status=1;
                    }
                });
            }
        },
        checkTransactionId:function (){
            let postdata={
                pack:this.buyDialog.row.pack,
                transaction_id:this.buyDialog.transaction_id
            };
            Yunqi.ajax.get('addons/checkTransactionId',postdata).then(res=>{
                this.buyDialog.status=res.status;
                this.buyDialog.expire_time=res.expire_time;
                if(res.status==0){
                    this.buyDialog.message='交易单号不存在';
                }else{
                    if(res.expire_time>0){
                        this.buyDialog.message=formatTime(res.expire_time)+'过期';
                    }else{
                        this.buyDialog.message='交易单号已经过期';
                    }
                }
            });
        },
        closeBuyDialog:function () {
            this.buyDialog={
                show:false,
                out_trade_no:'',
                transaction_id:'',
                expire_time:0,
                status:0,
                message:'',
                code_url:'',
                row:''
            }
        },
        installAddon:function(row)
        {
            Yunqi.ajax.post('addons/install',{key:row.key}).then(res=>{
                this.$refs.yuntable.reload();
            });
        },
        uninstallAddon:function(row)
        {
            let that=this;
            Yunqi.api.open({
                title: __('卸载扩展'),
                url: 'addons/uninstall?key='+row.key,
                icon:'fa fa-remove',
                close:function (r) {
                    if(r){
                        that.$refs.yuntable.reload();
                    }
                }
            });
        },
        uninstall:function (){
            let key=this.$refs.yunform.getValue('key');
            let actions=this.$refs.yunform.getValue('actions');
            Yunqi.ajax.post('addons/uninstall',{key:key,actions:actions}).then(res=>{
                 Yunqi.api.closelayer(Yunqi.config.window.id,true);
            });
        },
        delAddon:function (row){
            let that=this;
            Yunqi.confirm('删除扩展将会清空掉所有文件，重新下载扩展可能会再次收取费用，你确定要删除吗？','提醒').then(res=>{
                Yunqi.ajax.post('addons/del',{key:row.key}).then(res=>{
                    that.$refs.yuntable.reload();
                });
            });
        },
        createAddon:function(){
            let that=this;
            Yunqi.api.open({
                title: __('创建本地扩展'),
                url: 'addons/create',
                icon:'fa fa-plus',
                close:function (r) {
                    if(r){
                        that.$refs.yuntable.reload();
                    }
                }
            });
        }
    }
}