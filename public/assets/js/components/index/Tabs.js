const template=`
   <div class="tabs-box">
    <div class="tabs-menu">
      <el-tabs v-model="tabsMenuValue" type="card" @tab-change="showMenu">
        <el-tab-pane v-for="(item,index) in tabsMenuList" :key="item.id" :label="item.title" :name="item.id">
          <template #label>
            <i :class="['tabs-icon',item.icon]"></i>
            {{ item.title }}
            <i @click.stop="closeMenuByIcon(item)" class="fa fa-remove tabs-icon-remove" v-if="index>0"></i>
          </template>
        </el-tab-pane>
      </el-tabs>
      <el-dropdown trigger="click" :teleported="false">
        <el-button size="small" type="primary">
          <span>${__('更多')}</span>
          &nbsp;<i class="fa fa-angle-down"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="refresh">
             <i class="fa fa-refresh"></i>&nbsp;${__('刷新页面')}
            </el-dropdown-item>
            <el-dropdown-item @click="maximize">
             <i class="fa fa-window-maximize"></i>&nbsp;${__('最大化')}
            </el-dropdown-item>
            <el-dropdown-item divided @click="closeCurrentTab">
             <i class="fa fa-caret-square-o-right"></i>&nbsp;${__('关闭当前')}
            </el-dropdown-item>
            <el-dropdown-item @click="closeOtherTab">
             <i class="fa fa-minus-square"></i>&nbsp;${__('关闭其他')}
            </el-dropdown-item>
            <el-dropdown-item @click="closeAllTab">
              <i class="fa fa-window-close"></i>&nbsp;${__('关闭所有')}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
`;
export default {
    name: "Tabs",
    data: function () {
        return {
            elementUi:'',
            tabsMenuValue:'',
            tabsMenuList:[],
            loading:false
        }
    },
    props:{

    },
    created:function (){
        this.elementUi=Yunqi.getElementUi();
    },
    template:template,
    methods:{
        //私有方法，当最小化弹出菜单时，显示旁边一个菜单
        refresh:function (){
            let id=Yunqi.app.activeMenu.id;
            let win=document.getElementById('addtabs-'+id).contentWindow;
            win.location.reload();
        },
        //私有方法
        maximize:function (){
            Yunqi.app.maximize();
        },
        //私有方法
        closeCurrentTab:function (){
            if(this.tabsMenuList.length==1){
                return;
            }
            for(let i=0;i<this.tabsMenuList.length;i++){
                if(this.tabsMenuList[i].id==this.tabsMenuValue && i===0){
                    Yunqi.message.error(__('首页不能关闭'));
                    return;
                }
                if(this.tabsMenuList[i].id==this.tabsMenuValue){
                    this.closeMenu(this.tabsMenuList[i]);
                    continue;
                }
            }
            let lastmenu;
            for(let i=0;i<this.tabsMenuList.length;i++){
                if(this.tabsMenuList[i].menutype=='addtabs'){
                    lastmenu=this.tabsMenuList[i];
                }
            }
            if(lastmenu){
                Yunqi.app.addTabs(lastmenu);
            }
        },
        //私有方法
        closeOtherTab:function (){
            let r=[];
            for(let i=0;i<this.tabsMenuList.length;i++){
                if(i===0){
                    continue;
                }
                if(this.tabsMenuList[i].id==this.tabsMenuValue){
                    continue;
                }
                r.push(this.tabsMenuList[i]);
            }
            for(let k in r){
                this.closeMenu(r[k]);
            }
        },
        //私有方法
        closeAllTab:function (){
            let r=[];
            for(let i=0;i<this.tabsMenuList.length;i++){
                if(i===0){
                    Yunqi.app.addTabs(this.tabsMenuList[0]);
                    continue;
                }
                r.push(this.tabsMenuList[i]);
            }
            for(let k in r){
                this.closeMenu(r[k]);
            }
        },
        //私有方法
        showMenu:function (id){
            this.tabsMenuList.forEach(menu=>{
                if(menu.id==id){
                    if(menu.menutype=='addtabs'){
                        Yunqi.app.addTabs(menu);
                    }
                    if(menu.menutype=='layer'){
                        Yunqi.app.openLayer(menu);
                    }
                }
            });
        },
        //私有方法
        closeMenu:function (menu){
            if(menu.menutype=='addtabs'){
                Yunqi.app.closeTabs(menu.id);
            }
            if(menu.menutype=='layer'){
                Yunqi.app.closeLayer(menu.id);
            }
        },
        //私有方法
        closeMenuByIcon:function (menu){
            if(this.tabsMenuValue==menu.id){
                this.closeCurrentTab();
            }else{
                this.closeMenu(menu);
            }
        },
        //外部方法，禁止内部使用
        tabAdd:function (menu){
            let isIn=false;
            this.tabsMenuList.forEach(res=>{
                if(res.id==menu.id){
                    this.tabsMenuValue=menu.id;
                    isIn=true;
                }
            });
            if(!isIn){
                document.cookie='window-id='+menu.id;
                document.cookie='window-type='+menu.menutype;
                this.tabsMenuValue=menu.id;
                this.tabsMenuList.push(menu);
            }
        },
        //外部方法，禁止内部使用
        tabRemove:function (menu){
            let index=-1;
            for(let i=0;i<this.tabsMenuList.length;i++){
                if(this.tabsMenuList[i].id==menu.id){
                    index=i;
                }
            }
            if(index!=-1){
                this.tabsMenuList.splice(index,1);
            }
        },
    }
};
