const template=`
<el-dropdown class="toolBar-dropdown" trigger="hover" placement="bottom-end">
    <div class="userinfo">
        <span class="username">{{admin.nickname}}</span>
        <div class="avatar">
          <img :src="admin.avatar" alt="avatar" />
        </div>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click.stop="userinfo">
          <i class="fa fa-user-circle-o"></i> 个人资料
        </el-dropdown-item>
        <el-dropdown-item divided @click.stop="loginOut">
           <i class="fa fa-sign-out"></i> 退出登陆
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
</el-dropdown>
`;
export default {
    name: "Userinfo",
    data: function () {
        return {
            elementUi:''
        }
    },
    created:function (){

    },
    props:{
        admin: {
            type: Object,
            required: true,
        }
    },
    template:template,
    methods:{
        userinfo:function (){
            Yunqi.api.addtabs({
                id:8,
                url:Yunqi.config.baseUrl+'general/profile/index',
                title:'个人资料',
                icon:'fa fa-user',
            });
        },
        loginOut:function (){
            location.href=Yunqi.config.baseUrl+'logout';
        }
    }
};
