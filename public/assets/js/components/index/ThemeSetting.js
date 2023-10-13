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
        <div class="theme-item">
          <span>折叠菜单</span>
          <el-switch v-model="elementUi.is_menu_collapse" @change="changeElementUi('is_menu_collapse')"></el-switch>
        </div>
        <div class="theme-item">
          <span>面包屑</span>
          <el-switch v-model="elementUi.breadcrumb" @change="changeElementUi('breadcrumb')"></el-switch>
        </div>
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
        changeLayout:function (key){
            let layout=Yunqi.getElementUi()[key];
            if(layout==key){
                return;
            }
            localStorage['elementUi.layout']=key;
            document.cookie='layout='+key;
            location.reload();
        },
        changeElementUi:function (key){
            localStorage['elementUi.'+key]=this.elementUi[key];
            if(key=='footer' || key=='tabs' || key=='dark'){
                location.reload();
            }
            if(key=='language'){
                document.cookie='think_var='+this.elementUi.language;
                location.reload();
            }
        },
        changeThemeColor:function (val){
            localStorage['elementUi.theme_color']=val;
            Yunqi.setThemeColor();
        }
    }
};
