const template=`
    <div class="breadcrumb-box">
        <el-breadcrumb separator="&#155">
            <transition-group name="breadcrumb">
                <el-breadcrumb-item v-for="(item, index) in list" :key="item.id">
                    <div class="el-breadcrumb__inner is-link">
                        <i :class="['breadcrumb-icon',item.icon]"></i>
                        <span class="breadcrumb-title">{{ item.title }}</span>
                    </div>
                </el-breadcrumb-item>
            </transition-group>
        </el-breadcrumb>
    </div>
`;
export default {
    name: "Breadcrumb",
    data: function () {
        return {
            elementUi:''
        }
    },
    created:function (){
        this.elementUi=Yunqi.getElementUi();
    },
    props:{
        list: {
            type: Array,
            required: true,
        }
    },
    template:template,
    methods:{

    }
};
