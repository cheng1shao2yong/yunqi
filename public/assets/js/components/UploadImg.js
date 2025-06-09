const template=`
    <div class="fast-upload-box">
        <el-upload
            :id="uuid"
            :show-file-list="false"
            :multiple="false"
            :disabled="disabled"
            :class="[isCircle ? 'is-circle' : '', disabled ? 'is-disabled' : '']"
            accept="image/png,image/jpg,image/jpeg,image/gif"
            action="${Yunqi.config.baseUrl}${Yunqi.config.upload.uploadurl}"
            :headers="{'x-requested-with': 'XMLHttpRequest'}"
            :data="{category:'',disks:'local_public'}"
            list-type="picture-card"          
            :on-success="fileUploadSuccess">
            <slot name="title" v-if="!imageUrl">
                <i class="fa fa-plus"></i>
                <span>请上传图片</span>
            </slot>
            <template v-if="imageUrl">
                <div class="preview-img" :style="'position:relative;text-align:center;width: '+width+'px;height:'+height+'px;'">
                    <img :src="imageUrl" class="upload-image"/>
                    <div class="upload-handle" @click.stop>
                          <div class="handle-icon" @click="editImg" v-if="!disabled">
                               <i class="fa fa-edit" style="position: relative;top: 2px;"></i>
                          </div>
                          <div class="handle-icon" @click="showImg" >
                               <i class="fa fa-search-plus"></i>
                          </div>
                          <div class="handle-icon" @click="deleteImg" v-if="!disabled">
                               <i class="fa fa-trash"></i>
                          </div>
                     </div>
                </div>
            </template>
        </el-upload>
    </div>
`;
import {rand} from '../util.js';
export default {
    name: "UploadImg",
    data: function () {
        return {
            uuid:''
        }
    },
    created:function (){
        this.uuid='upload-file-'+rand(1000,9999);
    },
    emits:['change'],
    props:{
        imageUrl:{
            type: String
        },
        disabled:{
            type: Boolean,
            default: false
        },
        width:{
            type: Number,
            default: 150
        },
        height:{
            type: Number,
            default: 150
        },
        isCircle:{
            type: Boolean,
            default: false
        },
        field:{
            type:String,
            default:''
        }
    },
    template:template,
    methods:{
        showImg:function (){
            Yunqi.api.previewImg([this.imageUrl]);
        },
        editImg:function (){
            let str=`#${this.uuid} .el-upload__input`;
            let dom = document.querySelector(str);
            dom && dom.click();
        },
        deleteImg:function (){
            if(this.field){
                this.$emit('change',{field:this.field,value:''});
            }else{
                this.$emit('change','');
            }
        },
        fileUploadSuccess:function (e,f){
            if(this.field){
                this.$emit('change',{field:this.field,value:e.data.fullurl});
            }else{
                this.$emit('change',e.data.fullurl);
            }
        },
    }
};
