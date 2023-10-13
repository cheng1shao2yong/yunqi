export default{
    data:{
        echarts:'',
        panel:[],
        line:{
            date:[],
            data:[]
        },
        table:[],
        bar:{
            date:[],
            name:[],
            data:[]
        },
        pie:[],
        order:{
            percentage:[0,0]
        },
        filterForm:{
            table:'all',
            select:'one',
            datepicker:['2023-01-01','2023-02-01'],
        }
    },
    onLoad:{
        index:function (){
            Yunqi.use('/assets/js/echarts.min.js').then(res=>{
                this.echarts=res;
                this.parseData();
            });
        }
    },
    methods:{
        parseData:function (){
            Yunqi.ajax.get('dashboard/index',{}).then(res=>{
                this.panel=res.panel;
                this.line=res.line;
                this.table=res.table;
                this.bar=res.bar;
                this.pie=res.pie;
                this.order=res.order;
                this.chart1();
                this.chart2();
                this.chart3();
            });
        },
        chart1:function () {
            let mychart = this.echarts.init(document.getElementById('chart1'), 'walden');
            mychart.setOption({
                title: {text: '每日新增用户数',left: 'center'},
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: false,
                    feature: {
                        magicType: {show: true, type: ['stack', 'tiled']},
                        saveAsImage: {show: true}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.line.date
                },
                yAxis: {},
                grid: [{
                    left: 40,
                    top: 40,
                    right: 0,
                    bottom:30
                }],
                series: [{
                    name: '注册用户',
                    type: 'line',
                    smooth: true,
                    areaStyle: {
                        normal: {}
                    },
                    lineStyle: {
                        normal: {
                            width: 1.5
                        }
                    },
                    data: this.line.data
                }]
            });
            window.addEventListener('resize',()=>{
                mychart.resize();
            });
        },
        chart2:function (){
            let mychart = this.echarts.init(document.getElementById('chart2'))
            mychart.setOption({
                title: {text: '消费比例图',left: 'center'},
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                },
                series: [{
                    type: 'pie',
                    data:this.pie,
                    label: {
                        normal: {
                            show: true,
                            formatter: "￥{c}",
                        }
                    }
                }]
            });
            window.addEventListener('resize',()=>{
                mychart.resize();
            });
        },
        chart3:function (){
            let mychart = this.echarts.init(document.getElementById('chart3'))
            mychart.setOption({
                title: {text: '消费日历图',left: 'center'},
                legend: {
                    orient: 'vertical',
                    left: 'left',
                },
                yAxis: {},
                xAxis: {
                    data: this.bar.date
                },
                grid: [{
                    left: 100,
                    top: 40,
                    right: 40,
                    bottom:20
                }],
                series: [
                    {
                        type: 'bar',
                        name:this.bar.name[0],
                        data: this.bar.data[0]
                    },
                    {
                        type: 'bar',
                        name:this.bar.name[1],
                        data: this.bar.data[1]
                    },
                    {
                        type: 'bar',
                        name:this.bar.name[2],
                        data: this.bar.data[2]
                    }
                ]
            });
            window.addEventListener('resize',()=>{
                mychart.resize();
            });
        },
        changeForm:function (type){
            if(type){
                this.filterForm.table=type;
            }
            this.parseData();
        }
    }
}