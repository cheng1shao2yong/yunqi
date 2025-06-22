const template=`
     <slot v-if="isPermit()"></slot>
`;
import {inArray} from '../util.js';
export default {
    name: "Auth",
    data: function () {
        return {
            _controller:'',
        }
    },
    props: {
        controller: {
            type:String,
            default:''
        },
        action: {
            type:String,
            default:''
        },
        admin_id:{
            type:Array,
            default:[]
        },
        group_id: {
            type:Array,
            default:[]
        }
    },
    mounted:function (){
        this._controller=this.controller.replaceAll('\\\\','\\');
    },
    template:template,
    methods:{
        isPermit:function (){
            let b1=false,b2=false,b3 = false;
            if(this._controller && this.action){
                b1=Yunqi.auth.check(this._controller,this.action);
            }
            if(this.admin_id.length>0){
                b2 = inArray(this.admin_id,Yunqi.auth.admin.id);
            }
            if(this.group_id.length>0){
                for(let i=0;i<Yunqi.auth.admin.groupids.length;i++){
                    b3=inArray(this.group_id,Yunqi.auth.admin.groupids[i]);
                    if(b3) break;
                }
            }
            return b1 || b2 || b3;
        }
    }
};
