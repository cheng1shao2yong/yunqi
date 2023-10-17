import menulist from "./components/index/Menulist.js";
import breadcrumb from "./components/index/Breadcrumb.js";
import tabs from "./components/index/Tabs.js";
import themesetting from "./components/index/ThemeSetting.js";
import message from "./components/index/Message.js";
import fullscreen from "./components/index/Fullscreen.js";
import trash from "./components/index/Trash.js";
import userinfo from "./components/index/Userinfo.js";
const findBreadcrumbById=function(tree, targetId, result = []) {
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.id === targetId) {
            result.push(node);
            if (node.pid !== 0) {
                findBreadcrumbById(tree, node.pid, result);
            }
            break;
        } else if (node.childlist.length > 0) {
            findBreadcrumbById(node.childlist, targetId, result);
            if (result.length > 0) {
                result.push(node);
                break;
            }
        }
    }
    return result.reverse();
}
const findTabsMenu=function(menu)
{
    if(menu.childlist.length===0){
        return menu;
    }
    let r;
    if(menu.childlist.length>0){
        for(let i in menu.childlist){
            r=findTabsMenu(menu.childlist[i]);
            if(r.childlist.length===0){
                break;
            }
        }
    }
    return r;
}
const inJson=function(json, id) {
    for (var i = 0; i < json.length; i++) {
        if (json[i].id === id) {
            return true;
        } else if (json[i].childlist && json[i].childlist.length > 0) {
            if (inJson(json[i].childlist, id)) {
                return true;
            }
        }
    }
    return false;
}
const findChildMenu=function (menu){
    for(let i_0=0;i_0<Yunqi.data.menulist.length;i_0++){
        if(Yunqi.data.menulist[i_0].id==menu.id){
            return Yunqi.data.menulist[i_0].childlist;
        }else if(Yunqi.data.menulist[i_0].childlist.length>0){
            let menulist1=Yunqi.data.menulist[i_0].childlist;
            for(let i_1=0;i_1<menulist1.length;i_1++){
                if(menulist1[i_1].id==menu.id){
                    return menulist1;
                }else if(menulist1[i_1].childlist.length>0){
                    if(inJson(menulist1[i_1].childlist,menu.id)){
                        return menulist1;
                    }
                }
            }
        }
    }
}
export default{
    components:{
        'Menulist':menulist,
        'Breadcrumb':breadcrumb,
        'Tabs':tabs,
        'ThemeSetting':themesetting,
        'Message':message,
        'Fullscreen':fullscreen,
        'Trash':trash,
        'Userinfo':userinfo
    },
    data(){
        return {
            documentWidth:'',
            contentWidth:'',
            contentHeight:'',
            menuHeight: '',
            layerExpandHeight:0,
            elementUi:'',
            menuList:[],
            childMenuList:[],
            breadcrumb:[],
            activeMenu:'',
            layerList:[],
            tabList:[],
            imageList:[],
            mainFrameExpand:false
        }
    },
    onLoad:function (){
        this.elementUi=Yunqi.getElementUi();
        this.menuList=Yunqi.data.menulist;
        this.initMainContentFrame();
    },
    onShow:function (){
        this.clickMenu(Yunqi.data.selected);
        if(Yunqi.data.referer.url){
            this.clickMenu(Yunqi.data.referer);
        }
    },
    methods:{
        initMainContentFrame:function (){
            this.setMainContentFrame();
            //监听屏幕宽度变化
            window.addEventListener('resize',()=>{
                let contentWidth=document.documentElement.clientWidth;
                if(contentWidth<800){
                    this.elementUi.is_menu_collapse=true;
                }else{
                    this.elementUi.is_menu_collapse=false;
                }
                this.setMainContentFrame();
            });
        },
        setMainContentFrame:function (){
            let documentWidth=document.documentElement.clientWidth;
            let contentWidth=document.documentElement.clientWidth;
            if(documentWidth>600){
                contentWidth=contentWidth-25;
                if(this.elementUi.layout=='vertical' || this.elementUi.layout=='classic'){
                    if(this.elementUi.is_menu_collapse){
                        contentWidth=contentWidth-65;
                    }else{
                        contentWidth=contentWidth-210;
                    }
                }
                if(this.elementUi.layout=='columns'){
                    contentWidth=contentWidth-70;
                    if(this.childMenuList.length>0 && this.elementUi.is_menu_collapse){
                        contentWidth=contentWidth-65;
                    }
                    if(this.childMenuList.length>0 && !this.elementUi.is_menu_collapse){
                        contentWidth=contentWidth-210;
                    }
                }
            }
            let contentHeight=document.documentElement.clientHeight-75;
            if(this.elementUi.tabs){
                contentHeight=contentHeight-40;
            }
            if(this.elementUi.footer){
                contentHeight=contentHeight-32;
            }
            let menuHeight=document.documentElement.clientHeight-55;
            let layerExpandHeight=document.documentElement.clientHeight-92;
            this.parseZoom(documentWidth,contentWidth,contentHeight,menuHeight,layerExpandHeight);
        },
        parseZoom:function (documentWidth,contentWidth,contentHeight,menuHeight,layerExpandHeight){
            let zoom=1;
            this.documentWidth=documentWidth/zoom;
            this.contentWidth=contentWidth/zoom;
            this.contentHeight=contentHeight/zoom;
            this.menuHeight=menuHeight/zoom;
            this.layerExpandHeight=layerExpandHeight/zoom;
        },
        isChildMenu:function (id){
            let breadcrumb=findBreadcrumbById(Yunqi.data.menulist,this.activeMenu.id,[]);
            for(let i in breadcrumb){
                if(id==breadcrumb[i].id){
                    return true;
                }
            }
            return false;
        },
        layerExpand:function (layer){
            layer.expand=!layer.expand;
            let tab=document.getElementById('layer-'+layer.id).contentWindow;
            tab.Yunqi.app.setContentHeight_();
        },
        maximize:function (){
            let id=this.activeMenu.id;
            let tab=document.getElementById('addtabs-'+id).contentWindow;
            let expand=tab.document.getElementById('mainFrameExpand');
            if(expand){
                expand.click();
            }else{
                this.mainFrameExpand=true;
            }
            tab.Yunqi.app.setContentHeight_();
        },
        minimize:function (){
            let id=this.activeMenu.id;
            let tab=document.getElementById('addtabs-'+id).contentWindow;
            let expand=tab.document.getElementById('mainFrameExpand');
            if(expand){
                expand.click();
            }else{
                this.mainFrameExpand=false;
            }
            tab.Yunqi.app.setContentHeight_();
        },
        expand:function(){
            this.mainFrameExpand=true;
            let id=this.activeMenu.id;
            let tab=document.getElementById('addtabs-'+id).contentWindow;
            tab.Yunqi.app.setContentHeight_();
        },
        compress:function () {
            this.mainFrameExpand=false;
            let id=this.activeMenu.id;
            let tab=document.getElementById('addtabs-'+id).contentWindow;
            tab.Yunqi.app.setContentHeight_();
        },
        setBreadcrumb:function (){
            if(this.activeMenu.id==Yunqi.data.selected.id){
                this.breadcrumb=[Yunqi.data.selected];
            }else{
                let breadcrumb=findBreadcrumbById(Yunqi.data.menulist,this.activeMenu.id,[]);
                breadcrumb.unshift(Yunqi.data.selected);
                this.breadcrumb=breadcrumb;
            }
        },
        onBreadcrumbClick:function (){

        },
        changeSubMenu:function (menu){
            this.clickMenu(findTabsMenu(menu));
        },
        clickMenu:function (menu){
            if(menu.menutype=='addtabs'){
                this.addTabs(menu);
            }
            if(menu.menutype=='layer'){
                this.openLayer(menu);
            }
            if(menu.menutype=='blank'){
                window.open(menu.url,"_blank");
            }
            if(this.documentWidth<=600){
                this.elementUi.is_menu_collapse=true;
            }
        },
        openLayer:function(menu){
            if(this.documentWidth<=600){
                menu.expand=true;
            }
            let list=this.layerList;
            //如果已经显示了就返回，并找到要隐藏的layer
            let index=-1;
            for(let i in list){
                if(list[i].id==menu.id && list[i].show){
                    return;
                }
                if(list[i].id==menu.id){
                    index=i;
                }
            }
            if(index!=-1){
                list[index].show=true;
                let app=Yunqi.getApp(list[index].id);
                app && app.onShow();
            }
            if(index==-1){
                menu.show=true;
                list.push(menu);
            }
            this.$refs.tabs.tabAdd(menu);
        },
        hideLayer:function (layer){
            layer.show=false;
            let app=Yunqi.getApp(layer.id);
            app && app.onHide();
            let list=this.layerList;
            for(let i=list.length;i>0;i--){
                let j=i-1;
                if(list[j].show){
                    this.$refs.tabs.tabAdd(list[j]);
                    return;
                }
            }
            this.$refs.tabs.tabAdd(this.activeMenu);
        },
        closeLayer:function(id,data){
            let index=-1;
            let menu;
            let list=this.layerList;
            for(let i=0;i<list.length;i++){
                if(id && list[i].id==id){
                    index=i;
                    menu=list[i];
                }
                if(!id && list[i].show){
                    index=i;
                    menu=list[i];
                }
            }
            if(index!=-1){
                menu.show=false;
                let app=Yunqi.getApp(menu.id);
                app && app.onUnload();
                menu.close(data);
                list.splice(index,1);
                this.$refs.tabs.tabRemove(menu);
                for(let i=list.length;i>0;i--){
                    let j=i-1;
                    if(list[j].show){
                        this.$refs.tabs.tabAdd(list[j]);
                        return;
                    }
                }
                this.$refs.tabs.tabAdd(this.activeMenu);
            }
        },
        calculateLayerIndex:function(index){
            let list=this.layerList;
            let r=-1;
            for(let i=0;i<list.length;i++){
                if(list[i].show){
                    r=i;
                    break;
                }
            }
            if(index<=r){
                return true;
            }
            return false;
        },
        addTabs:function (menu){
            //弹窗模式下禁止增加tab
            for(let i=0;i<this.layerList.length;i++){
                if(this.layerList[i].show){
                    Yunqi.message.errors(__('请先关闭弹窗'));
                    return;
                }
            }
            if(this.activeMenu.id==menu.id){
                return;
            }
            let list=this.tabList;
            let showIndex=-1;
            for(let i in list){
                if(list[i].id==menu.id){
                    showIndex=i;
                }
            }
            //触发onHide事件
            if(this.activeMenu){
                let last=document.getElementById('addtabs-'+this.activeMenu.id);
                last.style.display='none';
                let app=Yunqi.getApp(this.activeMenu.id);
                app && app.onHide();
            }
            //已经存在tab
            if(showIndex!=-1){
                let active=document.getElementById('addtabs-'+menu.id);
                if(active){
                    active.style.display='block';
                }
                let app=Yunqi.getApp(menu.id);
                app && app.onShow();
            }
            if(showIndex==-1){
                let iframe=document.createElement("iframe");
                iframe.id="addtabs-"+menu.id;
                iframe.src=menu.url;
                iframe.style='border:0px;margin:0;padding:0;';
                iframe.border='0';
                iframe.scrollingX='no';
                iframe.scrollingY='auto';
                iframe.allowTransparency='yes';
                document.getElementById('main-content').appendChild(iframe);
                list.push(menu);
            }
            this.activeMenu=menu;
            if(this.elementUi.layout=='columns'){
                this.childMenuList=findChildMenu(menu);
                this.setMainContentFrame();
            }
            //修改地址栏
            let url=menu.url;
            if(url.indexOf('?')!=-1){
                url+='&ref=addtabs';
            }else{
                url+='?ref=addtabs';
            }
            history.pushState({},0,url);
            this.$refs.tabs.tabAdd(menu);
            this.setBreadcrumb();
        },
        closeTabs:function (id,callback){
            //弹窗模式下禁止增加tab
            for(let i=0;i<this.layerList.length;i++){
                if(this.layerList[i].show){
                    Yunqi.message.errors(__('请先关闭弹窗'));
                    return;
                }
            }
            let list=this.tabList;
            let index=-1;
            let menu;
            for(let i=0;i<list.length;i++){
                if(id && list[i].id==id){
                    index=i;
                    menu=list[i];
                }
            }
            if(index!=-1){
                let app=Yunqi.getApp(id);
                app && app.onUnload();
                list.splice(index,1);
                document.getElementById('addtabs-'+id).remove();
                this.activeMenu='';
                this.$refs.tabs.tabRemove(menu);
                menu.close && menu.close(callback);
            }
        },
        previewImg:function (img){
            if(typeof img=='string'){
                img=img.split(',');
            }
            this.imageList=img;
        }
    }
}