const __=function (key,data) {
    if(!key || typeof key!='string'){
        return '';
    }
    let r=key.toLowerCase();
    r=Yunqi.config.locale[r] || key;
    for(let i in data){
        r=r.replace('%'+i,data[i])
    }
    return r;
};
window.Yunqi=(function(){
    let elloading;
    let rand=function(n,m){
        return Math.floor(Math.random() * (m - n + 1)) + n;
    }
    let showLoading=function () {
        elloading=Yunqi.loading({text:'请求中..'});
    }
    let request=function(type, url, obj, loading,showmsg,all=false){
        if(!url){
            throw new Error('url不能为空');
            return;
        }
        if(!url.startsWith('http') && !url.startsWith('/')){
            url=Yunqi.config.baseUrl+url;
        }
        let headers={
            'content-type':'application/x-www-form-urlencoded; charset=UTF-8',
            'x-requested-with':'XMLHttpRequest'
        }
        let pro = new Promise((resolve, reject) => {
            if(type=='get'){
                if(obj){
                    let str='';
                    for(var i in obj){
                        if(obj[i] instanceof Array){
                            obj[i]=obj[i].join(',');
                        }
                        str+='&'+i+'='+obj[i];
                    }
                    if(url.indexOf('?')==-1){
                        url=url+'?'+str.slice(1);
                    }else{
                        url+=str;
                    }
                }
            }
            if(type=='json'){
                headers['content-type']='application/json';
            }
            if(loading){
                showLoading();
            }
            axios({
                url: url,
                data: obj,
                method: type,
                headers:headers
            }).then(response=>{
                if (loading) {
                    elloading.close();
                }
                if (response.status == 200) {
                    let res=response.data;
                    //表格数据
                    if(res.rows && res.total!==undefined){
                        resolve(res);
                    }else if (res.code === 1) {
                        let msg=res.msg || __('操作完成')
                        if (showmsg) {
                            Yunqi.message.success(msg);
                        }
                        resolve(res.data);
                    }else if (res.code === 0) {
                        let msg=res.msg || '';
                        if (msg) {
                            Yunqi.message.error(msg);
                        }
                        reject(res);
                    }else if(all){
                        resolve(res);
                    }else{
                        Yunqi.message.error('未知数据');
                    }
                }
            }).catch(err=>{
                if (loading) {
                    elloading.close();
                }
                Yunqi.message.error(err.response.data);
                reject();
            });
        });
        return pro;
    }
    function SupposeClass(){
        //系统配置
        this.config='';
        //系统变量
        this.data='';
        //系统权限
        this.auth='';
        //page应用
        this.app='';
        this.formatter={
            text:{
                _name:'text'
            },
            html:{
                _name:'html'
            },
            image:{
                _name:'image',
            },
            images:{
                _name:'images',
            },
            link:{
                _name:'link'
            },
            datetime:{
                _name:'datetime'
            },
            date:{
                _name:'date'
            },
            tag:{
                _name:'tag',
                effect:'dark'
            },
            tags:{
                _name:'tags',
                effect:'dark'
            },
            button:{
                _name:'button',
                title:'按钮',
                type:'primary',
                click:function (){}
            },
            switch:{
                _name:'switch',
                inactiveValue:0,
                activeValue:1,
                disabled:false
            },
            select:{
                _name:'select',
                disabled:false
            },
            slot:{
                _name:'slot'
            }
        };
        this.api={
            //打开选项卡
            addtabs:function(options){
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    Yunqi.message.error(__('请在框架内执行该操作'));
                    return;
                }
                if(!options.url){
                    Yunqi.message.error(__('url不能为空'));
                    return;
                }
                if(!options.url.startsWith('http')){
                    //绝对路径
                    if(options.url.startsWith('/')){
                        options.url=document.origin+options.url;
                        //相对路径
                    }else{
                        options.url=Yunqi.config.baseUrl+options.url;
                    }
                }
                let menu={
                    url:options.url,
                    icon:options.icon,
                    title:options.title,
                    menutype:'tab',
                    close:options.close || function (){}
                };
                top.Yunqi.app.clickMenu(menu);
            },
            open:function (options) {
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    Yunqi.message.error(__('请在框架内执行该操作'));
                    return;
                }
                if(!options.url){
                    Yunqi.message.error(__('url不能为空'));
                    return;
                }
                if(!options.url.startsWith('http')){
                    //绝对路径
                    if(options.url.startsWith('/')){
                        options.url=document.origin+options.url;
                    //相对路径
                    }else{
                        options.url=Yunqi.config.baseUrl+options.url;
                    }
                }
                let menu={
                    url:options.url,
                    expand:options.expand || false,
                    icon:options.icon,
                    title:options.title,
                    width:options.width || 800,
                    height:options.height || 500,
                    close:options.close || function (e){},
                    menutype:'layer'
                };
                top.Yunqi.app.clickMenu(menu);
            },
            //关闭选项卡
            closetabs:function(options,data){
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    Yunqi.message.error(__('请在框架内执行该操作'));
                    return;
                }
                top.Yunqi.app.clickMenu(top.Yunqi.app.tabList[0]);
                top.Yunqi.app.closeTabs(options,data);
            },
            closelayer:function (options,data) {
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    Yunqi.message.error(__('请在框架内执行该操作'));
                    return;
                }
                top.Yunqi.app.closeLayer(options,data);
            },
            //预览图片
            previewImg:function (img){
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    if(img instanceof Array){
                        Yunqi.message.error(__('请在框架内执行该操作'));
                    }else{
                        window.open(img,'_blank');
                    }
                    return;
                }
                top.Yunqi.app.previewImg(img);
            },
            //窗口最大化
            expand:function () {
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    return;
                }
                top.Yunqi.app.expand();
            },
            //窗口缩小
            compress:function () {
                let config=top.Yunqi.config;
                if(config.controller!='app\\admin\\controller\\Index' && config.action!='index'){
                    return;
                }
                top.Yunqi.app.compress();
            },
            del:function(url,ids,callback) {
                let nodata=false;
                if(!ids){
                    nodata=true;
                }
                if(ids instanceof Array && ids.length===0){
                    nodata=true;
                }
                if(typeof ids=='string' || typeof ids=='number'){
                    ids=[ids]
                }
                if(nodata){
                    Yunqi.alert(__('没有要删除的数据'),__('温馨提示'),{type: 'error'});
                    return;
                }
                Yunqi.confirm(__('确定删除选中的 %s 项?',{'s':ids.length}),__('温馨提示'),{type: 'warning'}).then(res=>{
                    Yunqi.ajax.post(url,{ids:ids.join(',')}).then(data=>{
                        callback && callback();
                    });
                });
            },
            multi:function(url,options,callback='',error=''){
                let nodata=false;
                if(!options.ids){
                    nodata=true;
                }
                if(options.ids instanceof Array && options.ids.length===0){
                    nodata=true;
                }
                if(typeof options.ids=='string' || typeof options.ids=='number'){
                    options.ids=[options.ids];
                }
                if(nodata){
                    Yunqi.alert('没有要更新的数据！','温馨提示',{type: 'warning'});
                    return;
                }
                Yunqi.ajax.post(url,options).then(data=>{
                    callback && callback();
                }).catch(e=>{
                    error && error(e);
                });
            }
        };
        this.ajax={
            get:function(url,data,loading=false,showmsg=false,fulldata=false) {
                return request('get',url,data,loading,showmsg,fulldata);
            },
            post:function(url,data,loading=true,showmsg=true,fulldata=false){
                return request('post',url,data,loading,showmsg,fulldata);
            },
            json:function(url,data,loading=false,showmsg=false,fulldata=false){
                return request('json',url,data,loading,showmsg,fulldata);
            }
        };
        this.getApp=function (id){
            let doc=top.document.querySelector('iframe[id="addtabs-'+id+'"]') || top.document.querySelector('iframe[id="layer-'+id+'"]');
            return doc && doc.contentWindow && doc.contentWindow.Yunqi && doc.contentWindow.Yunqi.app;
        },
        this.getElementUi=function (key=''){
            let ui=this.config.elementUi;
            for(let k in ui){
                if(ui[k]==='true'){
                    ui[k]=true;
                }
                if(ui[k]==='false'){
                    ui[k]=false;
                }
            }
            if(key){
                return ui[key];
            }
            return ui;
        };
        this.use=function (arr){
            const oldkeys=Object.keys(window);
            if(typeof arr=='string'){
                arr=[arr];
            }
            const promises = arr.map(fileurl => {
                return new Promise((resolve, reject) => {
                    let script=document.createElement("script");
                    script.src=fileurl;
                    script.type='text/javascript';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.querySelector('head').appendChild(script);
                });
            });
            return new Promise((resolve, reject) => {
                Promise.all(promises).then(res=>{
                    let newKeys=Object.keys(window);
                    let keys=newKeys.filter(v=>!oldkeys.includes(v));
                    let obj;
                    if(keys.length==1){
                        obj=window[keys[0]];
                    }else{
                        obj={};
                        for(let i=0;i<keys.length;i++) {
                            obj[keys[i]]=window[keys[i]];
                        }
                    }
                    resolve(obj);
                });
            });
        };
        this.setThemeColor=function(){
            const hexToRgb=function (str) {
                let hexs = "";
                str = str.replace("#", "");
                hexs = str.match(/../g);
                for (let i = 0; i < 3; i++) hexs[i] = parseInt(hexs[i], 16);
                return hexs;
            }
            const rgbToHex=function (r, g, b) {
                let hexs = [r.toString(16), g.toString(16), b.toString(16)];
                for (let i = 0; i < 3; i++) if (hexs[i].length == 1) hexs[i] = `0${hexs[i]}`;
                return `#${hexs.join("")}`;
            }
            const getDarkColor=function(color, level) {
                let rgb = hexToRgb(color);
                for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
                return rgbToHex(rgb[0], rgb[1], rgb[2]);
            }
            const getLightColor=function (color, level) {
                let rgb = hexToRgb(color);
                for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
                return rgbToHex(rgb[0], rgb[1], rgb[2]);
            }
            let elementUi=Yunqi.getElementUi();
            // 计算主题颜色变化
            document.documentElement.style.setProperty("--el-color-primary", elementUi.theme_color);
            document.documentElement.style.setProperty(
                "--el-color-primary-dark-2",
                elementUi.is_dark ? `${getLightColor(elementUi.theme_color, 0.2)}` : `${getDarkColor(elementUi.theme_color, 0.3)}`
            );
            for (let i = 1; i <= 9; i++) {
                const primaryColor = elementUi.is_dark ? `${getDarkColor(elementUi.theme_color, i / 10)}` : `${getLightColor(elementUi.theme_color, i / 10)}`;
                document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, primaryColor);
            }
        };
    };
    SupposeClass.prototype = {
        constructor: SupposeClass,
        setUp:function (Pageinfo,zhCn){
            function resolvePromiseInObject(obj) {
                const promises = [];
                for(let key in obj){
                    if(typeof key!='string'){
                        continue;
                    }
                    const value = obj[key];
                    if (value instanceof Promise) {
                        promises.push(
                            value.then(res => {
                                if(typeof res === 'object'){
                                    promises.push(resolvePromiseInObject(res));
                                }
                                obj[key] =res;
                            })
                        );
                    } else if (typeof value === 'object') {
                        promises.push(resolvePromiseInObject(value));
                    }
                }
                return Promise.all(promises).then(() => {
                    return obj;
                });
            }
            function recyclebin_(type,val){
                if(typeof type=='object'){
                    val=[type];
                    type='restore';
                }
                if(type=='init'){
                    let columns=[];
                    columns.push({checkbox: true});
                    for(let key in Yunqi.data.columns){
                        let type=Yunqi.data.columnsType[key] || 'text';
                        let formatter=Yunqi.formatter[type];
                        columns.push({
                            field: key,
                            title: Yunqi.data.columns[key],
                            formatter: formatter
                        });
                    }
                    columns.push({
                        field: 'deletetime',
                        title: __('删除时间'),
                        formatter: Yunqi.formatter.datetime
                    });
                    columns.push({
                        field: 'operate',
                        fixed:'right',
                        title: __('操作'),
                        width:80,
                        action:{
                            restore:{
                                tooltip:true,
                                type:'success',
                                text:__('还原'),
                                icon:'fa fa-undo',
                                method:'recyclebin_'
                            }
                        }
                    });
                    return columns;
                }
                if(type=='restore' || type=='destroy'){
                    let ids=[];
                    val.forEach(res=>{
                        ids.push(res.id);
                    });
                    if(ids.length==0){
                        this.$message.error(__('请选择需要操作的数据'));
                        return false;
                    }
                    Yunqi.ajax.post(this.extend.recyclebin_url+'?action='+type,{ids:ids}).then(res=>{
                        this.$refs.yuntable.reset();
                    });
                }
                if(type=='restoreall' || type=='clear'){
                    let msg={
                        restoreall:__('确定还原全部数据吗?'),
                        clear:__('确定清空回收站吗?')
                    };
                    Yunqi.confirm(msg[type],__('温馨提示'),{type: 'warning'}).then(res=>{
                        Yunqi.ajax.post(this.extend.recyclebin_url+'?action='+type).then(res=>{
                            this.$refs.yuntable.reset();
                        });
                    });
                }
            }
            function setContentHeight_(){
                let el=document.querySelector('#mainScrollbar>.el-scrollbar>.el-scrollbar__wrap');
                if(!el){
                    return;
                }
                //全屏
                if(top!=window && top.Yunqi.app.mainFrameExpand){
                    Vue.nextTick(()=>{
                        el.style.height=document.documentElement.clientHeight+'px';
                    });
                }
                //非全屏
                if(top!=window && !top.Yunqi.app.mainFrameExpand){
                    //弹出窗
                    let iframe=top.document.querySelector('iframe[src="'+decodeURI(window.location.href)+'"][class="layer-iframe"]');
                    if(iframe){
                        Vue.nextTick(()=>{
                            el.style.height=iframe.height+'px';
                        });
                        //正常窗
                    }else{
                        Vue.nextTick(()=>{
                            el.style.height=top.Yunqi.app.contentHeight+'px';
                        });
                    }
                }
            }
            resolvePromiseInObject(Pageinfo).then(Pageinfo=>{
                let Counter={
                    updated:Pageinfo.updated || function(){},
                    computed:Pageinfo.computed || {},
                    watch:Pageinfo.watch || {},
                    components:Pageinfo.components || {}
                };
                if(Pageinfo.data && typeof Pageinfo.data=='function'){
                    Counter.data=Pageinfo.data;
                }
                if(Pageinfo.data && typeof Pageinfo.data=='object'){
                    Counter.data=function(){
                        return Pageinfo.data;
                    }
                }
                let onLoad=function(){};
                let onUnload=function(){};
                let onShow=function(){};
                let onHide=function(){};
                if(Pageinfo.onLoad!=undefined && typeof Pageinfo.onLoad=='function'){
                    onLoad=Pageinfo.onLoad;
                }
                if(Pageinfo.onUnload!=undefined && typeof Pageinfo.onUnload=='function'){
                    onUnload=Pageinfo.onUnload;
                }
                if(Pageinfo.onShow!=undefined && typeof Pageinfo.onShow=='function'){
                    onShow=Pageinfo.onShow;
                }
                if(Pageinfo.onHide!=undefined && typeof Pageinfo.onHide=='function'){
                    onHide=Pageinfo.onHide;
                }
                Counter.methods={...Pageinfo.methods,recyclebin_,setContentHeight_,onLoad,onUnload,onShow,onHide};
                let created=Pageinfo.created || function(){};
                Counter.created=function(){
                    Yunqi.setThemeColor();
                    Yunqi.setApp(this);
                    this.onLoad(Yunqi.config.query);
                    created();
                }
                let mounted=Pageinfo.mounted || function(){};
                Counter.mounted=function(){
                    document.getElementById('container').style.display='flex';
                    let dark=Yunqi.getElementUi()['dark'];
                    if(dark){
                        document.querySelector('html').classList.add('dark');
                    }else{
                        document.querySelector('html').classList.remove('dark');
                    }
                    this.onShow();
                    this.setContentHeight_();
                    mounted();
                }
                let jsFile=Yunqi.config.baseUrl+'../assets/js/';
                //先加载vue
                this.use(jsFile+'vue.global.js').then(res=>{
                    let {Vue}=res;
                    //再加载axios、element-plus等
                    this.use([
                        jsFile+'axios.min.js',
                        jsFile+'Sortable.min.js',
                        jsFile+'element-plus.js'
                    ]).then(xes=>{
                        let {ElementPlus}=xes;
                        //追加到Yunqi对象
                        this.message=top.ElementPlus.ElMessage;
                        this.confirm=top.ElementPlus.ElMessageBox.confirm;
                        this.prompt=top.ElementPlus.ElMessageBox.prompt;
                        this.alert=top.ElementPlus.ElMessageBox.alert;
                        this.loading=top.ElementPlus.ElLoading.service;
                        let app=Vue.createApp(Counter);
                        app.use(ElementPlus, {locale: zhCn});
                        for(let k in Counter.components){
                            let rs=Counter.components[k];
                            app.component(k,rs);
                        }
                        app.mount('#app');
                    });
                });
            });
        },
        setConfig: function(arg,value){
            if(!this.config){
                this.config=arg;
            }else{
                this.config[arg]=value;
            }
            return this;
        },
        setAuth:function(arg,value){
            if(!this.auth){
                let _this=this;
                this.auth=arg;
                //权限判断
                this.auth.check=function(controller,action){
                    if(_this.auth.rules_list=='*'){
                        return true;
                    }
                    for (let i in _this.auth.rules_list){
                        let rule=_this.auth.rules_list[i];
                        if(rule.controller==controller){
                            for(let j in rule.action){
                                let v=rule.action[j];
                                if(v==action){
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
            }else{
                this.auth[arg]=value;
            }
            return this;
        },
        setData:function (data,value){
            if(!this.data){
                this.data=data;
            }else{
                this.data[data]=value;
            }
            return this;
        },
        setApp: function(app){
            if(app.window){
                throw new Error('页面禁止使用window属性');
            }
            app.window={
                menutype:'blank',
            };
            if(top!==window){
                let menu=top.Yunqi.app.openMenu;
                app.window.id=menu.id;
                app.window.title=menu.title;
                app.window.url=menu.url;
                app.window.menutype=menu.menutype;
            }
            this.app=app;
            return this;
        }
    };
    return new SupposeClass();
})();