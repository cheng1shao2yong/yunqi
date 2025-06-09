const template=`
    <div class="toolBar-icon font-size-icon hide-800" @click="drawerVisible=!drawerVisible">
         <i class="fa fa-gears"></i>  
    </div>
    <el-drawer v-model="drawerVisible" title="布局设置" size="300px">
        <!-- 布局切换 -->
        <el-divider class="divider" content-position="center">
          布局切换
        </el-divider>
        <div class="layout-box mb30">
          <el-tooltip effect="dark" content="纵向" placement="top" :show-after="200">
            <div @click="changeLayout('vertical');" :class="['layout-item layout-vertical', { 'is-active': elementUi.layout == 'vertical' }]">
              <div class="layout-light-top"></div>
              <div class="layout-container">
                <div class="layout-light"></div>
                <div class="layout-content"></div>
              </div>
              <i class="fa fa-check-circle" v-if="elementUi.layout == 'vertical'"></i>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="经典" placement="top" :show-after="200">
            <div @click="changeLayout('classic');" :class="['layout-item layout-classic', { 'is-active': elementUi.layout == 'classic' }]">
              <div class="layout-dark"></div>
              <div class="layout-container">
                <div class="layout-light"></div>
                <div class="layout-content"></div>
              </div>
              <i class="fa fa-check-circle" v-if="elementUi.layout == 'classic'"></i>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="横向" placement="top" :show-after="200">
            <div @click="changeLayout('transverse');" :class="['layout-item layout-transverse', { 'is-active': elementUi.layout == 'transverse' }]">
              <div class="layout-dark"></div>
              <div class="layout-content"></div>
              <i class="fa fa-check-circle" v-if="elementUi.layout == 'transverse'"></i>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="分栏" placement="top" :show-after="200">
            <div @click="changeLayout('columns');" :class="['layout-item layout-columns', { 'is-active': elementUi.layout == 'columns' }]">
              <div class="layout-dark"></div>
              <div class="layout-light"></div>
              <div class="layout-content"></div>
              <i class="fa fa-check-circle" v-if="elementUi.layout == 'columns'"></i>
            </div>
          </el-tooltip>
        </div>
        <!-- 全局主题 -->
        <el-divider class="divider" content-position="center">
          全局主题
        </el-divider>
         <div class="theme-item">
          <span>暗黑模式</span>
          <el-switch v-model="elementUi.dark" @change="changeElementUi('dark')"></el-switch>
        </div>
        <div class="theme-item">
          <span>主题颜色</span>
          <el-color-picker v-model="elementUi.theme_color" :predefine="colorList" @change="changeThemeColor"></el-color-picker>
        </div>
        <div class="theme-item">
          <span>语言文字</span>
          <el-select v-model="elementUi.language" @change="changeElementUi('language')" style="width: 160px">
            <el-option v-for="(lan,key) in elementUi.language_list" :label="lan" :key="key" :value="key">{{lan}}</el-option>
          </el-select>
        </div>
        <!-- 界面设置 -->
        <el-divider class="divider" content-position="center" style="margin-top: 40px">
          界面设置
        </el-divider>
        <template v-if="elementUi.layout!='transverse'">
        <div class="theme-item">
          <span>折叠菜单</span>
          <el-switch v-model="elementUi.is_menu_collapse" @change="changeElementUi('is_menu_collapse')"></el-switch>
        </div>
        <div class="theme-item">
          <span>面包屑</span>
          <el-switch v-model="elementUi.breadcrumb" @change="changeElementUi('breadcrumb')"></el-switch>
        </div>
        </template>
        <div class="theme-item">
          <span>标签栏</span>
          <el-switch v-model="elementUi.tabs" @change="changeElementUi('tabs')"></el-switch>
        </div>
        <div class="theme-item">
          <span>页脚</span>
          <el-switch v-model="elementUi.footer" @change="changeElementUi('footer')"></el-switch>
        </div>
    </el-drawer>
`;
export default {
    name: "ThemeSetting",
    data: function () {
        return {
            elementUi:'',
            drawerVisible:false,
            primary:'',
            colorList:[]
        }
    },
    created:function (){
        this.elementUi=Yunqi.getElementUi();
        this.colorList=[
            this.elementUi.theme_color,
            "#daa96e",
            "#0c819f",
            "#409eff",
            "#27ae60",
            "#ff5c93",
            "#e74c3c",
            "#fd726d",
            "#f39c12",
            "#9b59b6"
        ]
    },
    template:template,
    methods:{
        changeLayout:function (value){
            this.postData('layout',value,function(){
                location.reload();
            });
        },
        changeElementUi:function (key){
            let value=this.elementUi[key];
            let callback=false;
            if(key=='language'){
                callback=function (){
                    location.reload();
                };
            }
            if(key=='dark'){
                let win=this.getAppsWindow();
                callback=function (){
                    Yunqi.app.changeLogo();
                    if(value){
                        document.documentElement.classList.add('dark');
                        for(let i=0;i<win.length;i++){
                            win[i].document.documentElement.classList.add('dark');
                        }
                    }else{
                        document.documentElement.classList.remove('dark');
                        for(let i=0;i<win.length;i++){
                            win[i].document.documentElement.classList.remove('dark');
                        }
                    }
                };
            }
            if(key=='footer' || key=='tabs'){
                callback=function (){
                    Yunqi.app.setMainContentFrame();
                };
            }
            this.postData(key,value,callback);
        },
        changeThemeColor:function (value){
            let win=this.getAppsWindow();
            this.postData('theme_color',value,function(){
                Yunqi.setThemeColor();
                for(let i=0;i<win.length;i++){
                    win[i].Yunqi.config.elementUi.theme_color=value;
                    win[i].Yunqi.setThemeColor();
                }
            });
        },
        getAppsWindow:function (){
            let tab=Yunqi.app.tabList;
            let layer=Yunqi.app.layerList;
            let doc=[];
            for (let i=0;i<tab.length;i++){
                let id=tab[i].id;
                let _doc=document.querySelector('iframe[id="addtabs-'+id+'"]');
                if(_doc){
                    doc.push(_doc.contentWindow);
                }
            }
            for (let i=0;i<layer.length;i++){
                let id=layer[i].id;
                let _doc=document.querySelector('iframe[id="layer-'+id+'"]');
                if(_doc){
                    doc.push(_doc.contentWindow);
                }
            }
            return doc;
        },
        postData:function (key,value,callback){
            this.elementUi[key]=value;
            Yunqi.ajax.post(Yunqi.config.baseUrl+'change-theme', {key:key,value:value},false,false).then(res=>{
                if(callback){
                    callback();
                }
            });
        }
    }
};
