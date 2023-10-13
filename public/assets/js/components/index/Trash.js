const template=`
   <el-dropdown class="toolBar-dropdown hide-800" trigger="click" placement="bottom">
    <div class="icon-only font-size-icon">
        <i class="fa fa-trash"></i>
    </div> 
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="wipeAllCache"> 
          <i class="fa fa-trash"></i>&nbsp;&nbsp;${__('一键清除缓存')}
        </el-dropdown-item>
        <el-dropdown-item divided @click="wipeContentCache">
           <i class="fa fa-file-text"></i>&nbsp;&nbsp;${__('清除内容缓存')}
        </el-dropdown-item>
        <el-dropdown-item @click="wipeTemplateCache">
           <i class="fa fa-file-image-o"></i>&nbsp;&nbsp;${__('清除模板缓存')}
        </el-dropdown-item>
         <el-dropdown-item  @click="wipeBrowserCache">
           <i class="fa fa-chrome"></i>&nbsp;&nbsp;${__('清除浏览器缓存')}
            <el-tooltip
                effect="dark"
                content="${__('清除浏览器端静态JS、CSS、图片等资源')}"
                placement="top">
                <i class="fa fa-info-circle"></i>
            </el-tooltip>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
    </el-dropdown>
`;
export default {
    name: "Trash",
    data: function () {
        return {

        }
    },
    props:{

    },
    template:template,
    methods:{
        wipeAllCache:function (){
            this.postData('all');
        },
        wipeContentCache:function (){
            this.postData('content');
        },
        wipeTemplateCache:function (){
            this.postData('template');
        },
        wipeBrowserCache:function (){
            this.postData('browser');
        },
        postData:function (type){
            Yunqi.ajax.get('ajax/wipecache',{type:type},true,false).then(res=>{
                Yunqi.message.success(__('清理完成'));
                setTimeout(function (){
                    location.reload();
                },1500);
            }).catch(err=>{
                if(!err.msg){
                    Yunqi.message.error(__('清理失败'));
                }
            });
        }
    }
};
