const template=`
    <select-page
        ref="yunPage"
        v-if="value_"
        @change="changeSelectpage" 
        :url="'ajax/third/selectpage?platform='+platform"
        label-field="openname"
        key-field="id"
        :placeholder="placeholder"
        :disabled="!selectable"
        :page-size="7"
        :value="value_"
        :multiple="multiple">
    </select-page>
    <el-button type="primary" style="margin-top: 5px" @click="showDrawer">微信扫码</el-button>
    <el-drawer @close="closeDrawer" size="100%" direction="ttb" :append-to-body="true" v-model="drawer" title="请使用微信扫码" :with-header="false">
        <div style="display: flex;flex-direction: column;justify-content: center;align-items: center;">
          <img :src="qrcode" style="width: 250px;height: 250px;margin: 20px auto;"/>
          <div>
          <el-tag style="margin-right: 5px;" @close="removeThird(tag.id)" v-for="(tag,index) in tags" :key="tag.id" closable>{{tag.openname}}</el-tag>
          </div>
          <el-button type="primary" @click="closeDrawer" style="width: 250px;margin-top: 20px;">关闭</el-button>
        </div> 
    </el-drawer>
`;
import selectpage from "./SelectPage.js";
export default {
    name: "Third",
    components:{
        'SelectPage':selectpage
    },
    data: function () {
        return {
            tags:[],
            drawer:false,
            foreign_key:'',
            qrcode:'',
            value_:false
        }
    },
    props: {
        value: '',
        selectable:{
            type:Boolean,
            default:true
        },
        platform: {
            type:String,
            default:'mpapp'
        },
        placeholder: {
            type:String,
            default:'请选择'
        },
        multiple:{
            type:Boolean,
            default:false
        }
    },
    mounted:function (){
        if(this.value==='' || this.value===null){
            this.value_=[];
            return;
        }
        if(typeof this.value==='string'){
            this.value_=this.value.split(',');
            return;
        }
        if(typeof this.value==='number'){
            this.value_=this.value+'';
            return;
        }
        if(this.value instanceof Array){
            this.value_=this.value.map(res=>{
                return res.toString();
            });
            return;
        }
        this.value_=[];
    },
    template:template,
    emits:['change'],
    methods:{
        changeSelectpage:function (e){
            this.$emit('change',e);
            this.getThirdInfo();
        },
        closeDrawer:function (){
            this.drawer=false;
        },
        showDrawer:function (){
            this.drawer=true;
            this.foreign_key=(new Date()).getTime();
            this.qrcode=Yunqi.config.baseUrl+'ajax/third/qrcode?platform='+this.platform+'&foreign_key='+this.foreign_key;
            this.timeloop();
            this.getThirdInfo();
        },
        getThirdInfo:function (){
            let list=this.$refs.yunPage.getSelectedData();
            this.tags=list;
        },
        removeThird:function (id){
            let index=-1;
            for(let i=0;i<this.tags.length;i++){
                if(this.tags[i].id==id){
                    index=i;
                    break;
                }
            }
            if(index>-1){
                this.tags.splice(index,1);
            }
            this.value_.splice(this.value_.indexOf(id),1);
            this.$refs.yunPage.remove(id);
        },
        timeloop:function (){
            let that=this;
            Yunqi.ajax.get('ajax/third/check?platform='+that.platform+'&foreign_key='+that.foreign_key).then(res=>{
                that.$refs.yunPage.select(res.id+'');
                if(res && that.multiple){
                    Yunqi.message.success('扫码成功，继续扫码或关闭');
                    that.foreign_key=(new Date()).getTime();
                    that.qrcode=Yunqi.config.baseUrl+'ajax/third/qrcode?platform='+that.platform+'&foreign_key='+that.foreign_key;
                    setTimeout(()=>{
                        that.timeloop();
                    },1500);
                }
                if(res && !that.multiple){
                    Yunqi.message.success('扫码成功');
                    Vue.nextTick(()=>{
                        that.drawer=false;
                    });
                }
            }).catch(err=>{
                if(!that.drawer){
                    return;
                }
                setTimeout(()=>{
                    that.timeloop();
                },1500);
            });
        }
    }
};
