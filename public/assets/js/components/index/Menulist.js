const template=`
    <template v-for="menu in list">
        <template v-if="menu.childlist && menu.childlist.length>0">
            <el-sub-menu :index="menu.id.toString()">
                <template #title>
                <i :class="menu.icon"></i>
                <span class="sle">{{menu.title}}</span>
                </template>
                <Menulist :list="menu.childlist" @onclickmenu="clickMenu"></Menulist>
            </el-sub-menu>
        </template>
        <template v-else>
            <el-menu-item :index="menu.id.toString()" @click="clickMenu(menu)">
            <i :class="menu.icon"></i>
            <template #title>
                <span class="sle">{{ menu.title }}</span>
            </template>
            </el-menu-item>
        </template>
    </template>
`;
export default {
    name: "Menulist",
    data: function () {
        return {

        }
    },
    props:{
        list: {
            type: Array,
            required: true,
        }
    },
    emits:['onclickmenu'],
    template:template,
    methods:{
        clickMenu:function (menu) {
            this.$emit('onclickmenu', menu);
        }
    }
};
