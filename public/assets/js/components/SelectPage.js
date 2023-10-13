const template=`
    <el-select
        @change="changeSelect"
        v-model="data"
        :multiple="multiple"
        remote
        @clear="clearSelect"
        :clearable="true"
        filterable
        :size="size"
        reserve-keyword
        style="width: 100%"
        remote-show-suffix
        :placeholder="placeholder"
        :remote-method="remoteMethod"
        :loading="loading">
        <div class="el-pagination-box">
            <el-option
                v-for="item in list"
                :key="item[keyField]"
                :label="item[labelField]"
                :value="item[keyField]">
            </el-option>
            <el-pagination
                style="justify-content: center;"
                :page-size="pageSize"
                layout="total, prev, pager, next"
                :pager-count="7"
                small
                :total="total"
                @current-change="changePage">
            </el-pagination>
        </div>
    </el-select>
`;
export default {
    name: "SelectPage",
    data: function () {
        return {
            loading:false,
            list:[],
            pageNumber:1,
            query:'',
            total:0,
            data:'',
        }
    },
    mounted:function (){
        if(this.multiple){
            if(!this.value){
                this.data=[];
            }
            if(typeof this.value==='string'){
                this.data=this.value.split(',');
            }
            if(this.value instanceof Array){
                this.data=this.value.map(res=>{
                    return res.toString();
                });
            }
        }else{
            this.data=this.value?this.value.toString():'';
        }
        this.initList();
    },
    props:{
        value:'',
        labelField:{
            type:String,
            default:'name'
        },
        keyField:{
            type:String,
            default:'id'
        },
        field:{
            type:String,
            default:''
        },
        placeholder:{
            type:String,
            default:''
        },
        url:{
            type:String,
            required:true
        },
        pageSize:{
            type:Number,
            default:7
        },
        size:{
            type:String,
            default:'default'
        },
        multiple:{
            type:Boolean,
            default:false
        }
    },
    template:template,
    emits:['change'],
    methods:{
        initList:function (){
            let keyValue=this.value || '';
            let postdata={
                'page':this.pageNumber,
                'limit':this.pageSize,
                'keyField':this.keyField,
                'labelField':this.labelField,
                'keyValue':keyValue,
                'labelValue':'',
                'selectpage':true
            };
            Yunqi.ajax.json(this.url,postdata,false).then(res=>{
                this.list=res.rows;
                this.total=res.total;
            });
        },
        getList:function (){
            let postdata={
                'page':this.pageNumber,
                'limit':this.pageSize,
                'keyField':this.keyField,
                'labelField':this.labelField,
                'keyValue':'',
                'labelValue':this.query,
                'selectpage':true
            };
            Yunqi.ajax.json(this.url,postdata,false).then(res=>{
                this.list=res.rows;
                this.total=res.total;
            });
        },
        changeSelect:function (e){
            let r=this.data;
            if(this.multiple){
                r=this.data.join(',');
            }
            this.$emit('change',this.field?{field: this.field,value:r}:r);
        },
        clearSelect:function (){
            this.pageNumber=1;
            this.getList();
        },
        remoteMethod:function (query){
            this.query=query;
            if(!query){
                return;
            }
            this.pageNumber=1;
            this.getList();
        },
        changePage:function (e){
            this.pageNumber=e;
            this.getList();
        }
    }
};
