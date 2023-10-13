import form from "../../components/Form.js";
import {inArray} from "../../util.js";
export default{
    components:{
        'YunForm':form,
    },
    data:{
        activeTab:'add',
        ishideform:false,
        columns:[
            /*
             * edit有两种写法，包括object完整写法与string简写
             * 详细查看【https://48rmn452q3.k.topthink.com/@48rmwkl52q/tongyongbiaodan.html#4edit属性】
             * rules有4种写法，string简写，function函数，object对象，array数组
             * 详细查看【https://48rmn452q3.k.topthink.com/@48rmwkl52q/tongyongbiaodan.html#5rules写法】
             */
            {"field":"id","title":"ID","edit":"hidden",step:0},
            {"field":"username","title":"姓名","edit":"text",rules:"required;length(2~10);chinaChar",step:0},
            {"field":"avatar","title":"头像","edit":"image",step:0},
            {"field":"user_id","title":"绑定用户","edit":{form:"selectpage",url:"user/index/index",keyField:"id",labelField:"nickname"},step:0},
            //step属性作用于分步骤表单，从0开始计数
            {"field":"entrytime","title":"入职日期","edit":"date",step:1},
            //通过edit的完整写法可以设置默认值
            {"field":"hobby","title":"爱好","edit":{form:"checkbox",value:['read']},searchList: {read:"阅读",swim:"游泳",climb:"攀登",football:"足球",beauty:"美女"},step:1},
            //获取后台通过 $this->assign('level',DemoModel::LEVEL)传递的参数level
            {"field":"sex","title":"性别","edit":{form:'radio',value:1},searchList: {1:'男',2:'女'},rules:"required",step:1},
            {"field":"education","title":"学历","edit":"select",searchList: Yunqi.data.education,rules:"required",step:1},
            {"field":"description","title":"介绍","edit":"textarea",step:2},
            {"field":"status","title":"状态","edit":"switch",searchList:{'normal':'正常','hidden':'隐藏'},step:2},
        ],
        rows: {
            id:1,
            username:'张三',
            user_id:1,
            entrytime:'2023-12-01',
            hobby:['football','read','swim','climb'],
            sex:2,
            education:2,
            description:'简单介绍',
            avatar:'/assets/img/avatar.jpg',
        },
        steps:['第一步','第二步','第三步']
    },
    onLoad:{

    },
    methods: {
        //提交时候触发，返回false则终止提交
        onSubmit:function (rows){
            console.log(rows);
            let formname=this.activeTab+'form';
            if(this.activeTab=='add' || this.activeTab=='edit' || this.activeTab=='step'){
                if(!inArray(rows.hobby,'beauty')){
                    //手动定位错误
                    this.$refs[formname].setError('hobby',rows.username+'爱好美女,请勾选美女');
                    Yunqi.message.error(rows.username+'爱好美女,请勾选美女');
                    return false;
                }
            }
            if(this.activeTab=='footer' || this.activeTab=='slot'){
                return false;
            }
            if(this.activeTab=='append'){
                rows.test2='追加表单项2';
                rows.test3='追加表单项3';
            }
            return true;
        },
        //后台返回error时触发
        onFail: function (){

        },
        //后台返回success时触发
        onSuccess:function (){
            //重置表单
            this.$refs.addform.reset();
        },
        //点击上一步或下一步时触发
        onStep:function (step){

        },
        submit:function (){
            this.$refs.footerform.submit();
        },
        //隐藏表单项目
        hideFormItem:function (){
            let formname=this.activeTab+'form';
            //隐藏一项
            this.$refs[formname].hideField('username');
            //隐藏多项
            this.$refs[formname].hideField(['avatar','user_id']);
            this.ishideform=true;
        },
        //显示表单项目
        showFormItem:function (){
            let formname=this.activeTab+'form';
            //显示一项
            this.$refs[formname].showField('username');
            //显示多项
            this.$refs[formname].showField(['avatar','user_id']);
            this.ishideform=false;
        },
        //获取表单项目
        getFormItem:function (){
            let formname=this.activeTab+'form';
            let content='';
            for(let key in this.rows){
                content+=key+'的值为：'+this.$refs[formname].getValue(key)+'<br>';
            }
            Yunqi.alert(content,'', {
                dangerouslyUseHTMLString: true,
            });
        },
        //设置表单项目
        setFormItem:function (){
            let formname=this.activeTab+'form';
            let username=this.$refs[formname].getValue('username');
            if(username=='黑娃'){
                this.$refs[formname].setValue('username','老赵');
                this.$refs[formname].setValue('hobby',[]);
            }else{
                this.$refs[formname].setValue('username','黑娃');
                this.$refs[formname].setValue('hobby',['football','read','swim','climb']);
            }
        },
        //修改表单属性
        changeFormItem:function (){
            let formname=this.activeTab+'form';
            let username=this.$refs[formname].getValue('username');
            if(username=='黑娃'){
                this.$refs[formname].setField('username','title','姓名');
                this.$refs[formname].setField('username','edit',{form:'input',type:'text',value:''});
            }else{
                this.$refs[formname].setField('username','title','用户昵称');
                this.$refs[formname].setField('username','edit',{form:'input',type:'text',value:'黑娃',readonly:true});
            }
        },
        showCode:function (){
            Yunqi.api.open({
                url:'demo/code/show?name=Form',
                title:'显示代码',
                icon:'fa fa-list',
                expand:true,
                close:()=>{
                    this.activeTab='add';
                }
            });
        }
    }
}