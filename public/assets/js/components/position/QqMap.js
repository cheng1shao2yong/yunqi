const template=`
<component is="style">
      .searchPanel{
            width: 100%;
            position: relative;
            z-index: 999
      }
      .search{
            width: 100%;
      }
      .searchList{
            width: 100%;
            position: relative;
            top:5px;
      }
      .searchList .el-card__body{
            padding: 0;
      }
      .searchList ul{
            margin: 0;
            padding: 0;
      }
      .searchList ul li{
            list-style: none;
            height: 30px;
            line-height: 30px;     
            cursor: pointer;
            padding:0 15px;
      }
      .searchList ul li:hover{
            background: var(--el-color-primary-light-9);
      }
      #map-box{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 998;
            cursor: crosshair;
      }
      .confirmPosition{
            position: absolute;
            right: 10px;
            bottom: 10px;
            width:60px;
            z-index: 999;
      }
      .closePosition{
            position: absolute;
            right: 85px;
            bottom: 10px;
            width:60px;
            z-index: 999;
      }
</component>
<el-input v-model="input" placeholder="选择位置" :readonly="true">
     <template #append>
        <el-button type="primary" size="small" @click="show=true;">选择</el-button>
     </template>
</el-input>
<el-drawer
    v-model="show"
    custom-class="chooseIcon"
    size="100%"
    @opened="showMap"
    :show-close="false"
    direction="rtl">
    <template #title>
        <div class="searchPanel">
             <el-input v-model="search" class="search">
                <template #append>
                    <el-button type="primary" size="small" @click="searchMap">搜索</el-button>
                </template>
            </el-input>
            <el-card shadow="never" class="searchList" v-if="searchList.length>0">
                <ul>
                    <li v-for="item in searchList" @click="choose(item)">{{item.title}}</li>
                </ul>
            </el-card>
        </div>
    </template>
    <div id="map-box"></div>
    <el-button type="danger" class="closePosition" @click="show=false">取消</el-button> 
    <el-button type="primary" class="confirmPosition" @click="confirm">确认</el-button> 
</el-drawer>
`;
let marker,map;
export default {
    name: "qqmap",
    data: function () {
        return {
            input:'',
            map:'',
            marker:'',
            show:false,
            search:'',
            searchList:[]
        }
    },
    props:{
        value:''
    },
    mounted:function (){
        Yunqi.ajax.get('qqmap/key').then(res=>{
            Yunqi.use('https://map.qq.com/api/gljs?v=1.exp&key='+res);
        });
        if(this.value){
            this.input=this.value;
        }
    },
    emits:['change'],
    template:template,
    methods:{
        //搜索地图
        searchMap:function (){
            Yunqi.ajax.get('qqmap/search',{keywords:this.search},true,false).then(res=>{
                if(res){
                    this.searchList=res;
                }else{
                    Yunqi.message.info('没有找到相关位置')
                }
            });
        },
        choose:function (e){
            this.search=e.title;
            map.setZoom(18);
            map.setCenter(new TMap.LatLng(e.location.lat,e.location.lng));
            this.searchList=[];
        },
        confirm:function (){
            if(marker){
                let lat = Number(marker.geometries[0].position.lat).toFixed(8);
                let lng = Number(marker.geometries[0].position.lng).toFixed(8);
                this.input=lat+','+lng;
                this.$emit('change',this.input);
            }
            this.show=false;
        },
        parseMaker:function(lat,lng){
            marker = new TMap.MultiMarker({
                map: map,
                styles: {
                    "myStyle": new TMap.MarkerStyle({
                        "width": 24,  // 点标记样式宽度（像素）
                        "height": 24, // 点标记样式高度（像素）
                        "src": '/assets/img/zuobiao.png',
                    })
                },
                //点标记数据数组
                geometries: [{
                    "id": "1",   //点标记唯一标识，后续如果有删除、修改位置等操作，都需要此id
                    "styleId": 'myStyle',  //指定样式id
                    "position": new TMap.LatLng(lat, lng),  //点标记坐标位置
                    "properties": {
                        "title": ""
                    }
                }]
            });
        },
        showMap:function (){
            let container = document.getElementById("map-box");
            let lat='26.6015';
            let lng='106.62254';
            if(this.value){
                let arr=this.value.split(',');
                lat=arr[0];
                lng=arr[1];
            }
            let center = new TMap.LatLng(lat,lng);
            map = new TMap.Map(container, {
                center: center,
                zoom: 13,
                viewMode:'3D',
                minZoom:7
            });
            this.parseMaker(lat,lng);
            //点击map获取经纬度
            map.on("click", (e) => {
                if(marker){
                    marker.setMap(null);
                }
                let lat = e.latLng.lat;
                let lng = e.latLng.lng;
                this.parseMaker(lat,lng);
            });
        }
    }
};
