import fieldlist from '../../components/Fieldlist.js';
import form from "../../components/Form.js";
let inter;
export default{
    components:{'Fieldlist':fieldlist,'YunForm':form},
    data:{
        eventList:[],
        log:{
            currentPage:1,
            content:'',
            total:1
        },
        status:'',
        keeptime:0,
        stoptime:'',
        columns:[
            {"field":"title","title":__("任务名称"),"edit":"text","rules":"required"},
            {"field":"function","title":__("处理类"),"edit":"text","rules":"required"},
            {"field":"limit","title":__("限制次数"),"edit":{form:'input',type:'number',placeholder:'任务执行的次数，0为循环无限执行'},"rules":"required;range(0~)"},
            {"field":"filter","title":__("规则限制"),"edit":"slot"},
            {"field":"delay","title":__("间隔时间"),"edit":{form:'input',type:'number',placeholder:'两次执行间隔时间，0为立即执行',append:'秒'},"rules":"required;range(0~)"},
            {"field":"status","title":__("状态"),"edit":"switch","searchList":{"normal":"正常","hidden":"隐藏"},"formatter":Yunqi.formatter.switch},
        ]
    },
    onLoad:function(){
        Yunqi.ajax.get('develop/queueLog',{type:'total'}).then(res=>{
            this.log.total=res;
            this.log.currentPage=res;
        });
        Yunqi.ajax.get('develop/queue').then(res=>{
            this.eventList=res;
        });
        this.getStatus();
    },
    methods: {
        changeStatus:function (status){
            Yunqi.ajax.post('develop/queueStatus',{status:status}).then(res=>{
                this.getStatus();
                if(status){
                    this.log.total=1;
                    this.log.currentPage=1;
                }
            }).catch(err=>{
                this.getStatus();
            });
        },
        getLog:function (e){
            this.log.currentPage=e;
            Yunqi.ajax.get('develop/queueLog',{type:'content',page:e}).then(res=>{
                this.log.content=res;
            });
        },
        getStatus:function (){
            if(inter){
                clearInterval(inter);
            }
            Yunqi.ajax.get('develop/queueStatus').then(res=>{
                 this.status=res.status;
                 this.keeptime=res.keeptime;
                 this.stoptime=res.stoptime;
                 inter=setInterval(()=>{
                     if(this.keeptime%5===0 && this.log.currentPage==this.log.total){
                         this.getLog(this.log.total);
                     }
                     this.keeptime++;
                 },1000)
            });
        },
        changeFilter:function (e){
            this.$refs.yunform.setValue('filter',e);
        },
        delEvent:function (id){
            Yunqi.ajax.post('develop/delQueue',{id:id}).then(res=>{
                this.eventList=res;
            });
        },
        addEvent:function (){
            let that=this;
            Yunqi.api.open({
                url:'develop/addQueue',
                title:'添加任务',
                close:function (){
                    Yunqi.ajax.get('develop/queue').then(res=>{
                        that.eventList=res;
                    });
                }
            });
        },
        parseTime:function (second){
            if(second===0){
                return 0;
            }
            if(second>0 && second<60){
                return second+'秒';
            }
            if(second>=60 && second<3600){
                let r=Math.floor(second/60)+'分钟';
                if(second%60>0){
                    r+=second%60+'秒';
                }
                return r;
            }
            if(second>=3600 && second<86400){
                let r=Math.floor(second/3600)+'小时';
                if(second%3600>60){
                    r+=Math.floor(second%3600/60)+'分钟';
                }
                if(second%3600%60>0){
                    r+=second%3600%60+'秒';
                }
                return r;
            }
            if(second>=86400){
                let r=Math.floor(second/86400)+'天';
                if(second%86400>3600){
                    r+=Math.floor(second%86400/3600)+'小时';
                }
                if(second%86400%3600>60){
                    r+=Math.floor(second%86400%3600/60)+'分钟';
                }
                if(second%86400%3600%60>0){
                    r+=second%86400%3600%60+'秒';
                }
                return r;
            }
        },
        parseFilter:function (obj){
            if(!obj){
                return '-';
            }
            let r='';
            if(obj.Y!==undefined){
                r+='year:'+obj.Y+' ';
            }
            if(obj.m!==undefined){
                r+='month:'+obj.m+' ';
            }
            if(obj.d!==undefined){
                r+='day:'+obj.d+' ';
            }
            if(obj.H!==undefined){
                r+='hours:'+obj.H+' ';
            }
            if(obj.i!==undefined){
                r+='minute:'+obj.i+' ';
            }
            if(obj.s!==undefined){
                r+='second:'+obj.s+' ';
            }
            //去掉r最后的空格
            return r.replace(/\s*$/,'');
        },
        parseLasttime:function (data){
            if(!data){
                return '-';
            }
            return data;
        }
    }
}