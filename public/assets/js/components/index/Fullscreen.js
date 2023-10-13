const template=`
    <div class="toolBar-icon font-size-icon" @click="changeFullScreen" style="position: relative;">
         <i :class="['fa',isFull?'fa-compress':'fa-arrows-alt']"></i>
    </div>
`;
export default {
    name: "Fullscreen",
    data: function () {
        return {
            isFull:false
        }
    },
    created:function (){

    },
    props:{

    },
    template:template,
    methods:{
        changeFullScreen:function (){
            var doc = document.documentElement;
            if (this.isFull) {
                this.isFull=false;
                document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
            } else {
                this.isFull=true;
                doc.requestFullscreen ? doc.requestFullscreen() : doc.mozRequestFullScreen ? doc.mozRequestFullScreen() : doc.webkitRequestFullscreen ? doc.webkitRequestFullscreen() : doc.msRequestFullscreen && doc.msRequestFullscreen();
            }
        }
    }
};
