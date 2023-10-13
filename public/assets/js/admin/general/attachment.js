import table from "../../components/Table.js";
import form from "../../components/Form.js";
import {inArray} from "../../util.js";

export default{
    components:{'YunTable':table,'YunForm':form},
    data:{
        //列表页面
        extend:{
            index_url: 'general/attachment/index',
            add_url: 'general/attachment/add',
            del_url: 'general/attachment/del',
            multi_url: 'general/attachment/multi'
        },
        columns:[
            {checkbox: true},
            {field: 'id',title:'ID',width:80,operate:false,edit:'hidden'},
            {field: 'category', title: __('类别'),width:100, operate: false, formatter: Yunqi.formatter.tag, searchList:Yunqi.data.categoryList},
            {field: 'admin_id', title: __('管理员ID'), visible: false,operate:false},
            {field: 'user_id', title: __('会员ID'), visible: false,operate:false},
            {field: 'thumburl', title: __('缩略图'), width:120,operate: false,formatter: Yunqi.formatter.image},
            {field: 'filename', title: __('文件名'),align:'left',operate: 'like',width:300},
            {field: 'fullurl', title: __('源文件'),align:'left',operate: false,width:400,formatter: Yunqi.formatter.link},
            {
                field: 'filesize', title: __('文件大小'), width: 120,operate: false, sortable: true, formatter: function (value, row) {
                    var size = parseFloat(value);
                    var i = Math.floor(Math.log(size) / Math.log(1024));
                    return (size / Math.pow(1024, i)).toFixed(i < 2 ? 0 : 2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
                }
            },
            {field: 'is_image', title: __('图片'), width: 80,operate: false,searchList: {1: __('是'), 0: __('否')},formatter: function(data,row){
                 let tag=Yunqi.formatter.tag;
                 if(row.is_image){
                     tag.value='是';
                     tag.type='success';
                 }else{
                     tag.value='否';
                     tag.type='danger';
                 }
                 return tag;
            }},
            {field: 'imagetype', title: __('图片类型'), width: 120,operate: false},
            {field: 'imagewidth', title: __('宽度'), width: 100,operate: false},
            {field: 'imageheight', title: __('高度'), width: 100,operate: false},
            {field: 'storage', title: __('存储方式'), width: 150,operate: false,searchList: Yunqi.data.disksList,formatter: Yunqi.formatter.tag},
            {
                field: 'createtime',
                title: __('创建时间'),
                formatter: Yunqi.formatter.datetime,
                operate: {form:'date-picker',type:'daterange'},
                sortable: true,
                width: 150
            },
            {
                field: 'operate',
                fixed: 'right',
                title: __('操作'),
                width:60,
                action:{
                    del:true
                }
            }
        ],
        //添加页面
        addform:{
            category:'',
            disks:'',
            ready:0,
            success:0
        },
        addformRules:{
            disks:[{required:true,message:'请选择存储方式',trigger:'change'}],
            ready:[{required:true,min:1,message:'请上传文件',trigger:'change'}]
        },
        accept:'',
        //选择文件页面
        list:[],
        page:1,
        category:'all',
        catelist:Yunqi.data.categoryList,
        checked:[],
        keywords:'',
        total:0,
        editCateForm:{
            show:false,
            type:'add',
            key:'',
            value:''
        },
        loading:false,
        limit:Yunqi.data.limit,
    },
    onLoad:{
        select:function () {
            this.getImglist();
        },
        add:function (){
            let mimetype=Yunqi.config.upload.mimetype.split(',');
            let accept=[];
            mimetype.forEach(res=>{
                accept.push('.'+res);
            });
            this.accept=accept.join(',');
        }
    },
    methods: {
        //列表页面
        changeCategory:function (selections,key){
            if(selections.length==0){
                return;
            }
            let ids=[];
            selections.forEach(res=>{
                ids.push(res.id);
            });
            Yunqi.api.multi(this.extend.multi_url,{ids:ids,field:'category',value:key},function(){
                location.reload();
            });
        },
        //添加页面
        showFileThumb:function (file) {
            let filename=file.name.toLowerCase();
            let icon=filename.slice(filename.lastIndexOf('.')+1);
            if(inArray(['jpg','jpeg','png','gif','bmp'],icon)){
                return file.url;
            }else if(inArray(['doc','docx'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/doc.png';
                return iconpath;
            }else if(inArray(['ppt','pptx'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/ppt.png';
                return iconpath;
            }else if(inArray(['xls','xlsx'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/xls.png';
                return iconpath;
            }else if(inArray(['mp3','wav','wma','ogg'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/audio.png';
                return iconpath;
            }else if(inArray(['mp4', 'avi', 'rmvb','swf', 'flv','rm', 'ram', 'mpeg', 'mpg', 'wmv', 'mov'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/video.png';
                return iconpath;
            }else if(inArray(['zip', 'rar', '7z', 'gz', 'tar'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/zip.png';
                return iconpath;
            }else if(inArray(['apk','tiff','exe','html','pdf','psd','visio','svg','txt','xml'],icon)){
                let iconpath=location.origin+'/assets/img/fileicon/'+icon+'.png';
                return iconpath;
            }else{
                let iconpath=location.origin+'/assets/img/fileicon/wz.png';
                return iconpath;
            }
        },
        submit:function (){
            let elloading=ElementPlus.ElLoading.service({background:'rgba(255,255,255,0.3)',text:'请求中..'});
            this.$refs.formRef.validate((valid, fields)=>{
                if(valid){
                    this.$refs.uploadRef.submit();
                    setInterval(()=>{
                        if(this.addform.success==this.addform.ready){
                            Yunqi.api.closelayer(Yunqi.config.window.id,function(){
                                let id=top.Yunqi.app.activeMenu.id;
                                let tab=top.document.getElementById('tabs-'+id).contentWindow;
                                let doc=tab.document.getElementsByClassName('refresh');
                                if(doc.length>0){
                                    doc[0].click();
                                }
                            });
                        }
                    },100);
                }else{
                    elloading.close();
                }
            });
        },
        reset:function () {
            this.addform={
                category:'',
                disks:'',
                files:[]
            };
        },
        removeFile:function (file) {
            this.$refs.uploadRef.handleRemove(file);
            this.addform.ready--;
        },
        fileUploadChange:function (file) {
            if(file.status=='ready'){
                let maxsize=Number(Yunqi.config.upload.maxsize);
                if(file.size>1024*1024*maxsize){
                    Yunqi.message.error(__('文件大小不能超过'+maxsize+'mb'));
                    return false;
                }
                this.addform.ready++;
            }
            if(file.status=='success'){
                this.addform.success++;
            }
        },
        //选择文件页面
        inArray:function (url) {
            let r=false;
            for(let i=0;i<this.checked.length;i++){
                if(this.checked[i].fullurl==url){
                    r=i;
                    break;
                }
            }
            return r;
        },
        beforeUploadSuccess:function (res,file) {
            if(res.code===0){
                Yunqi.message.error(__(res.msg));
            }
            this.list=[];
            setTimeout(()=>{
                this.refresh();
            },500);
        },
        checkCategory:function (key) {
            this.category=key;
            this.refresh();
        },
        addCate:function () {
            this.editCateForm.type='add';
            this.editCateForm.title='添加分类';
            this.editCateForm.key='fold-'+(this.catelist.length+1);
            this.editCateForm.show=true;
        },
        editCate:function (key,value) {
            this.editCateForm.type='edit';
            this.editCateForm.title='编辑分类';
            this.editCateForm.key=key;
            this.editCateForm.value=value;
            this.editCateForm.show=true;
        },
        delCate:function (key,value) {
            this.editCateForm.type='del';
            this.editCateForm.key=key;
            this.editCateForm.value=value;
            Yunqi.confirm('确定删除分类【'+value+'】吗？').then(res=>{
                Yunqi.ajax.post('general/attachment/setcate',this.editCateForm).then(res=>{
                    this.catelist=res;
                    this.category='all';
                    this.refresh();
                });
            });
        },
        confirm:function () {
            if(this.editCateForm.type=='set'){
                let ids=[];
                this.checked.forEach(item=>{
                    ids.push(item.id);
                });
                if (ids.length==0){
                    Yunqi.message.error('请选择要删除的图片!');
                    return;
                }
                Yunqi.ajax.post('general/attachment/classify', {
                    ids:ids.join(','),
                    category:this.editCateForm.key
                }).then(res=>{
                    this.editCateForm.show=false;
                    this.category=this.editCateForm.key;
                    this.checked=[];
                    this.refresh();
                });
            }else{
                Yunqi.ajax.post('general/attachment/setcate',this.editCateForm).then(res=>{
                    this.catelist=res;
                    this.editCateForm.show=false;
                    this.category=this.editCateForm.key;
                    this.refresh();
                });
            }
        },
        delPic:function () {
            let ids=[];
            this.checked.forEach(item=>{
                ids.push(item.id);
            });
            if (ids.length==0){
                Yunqi.message.error('请选择要删除的图片!');
                return;
            }
            Yunqi.confirm('确定删除这'+ids.length+'张图片吗？').then(res=>{
                Yunqi.ajax.post('general/attachment/del',{ids:ids.join(',')}).then(res=>{
                    this.getImglist();
                    this.checked=[];
                });
            });
        },
        setCategory:function () {
            if (this.checked.length===0){
                Yunqi.message.error('请选择要归类的图片!');
                return;
            }
            this.editCateForm.type='set';
            this.editCateForm.title='图片归类';
            this.editCateForm.show=true;
        },
        refresh:function () {
            this.page=1;
            this.getImglist();
        },
        pageChange:function (page) {
            this.page=page;
            this.getImglist();
        },
        getImglist:function () {
            this.loading=true;
            Yunqi.ajax.get('general/attachment/select',{
                page:this.page,
                category:this.category,
                keywords:this.keywords,
            }).then(res=>{
                this.total=res.total;
                this.list=res.rows;
                this.loading=false;
                Vue.nextTick(()=>{
                    this.parseImg();
                });
            });
        },
        parseImg:function(){
            if(this.loading){
                return;
            }
            let imgs=document.querySelectorAll('img[class="upload-file-img"]');
            if(imgs.length==0){
                return;
            }
            let url=imgs[0].dataset.url;
            imgs[0].setAttribute('src',url);
            imgs[0].removeAttribute('class');
        },
        confirmImg:function () {
            let imgs=[];
            this.checked.forEach(res=>{
                imgs.push(res.fullurl);
            });
            Yunqi.api.closelayer(Yunqi.config.window.id,imgs);
        },
        checkImg:function (file) {
            let xi=this.inArray(file.fullurl);
            if(xi!==false){
                this.checked.splice(xi,1);
            }else{
                if(this.checked.length==this.limit){
                    this.checked.shift();
                }
                this.checked.push(file);
            }
        }
    }
}