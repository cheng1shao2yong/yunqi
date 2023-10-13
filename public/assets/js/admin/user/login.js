export default{
    data(){
        return {
            captchaUrl:'',
            loginForm:{
                __token__:'',
                username: '',
                password: '',
                captcha: '',
                savepassword:0
            },
            rules:{
                username:[{required:true,message:'用户名不能为空！',}],
                password:[{required:true,message:'密码不能为空！',}],
            }
        }
    },
    onLoad:function (){
        this.refreshCaptcha();
    },
    onShow:function (){
        this.loginForm.__token__=document.getElementsByTagName('input')[0].value;
        this.loginForm.username= localStorage.getItem('username') || '';
        this.loginForm.password= localStorage.getItem('password') || '';
        this.loginForm.savepassword= localStorage.getItem('savepassword') || '';
    },
    methods:{
        refreshCaptcha:function (){
            this.captchaUrl=Yunqi.config.baseUrl+"captcha?"+Math.random();
        },
        login:function (){
            Yunqi.ajax.post('login',this.loginForm,true).then(res=>{
                if(this.loginForm.savepassword){
                    localStorage.setItem('username',this.loginForm.username);
                    localStorage.setItem('password',this.loginForm.password);
                    localStorage.setItem('savepassword',this.loginForm.savepassword);
                }else{
                    localStorage.removeItem('username');
                    localStorage.removeItem('password');
                    localStorage.removeItem('savepassword');
                }
                if(Yunqi.data.referer){
                    location.href=Yunqi.data.referer;
                }else{
                    location.href=Yunqi.config.baseUrl+'index';
                }
            }).catch(err=>{
                 if(err.data){
                    this.refreshCaptcha();
                 }
            });
        }
    }
}