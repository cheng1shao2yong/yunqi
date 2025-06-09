import {copyObj,rand,inArray} from "../util.js";
const template=`
    <div class="fieldlist" :id="'fieldlist-'+id">
        <div class="row" v-if="label.length">
            <template v-for="(la,index) in label">
            <div class="field" :style="'width:'+parseLabelWidth[index]">{{la}}</div>
            </template>
        </div>
        <template v-for="(obj,row) in list">
            <div class="row">
                <template v-for="(v,k) in obj">
                <template v-if="inArray(keys,k)">
                <div class="field" :style="'width:'+parseFieldWidth[k]">
                    <slot :name="k" :list="list" :row="row" :key="k">
                       <el-input v-model="list[row][k]"></el-input>
                    </slot>
                </div>
                </template>
                </template>
                <div class="field act" style="width: 15%;">
                     <el-button type="danger" @click="removeRow(row)"><i class="fa fa-times"></i></el-button>
                     <el-button type="primary" class="sortableButton"><i class="fa fa-arrows"></i></el-button>
                </div>
            </div>
        </template>            
        <el-row :gutter="20" class="row">
            <el-col :span="4">
                <el-button type="success" @click="addRow"><i class="fa fa-plus"></i>&nbsp;追加</el-button>
            </el-col>
        </el-row>
    </div>
`;
const moveRow=function(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
        var k = newIndex - array.length;
        while ((k--) + 1) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array;
}
export default {
    name: "Fieldlist",
    data: function () {
        return {
            id:'',
            list:[],
            addval:'',
            parseLabelWidth:[],
            parseFieldWidth:{}
        }
    },
    created:function (){
        this.id=rand(10000,99999);
    },
    watch:{
        list: {
            deep:true,
            handler:function (val){
                this.$emit('change',this.parseValue());
            }
        }
    },
    mounted:function (){
        let addval={};
        if(this.value){
            if(this.value instanceof Array){
                this.list=copyObj(this.value);
            }else{
                let list=[];
                for(let k in this.value){
                    list.push({'0':k,'1':this.value[k]});
                }
                this.list=list;
            }
        }
        for(let k in this.keys){
            addval[this.keys[k]]='';
        }
        this.addval=addval;
        for(let k in this.keys){
            this.parseLabelWidth.push((80/this.keys.length)+'%');
            this.parseFieldWidth[this.keys[k]]=(80/this.keys.length)+'%';
        }
        this.rowDrop();
    },
    props:{
        keys:{
            type:Array,
            default: ['0','1']
        },
        value:{
            type:Object,
            default:null
        },
        label:{
            type:Array,
            default: ['键名','键值']
        },
        field:{
            type:String,
            default:''
        }
    },
    template:template,
    emits:['change'],
    methods:{
        inArray,
        rowDrop:function(){
            const tbody = document.querySelector('#fieldlist-'+this.id);
            const _this = this;
            Sortable.create(tbody, {
                draggable: ".row",
                animation: 100,
                handle:'.sortableButton',
                onEnd ({ newIndex, oldIndex }) {
                    let list=copyObj(_this.list);
                    _this.list=[];
                    moveRow(list,oldIndex-1,newIndex-1);
                    Vue.nextTick(()=>{
                        _this.list=list;
                    });
                }
            });
        },
        removeRow:function (row){
            this.list.splice(row,1);
        },
        addRow:function (){
            this.list.push(copyObj(this.addval));
        },
        parseValue:function (){
            if(this.keys.length==2 && this.keys[0]=='0' && this.keys[1]=='1'){
                let r={};
                for(let i=0;i<this.list.length;i++){
                    if(!this.list[i]['0']){
                        continue;
                    }
                    r[this.list[i]['0']]=this.list[i]['1'];
                }
                return this.field?{field:this.field,value:r}:r;
            }else{
                let r=copyObj(this.list);
                return this.field?{field:this.field,value:r}:r;
            }
        }
    }
};
