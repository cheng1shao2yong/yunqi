import table from "../../components/Table.js";
export default{
    components:{
        'YunTable':table
    },
    data:{
        extend:{
            index_url: 'demo/table/index',
            del_url: 'demo/table/del',
            edit_url: 'demo/table/edit',
            multi_url: 'demo/table/multi',
            download_url: 'demo/table/download',
            import_url: 'demo/table/import',
            recyclebin_url:'demo/table/recyclebin'
        },
        //查询与编辑的json可以合并在一起写，为了展示直观，我这里分开写
        indexColumns:[
            {checkbox: true,selectable:function (row,index){
                //可以根据业务需求返回false让某些行不可选中
                return true;
            }},
            {"field":"id","title":"ID","sortable":true,"operate":false},
            {"field":"username","title":"姓名"},
            {"field":"description","title":"介绍"},
            {"field":"status","title":"状态","operate":"select","searchList":{"normal":"正常","hidden":"隐藏"},"formatter":Yunqi.formatter.switch},
            {"field":"weigh","title":"权重","sortable":true},
            {"field":"updatetime","title":"修改时间","operate":"daterange","formatter":Yunqi.formatter.datetime},
            {
                field: 'operate',
                title: __('操作'),
                fixed:'right',
                width:180,
                action:{
                    sort:true,
                    del:true,
                    expand:true,
                    edit:function(row){
                        //可以根据业务需求返回false让按钮不显示
                        return true
                    },
                },
            }
        ]
    },
    //页面加载完成时执行
    //如果多个操作方法都执行相同的代码，可以定义为函数，onLoad:function(){...}
    onLoad:{

    },
    //页面初始显示或在框架内显示时执行
    onShow:{

    },
    //页面在框架内隐藏时执行
    onHide:{

    },
    //页面在框架内关闭时执行
    onUnload:{

    },
    methods: {
        test:function (){
            console.log(this.$refs.yunform.form_)
        },
        onTableRender:function(list){
            //表格渲染完成后执行
            /**
             * table常用方法
             * this.$refs.yuntable.reset();//重新渲染整个组件，当columns修改时，需要重新渲染表格才能生效，可以执行该方法。
             * this.$refs.yuntable.reload();//保持当前的page，重新获取数据
             * this.$refs.yuntable.submit();//返回第一页，重新获取数据
             * this.$refs.yuntable.expandAllTree();//树形表格展开所有节点
             * this.$refs.yuntable.expandTree(topid);//树形表格展开指定节点
             */
        },
    }
}