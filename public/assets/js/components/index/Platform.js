const template=`
   <el-dropdown class="toolBar-dropdown hide-800" placement="bottom">
      <div class="platform">
         {{active}}&nbsp;<i class="fa fa-chevron-down"></i>
      </div> 
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(item,index) in platform" :disabled="item.active?true:false" @click="goPlatform(item)">{{item.title}}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
`;
export default {
    name: "Platform",
    data: function () {
        return {
            active:'',
            platform:Yunqi.data.platform
        }
    },
    props:{

    },
    created(){
        let platform=Yunqi.data.platform;
        for(let i=0;i<platform.length;i++){
            if(platform[i].active){
                this.active=platform[i].title;
            }
        }
    },
    template:template,
    methods:{
        goPlatform:function (item){
            Yunqi.ajax.get('platform',{id:item.id},true,false).then(res=>{
                location.href=Yunqi.config.baseUrl+'index';
            });
        }
    }
};
