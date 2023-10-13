const template=`
     <component is="style">
        .chooseIcon .el-drawer__header{
            margin-bottom:0;
         }
         .chooseIcon .el-drawer__body{
            display:flex;
            flex-wrap: wrap;
         }
         .chooseIcon .li{
            width:41px;
            height:42px;
            line-height:42px;
            border:1px solid #efefef;
            padding:1px;
            margin:1px;
            text-align: center;
            font-size:18px;
        }
        .chooseIcon .li:hover{
            border:1px solid #2c3e50;
            cursor:pointer;
        }
     </component>
     <el-drawer
        v-model="show"
        custom-class="chooseIcon"
        size="100%"
        :show-close="true"
        direction="rtl">
        <template #title>
            <el-input v-model="search" style="width: 100%">
                <template #prepend>搜索图标</template>
            </el-input>
        </template>
        <template v-for="i in iconlist">
            <div v-if="(search && i.indexOf(search)!=-1) || !search" class="li"  @click="clickIcon('fa fa-'+i)">
                <i :class="'fa fa-'+i"></i>
            </div>
        </template>
    </el-drawer>
`;
export default {
    name: "CheckIcon",
    data: function () {
        return {
            show:false,
            iconlist:[],
            searchlist:[],
            search:''
        }
    },
    emits:['selected'],
    mounted:function (){
        let url=location.origin+'/assets/libs/font-awesome/less/variables.less'
        Yunqi.ajax.get(url,'',false,false,true).then(ret=>{
            var exp = /fa-var-(.*):/ig;
            var result;
            let iconlist=[];
            while ((result = exp.exec(ret)) != null) {
                iconlist.push(result[1]);
            }
            this.iconlist=iconlist;
        });
    },
    template:template,
    methods:{
        clickIcon:function (i){
            this.$emit('selected',i);
            this.show=false;
        },
        open:function (){
            this.show=true;
        }
    }
};
