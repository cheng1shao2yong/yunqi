import {copyObj, rand} from "../util.js";
const template=`
<component is="style">
.imgbox{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}
.imgbox .imgli{
    width: 100px;
    height: 100px;
    margin-right: 10px;
    overflow: hidden;
    position: relative;
    border: 1px dashed #ccc;
    cursor: pointer;
}
.imgbox .imgli .fa-times{
    position: absolute;
    right: 0px;
    top: 0px;
    background: var(--el-color-danger);
    color: #fff;
    padding:2px 4px;
    border-radius: 50%;
    cursor: pointer;
}
.imgbox .add{
    border: 1px dashed #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
.imgbox .add span{
    margin-left: 5px;
}
</component>
<div class="imgbox" :id="'imgbox-'+id">
    <div class="imgli" v-for="(item,index) in imgs" @click="preview(item)">
        <img :src="item" style="width: 100px;"/>
        <i class="fa fa-times" @click.stop="removeFile(index)"></i>
    </div>
    <div class="imgli add" @click="openLayer" v-if="limit-imgs.length>0">
        <i class="fa fa-plus"></i> 
        <span>添加图片</span>
    </div>
</div>
`;
function moveRow(arr, oldIndex, newIndex){
    let value=arr[oldIndex];
    arr.splice(oldIndex,1);
    arr.splice(newIndex,0,value);
}
export default {
    name: "Attachment",
    data: function () {
        return {
            id:'',
            imgs:[]
        }
    },
    props:{
        limit:{
            type:Number,
            default:5
        },
        field:{
            type:String,
            default: ''
        },
        value:''
    },
    created:function (){
        this.id=rand(10000,99999);
    },
    mounted:function (){
        if(this.value && typeof this.value=='string'){
            this.imgs=this.value.split(',');
        }
        if(this.value && this.value instanceof Array){
            this.imgs=this.value;
        }
        this.rowDrop();
    },
    emits:['change'],
    template:template,
    methods:{
        rowDrop:function(){
            const tbody = document.querySelector('#imgbox-'+this.id);
            const _this = this;
            Sortable.create(tbody, {
                draggable: ".imgli",
                animation: 100,
                handle:'.imgli',
                onEnd ({ newIndex, oldIndex }) {
                    //移动图片所在数组中的位置
                    let imgs=copyObj(_this.imgs);
                    _this.imgs=[];
                    moveRow(imgs,oldIndex,newIndex);
                    Vue.nextTick(()=>{
                        if(_this.field){
                            _this.$emit('change',{field: _this.field,value:imgs.join(',')});
                            _this.imgs=imgs;
                        }else{
                            _this.$emit('change',imgs.join(','));
                        }
                    });
                }
            });
        },
        preview:function (url){
            Yunqi.api.previewImg(url);
        },
        removeFile:function (index){
            this.imgs.splice(index,1);
            if(this.field){
                this.$emit('change',{field: this.field,value:this.imgs.join(',')});
            }else{
                this.$emit('change',this.imgs.join(','));
            }
        },
        openLayer:function (){
            let that=this;
            let number=this.limit-this.imgs.length;
            if(number<=0){
                Yunqi.message.error('最多选择'+this.limit+'张图片');
                return;
            }
            Yunqi.api.open({
                url:'general/attachment/select?limit='+number,
                title:'选择图片',
                icon:'fa fa-image',
                width:1000,
                height:550,
                close:function (e){
                    if(!e){
                        return;
                    }
                    that.imgs=that.imgs.concat(e);
                    if(that.field){
                        that.$emit('change',{field: that.field,value:that.imgs.join(',')});
                    }else{
                        that.$emit('change',that.imgs.join(','));
                    }
                }
            });
        }
    }
};
