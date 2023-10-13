import {copyObj,rand} from "../util.js";
const template=`
    <div class="fieldlist" :id="'fieldlist-'+id">
        <div class="row">
            <template v-for="la in label">
            <div class="field">{{la}}</div>
            </template>
        </div>
        <template v-for="(obj,row) in list">
            <div class="row">
                <template v-for="(v,k) in obj">
                <div class="field">
                    <slot :name="k" :list="list" :row="row" :key="k">
                       <el-input v-model="list[row][k]" @change="change"></el-input>
                    </slot>
                </div>
                </template>
                <div class="field act">
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
            addval:''
        }
    },
    created:function (){
        this.id=rand(10000,99999);
    },
    mounted:function (){
        if(this.value instanceof Array){
            this.list=copyObj(this.value);
            let addval=copyObj(this.value[this.value.length-1]);
            for(let k in addval){
                addval[k]='';
            }
            this.addval=addval;
        }else{
            let a=[];
            for(let k in this.value){
                a.push({"0":k, "1":this.value[k]});
            }
            this.list=a;
            this.addval={"0":"", "1":""};
        }
        this.rowDrop();
    },
    props:{
        value:{
            type:Object,
            default:[{"0":"", "1":""},{"0":"", "1":""}]
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
                        _this.$emit('change',_this.parseValue());
                    });
                }
            });
        },
        removeRow:function (row){
            this.list.splice(row,1);
            this.$emit('change',this.parseValue());
        },
        addRow:function (){
            this.list.push(copyObj(this.addval));
            this.$emit('change',this.parseValue());
        },
        change:function (){
            this.$emit('change',this.parseValue());
        },
        parseValue:function (){
            if(this.value instanceof Array){
                let x=false;
                for(let i in this.value){
                    let obj=this.value[i];
                    let keys=Object.keys(obj);
                    if(keys.length==2 && keys[0]=='0' && keys[1]=='1'){
                        x=true;
                    }
                }
                if(x){
                    let r={};
                    for(let i=0;i<this.list.length;i++){
                        if(!this.list[i]['0']){
                            continue;
                        }
                        r[this.list[i]['0']]=this.list[i]['1'];
                    }
                    return this.field?{field:this.field,value:r}:r;
                }else{
                    return this.field?{field:this.field,value:this.list}:this.list;
                }
            }else{
                let r={};
                for(let i=0;i<this.list.length;i++){
                    if(!this.list[i]['0']){
                        continue;
                    }
                    r[this.list[i]['0']]=this.list[i]['1'];
                }
                return this.field?{field:this.field,value:r}:r;
            }
        }
    }
};
