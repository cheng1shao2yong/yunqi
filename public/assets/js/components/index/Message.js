const template=`
    <el-popover placement="bottom" :width="310" trigger="hover" @show="readMessage()">
      <template #reference>
        <div class="toolBar-dropdown" style="padding: 0 15px;">
            <el-badge :value="total" class="font-size-icon" :hidden="total===0">
              <i :class="['fa','fa-bell',total>0?'hava-message':'']"></i>
            </el-badge>
        </div>
      </template>
      <el-tabs v-model="activeName" v-if="list" @tab-change="changeTabs">
        <template v-for="(item,index) in list">
           <el-tab-pane :label="item.title+'('+item.list.length+')'" :name="index.toString()">
           <div class="message-list" v-if="item.list.length>0">
            <div class="message-item" v-for="msg in item.list" :style="formateStyle(msg.style)">
              <i :class="msg.icon+' message-icon'"></i>   
              <div class="message-content">
                <span class="message-title">{{msg.content}}</span>
                <div class="message-bottom">
                    <span @click="showMessage(msg)" class="message-show" v-if="msg.action">查看详情</span>
                    <span class="message-date">{{formateTime(msg.createtime)}}</span>
                </div>
              </div>
              <div class="message-tag">
                <el-tag type="success" v-if="msg.is_read"><i class="fa fa-check"></i> 已读</el-tag>
                <el-tag type="danger" v-else><i class="fa fa-key"></i> 未读</el-tag>
              </div>
            </div>
           </div>
           <div class="message-empty" v-else>
                <img :src="imgFolder+'notdata.png'" alt="notData" />
                <div>暂无消息</div>
           </div>
           </el-tab-pane>
        </template>
      </el-tabs>
    </el-popover>
`;
import {rand} from '../../util.js'
export default {
    name: "Message",
    data: function () {
        return {
            imgFolder:'',
            //消息总数
            total:0,
            activeName:'0',
            list:'',
        }
    },
    created:function (){
        this.imgFolder='/assets/img/';
    },
    mounted:function (){
        this.getMessage();
    },
    props:{

    },
    template:template,
    methods:{
        changeTabs:function (){
            this.readMessage();
        },
        readMessage:function (msg=''){
            //点击的时候之间阅读普通消息
            let ids=[];
            if(!msg){
                this.list[parseInt(this.activeName)].list.forEach(res=>{
                    if(!res.action){
                        res.is_read=true;
                        ids.push(res.id);
                    }
                });
            }else{
                msg.is_read=true;
                ids.push(msg.id);
            }
            if(ids.length===0){
                return;
            }
            Yunqi.ajax.post('ajax/message',{ids:ids},false,false).then(res=>{
                this.countMessage();
            });
        },
        //每5分钟执行一次
        getMessage:function (){
            Yunqi.ajax.get('ajax/message').then(res=>{
                this.list=res;
                this.countMessage();
                setTimeout(()=>{
                    this.getMessage();
                },60*1000*5)
            });
        },
        showMessage:function (msg){
            if(msg.action=='link'){
                window.open(msg.url,"_blank");
            }
            if(msg.action=='tab'){
                Yunqi.api.addtabs(msg.options);
            }
            if(msg.action=='layer'){
                Yunqi.api.open(msg.options);
            }
            this.readMessage(msg);
        },
        countMessage:function (){
            let r=0;
            this.list.forEach(tab=>{
                tab.list.forEach(msg=>{
                    if(msg.is_read==undefined){
                        r++;
                    }
                });
            });
            this.total=r;
        },
        formateStyle:function (style){
            return `color:var(--el-color-${style})`;
        },
        formateTime:function(timestamp) {
            timestamp=(new Date(timestamp+':00')).getTime();
            const now = new Date().getTime();
            const seconds = Math.floor((now - timestamp) / 1000);
            let interval = Math.floor(seconds / 31536000);
            if (interval >= 1) {
                return `${interval}年前`;
            }
            interval = Math.floor(seconds / 2592000);
            if (interval >= 1) {
                return `${interval}月前`;
            }
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                return `${interval}天前`;
            }
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) {
                return `${interval}小时前`;
            }
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
                return `${interval}分钟前`;
            }
            return `${Math.floor(seconds)}秒前`;
        }
    }
};
