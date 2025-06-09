import {rand} from "../../util.js";

const template=`
    <link href="/assets/libs/wangeditor/style.css" rel="stylesheet">
    <div :style="'width:'+width_">
        <div :id="'editor-wrapper-'+id" style="border: 1px solid #ccc;">
             <div :id="'toolbar-container-'+id"></div>
             <div :id="'editor-container-'+id" :style="'height:'+height_+';border-top: 1px solid #ccc;'"></div>
        </div>
    </div>
`;
export default {
    name: "Wangeditor",
    data: function () {
        return {
            id:'',
            editor:'',
            width_:'',
            height_:''
        }
    },
    mounted:function (){
        this.id=rand(1000,9999);
        if(this.width && (this.width.indexOf('%')>-1 || this.width.indexOf('px')>-1)){
            this.width_=this.width;
        }else{
            this.width_=this.width+'px';
        }
        if(this.height && (this.height.indexOf('%')>-1 || this.height.indexOf('px')>-1)){
            this.height_=this.height;
        }else{
            this.height_=this.height+'px';
        }
        Yunqi.use('/assets/libs/wangeditor/index.js').then(res=>{
            this.editor=window.wangEditor;
            let time=rand(100,999);
            setTimeout(()=>{
                this.createEditor();
            },time);
        });
    },
    props:{
        mode:'default',//or 'simple'
        value:'',
        field:{
            type:String,
            default: ''
        },
        width:{
            type:String,
            default:'100%'
        },
        height:{
            type:String,
            default:'350'
        }
    },
    template:template,
    emits:['change'],
    methods:{
        createEditor:function (){
            let editorConfig={
                placeholder:'请输入内容',
                MENU_CONF:{
                    uploadImage: {
                        customBrowseAndUpload(insertFn) {
                            Yunqi.api.open({
                                url: 'general/attachment/select?limit=10',
                                title:'选择图片',
                                icon:'fa fa-image',
                                width:1000,
                                height:550,
                                close:function (imgs){
                                    if(!imgs){
                                        return;
                                    }
                                    imgs.forEach(img=>{
                                        insertFn(img,'',img);
                                    });
                                }
                            });
                        }
                    },
                    uploadVideo:{
                        server: '/ajax/upload'
                    }
                },
                onChange:(editor)=>{
                    if(this.field){
                        this.$emit('change',{field:this.field,value:editor.getHtml()});
                    }else{
                        this.$emit('change',editor.getHtml());
                    }
                }
            };
            let editor=this.editor.createEditor({
                selector: '#editor-container-'+this.id,
                html: this.value?this.value:'<p><br></p>',
                config: editorConfig,
                mode: this.mode
            });
            let toolbarConfig={};
            this.editor.createToolbar({
                editor,
                selector: '#toolbar-container-'+this.id,
                config: toolbarConfig,
                mode: this.mode
            })
        }
    }
};
