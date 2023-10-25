<?php

define('DS', DIRECTORY_SEPARATOR);

if(is_file(__DIR__.DS.'install.lock')){
    echo '已经安装过了，请先清空数据库，删除install.lock文件再安装';
    exit;
}
class Install{

    public function index(){
        require dirname(dirname(__DIR__)).DS.'app'.DS.'common'.DS.'library'.DS.'Http.php';
        $file=dirname(dirname(__DIR__)).DS.'vendor'.DS.'autoload.php';
        if(is_file($file)){
            require $file;
        }
        if (substr(php_uname(), 0, 7) == "Windows") {
            $operating_system = "Windows";
        }
        if (substr(php_uname(), 0, 5) == "Linux"){
            $operating_system = "Linux";
        }
        $php_version=phpversion();
        $yextends=[
            'topthink/framework'=>think\App::class,
            'think-annotation'=>think\annotation\route\Route::class,
            'think-acptcha'=>think\captcha\Captcha::class,
            'think-filesystem'=>think\Filesystem::class,
            'think-multi-app'=>think\app\MultiApp::class,
            'think-view'=>think\Template::class,
            'phpoffice/phpspreadsheet'=>PhpOffice\PhpSpreadsheet\Reader\Xlsx::class,
        ];
        foreach ($yextends as $key=>$value){
            if(class_exists($value)){
                $yextends[$key]=true;
            }else{
                $yextends[$key]=false;
            }
        }
        $htaccess=0;
        $response=\app\common\library\Http::get($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/kdfkslfsfd');
        if($response->isSuccess()){
            $htaccess=1;
        }else if(strpos($response->errorMsg,'thinkphp')!==false){
            $htaccess=1;
        }else if(strpos($response->errorMsg,'Yunqi')!==false){
            $htaccess=1;
        }
        $doman=$_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'];
        return compact('operating_system','htaccess','php_version','yextends','doman');
    }

    public function doInstall(){
        try {
            $host=$_POST['db_host'];
            $port=$_POST['db_port'];
            $dbuser=$_POST['db_user'];
            $dbpass=$_POST['db_pass'];
            $dbname=$_POST['db_name'];
            $prefix=$_POST['db_prefix'];
            $alisname=$_POST['alisname'];
            $sitename=$_POST['sitename'];
            $username=$_POST['username'];
            $mobile=$_POST['mobile'];
            $nickname=$_POST['nickname'];
            $password=$_POST['password'];
            $sqlpath=__DIR__.DS.'install.sql';
            if(!is_file($sqlpath)){
                throw new Exception('数据库文件不存在');
            }
            $tables=[];
            $fp=fopen($sqlpath,'r');
            while(!feof($fp)) {
                $line=fgets($fp);
                if(!$line){
                    continue;
                }
                if(strpos($line,'CREATE TABLE')!==false){
                    $prefixtable=substr($line,strpos($line,'`')+1);
                    $prefixtable=substr($prefixtable,0,strpos($prefixtable,'`'));
                    $table=str_replace('__PREFIX__',$prefix,$prefixtable);
                    $tables[$prefixtable]=$table;
                }
            }
            fclose($fp);
            $dsn="mysql:host={$host};port={$port};dbname={$dbname}";
            $pdo = new PDO($dsn, $dbuser, $dbpass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            //导入数据库文件
            $sql=file_get_contents($sqlpath);
            $pdo->exec($sql);
            //修改表名
            foreach ($tables as $old=>$newtable){
                $pdo->exec("alter table {$old} rename to {$newtable};");
            }
            //添加管理员
            $time=time();
            $salt=$this->str_rand(4);
            $password=md5(md5($password).$salt);
            $pdo->exec("INSERT INTO `{$prefix}admin` (`username`, `nickname`, `password`, `salt`, `avatar`, `mobile`, `groupids`, `status`, `createtime`, `updatetime`) VALUES ('{$username}', '{$nickname}', '{$password}', '{$salt}', '/assets/img/avatar.jpg', '{$mobile}', '1', 'normal', '{$time}', '{$time}');");
            //修改站点名称
            $pdo->exec("UPDATE `{$prefix}config` SET `value` = '{$sitename}' WHERE `{$prefix}config`.`name` = 'sitename' and `{$prefix}config`.`group` = 'basic';");
            //修改配置文件
            $env=<<<EOF
APP_DEBUG = true
APP_BACKEND = {$alisname}

DB_TYPE = mysql
DB_HOST = {$host}
DB_NAME = {$dbname}
DB_USER = {$dbuser}
DB_PASS = {$dbpass}
DB_PORT = {$port}
DB_PREFIX = {$prefix}
DB_CHARSET = utf8mb4
EOF;
            $envfile=dirname(dirname(__DIR__)).DS.'.env';
            file_put_contents($envfile,$env);
            //新建文件夹
            $dirs=[
                'public/upload',
                'storage',
                'addons',
                'runtime',
                'runtime/log',
                'runtime/admin',
                'runtime/temp',
                'runtime/cache'
            ];
            foreach ($dirs as $dir){
                $dir=dirname(dirname(__DIR__)).DS.$dir;
                mkdir($dir,0777,true);
            }
            file_put_contents(__DIR__.DS.'install.lock','install');
            echo json_encode(['code'=>1,'msg'=>'安装成功'],JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            echo json_encode(['code'=>0,'msg'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    public function checkConnect(){
        $host=$_POST['db_host'];
        $port=$_POST['db_port'];
        $username=$_POST['db_user'];
        $password=$_POST['db_pass'];
        $dbname=$_POST['db_name'];
        $dsn="mysql:host={$host};port={$port};dbname={$dbname}";
        try {
            new PDO($dsn, $username, $password);
            echo json_encode(['code'=>1,'msg'=>'数据库连接成功'],JSON_UNESCAPED_UNICODE);
        } catch (PDOException $e) {
            echo json_encode(['code'=>0,'msg'=>'数据库连接失败'],JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    private function str_rand($num,$str=''):string
    {
        if(!$str){
            $str='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        }
        $len=strlen($str)-1;
        $rand='';
        for($i=0;$i<$num;$i++){
            $rand.=$str[mt_rand(0,$len)];
        }
        return $rand;
    }
}
$action=isset($_GET['action'])?$_GET['action']:'index';
$result=(new Install())->$action();
?>
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>系统安装</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="renderer" content="webkit">
    <meta name="referrer" content="never">
    <meta name="robots" content="noindex, nofollow">
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/assets/css/element-plus.css" />
    <link rel="stylesheet" href="/assets/libs/font-awesome/css/font-awesome.min.css" />
    <script type="text/javascript" src="/assets/js/vue.global.js"></script>
    <script type="text/javascript" src="/assets/js/element-plus.js"></script>
    <script type="text/javascript" src="/assets/js/axios.min.js"></script>
    <style>
        body {
            padding: 0;
            margin: 0;
        }
        #container{
            position: fixed;
            left:0;
            right:0;
            top:0;
            bottom:0;
            background-image: url('/assets/img/bg.svg');
            background-size: cover;
            display: none;
            flex-direction: column;
            justify-content: center;
        }
        .install-card{
            width: 800px;
            margin:0px auto;
        }
        .el-card__body{
            padding: 8px;
        }
        .title{
            font-weight: bold;
            font-size: 26px;
            text-align: center;
        }
        .btn-box{
            display: flex;
            justify-content: space-between;
        }
        .fa-check{
            color: green;
        }
        .fa-remove{
            color: red;
        }
        .success{
            color: green;
            font-size: 28px;
            margin: 30px 0;
            text-align: center;
        }
    </style>
</head>
<body>
<div id="app">
    <el-container>
        <el-main id="container">
            <div class="install-box">
                <el-card class="install-card">
                    <template #header>
                        <div class="title">安装云起-YunQi管理系统</div>
                    </template>
                    <el-steps :active="step" finish-status="success" simple style="margin-bottom: 8px;">
                        <el-step title="环境检测"></el-step>
                        <el-step title="填写Mysql参数"></el-step>
                        <el-step title="管理员资料"></el-step>
                    </el-steps>
                    <template v-if="step===0">
                        <el-form :model="env" :rules="rules" ref="formRef1" label-width="150px">
                            <el-form-item label="操作系统:" prop="operating_system">
                                {{env.operating_system}}
                            </el-form-item>
                            <el-form-item label="PHP环境:" prop="php_version">
                                {{env.php_version}}&nbsp;&nbsp;
                                <i class="fa fa-check" v-if="parseInt(env.php_version.slice(0,1))===8"></i>
                                <i class="fa fa-remove" v-else></i>
                            </el-form-item>
                            <el-form-item label="Thinkphp伪静态:" prop="htaccess">
                                {{env.htaccess?'已开启':'未开启'}}&nbsp;&nbsp;
                                <i class="fa fa-check" v-if="env.htaccess"></i>
                                <i class="fa fa-remove" v-else></i>
                            </el-form-item>
                            <el-form-item label="依赖扩展:" prop="yextends">
                                <div>
                                <span v-for="(yextends,key) in env.yextends">
                                    {{key}}&nbsp;&nbsp;
                                    <i class="fa fa-check" v-if="yextends"></i>
                                    <i class="fa fa-remove" v-else></i>
                                    <br>
                                </span>
                                </div>
                            </el-form-item>
                        </el-form>
                    </template>
                    <el-form :model="form" :rules="rules" ref="formRef2" label-width="150px" v-if="step===1 || step===2">
                        <template v-if="step===1">
                            <el-form-item label="Mysql地址:" prop="db_host">
                                <el-input v-model="form.db_host"></el-input>
                            </el-form-item>
                            <el-form-item label="Mysql端口:" prop="db_port">
                                <el-input v-model="form.db_port" type="number"></el-input>
                            </el-form-item>
                            <el-form-item label="Mysql数据库名:" prop="db_name">
                                <el-input v-model="form.db_name"></el-input>
                            </el-form-item>
                            <el-form-item label="Mysql用户名:" prop="db_user">
                                <el-input v-model="form.db_user"></el-input>
                            </el-form-item>
                            <el-form-item label="Mysql密码:" prop="db_pass">
                                <el-input v-model="form.db_pass"></el-input>
                            </el-form-item>
                            <el-form-item label="Mysql表前缀:" prop="db_prefix">
                                <el-input v-model="form.db_prefix"></el-input>
                            </el-form-item>
                        </template>
                        <template v-if="step===2">
                            <el-form-item label="系统名称:" prop="sitename">
                                <el-input v-model="form.sitename"></el-input>
                            </el-form-item>
                            <el-form-item label="管理后台别名:" prop="alisname">
                                <el-input v-model="form.alisname" placeholder="为系统安全考虑，推荐使用随机生成不定长度的字符串作为后台别名">
                                    <template #append>
                                        <el-button type="primary" @click="rand">随机生成</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="管理员昵称:" prop="nickname">
                                <el-input v-model="form.nickname"></el-input>
                            </el-form-item>
                            <el-form-item label="管理员用户名:" prop="username">
                                <el-input v-model="form.username"></el-input>
                            </el-form-item>
                            <el-form-item label="管理员手机号:" prop="mobile">
                                <el-input v-model="form.mobile"></el-input>
                            </el-form-item>
                            <el-form-item label="管理员密码:" prop="password">
                                <el-input v-model="form.password" type="password"></el-input>
                            </el-form-item>
                            <el-form-item label="重复管理员密码:" prop="rpassword">
                                <el-input v-model="form.rpassword" type="password"></el-input>
                            </el-form-item>
                        </template>
                    </el-form>
                    <template v-if="step===3">
                        <div class="success">
                            <i class="fa fa-check"></i>安装成功
                        </div>
                        <el-form label-width="150px">
                            <el-form-item label="系统名称:" prop="sitename">
                                <el-input v-model="form.sitename" readonly></el-input>
                            </el-form-item>
                            <el-form-item label="管理员昵称:" prop="nickname">
                                <el-input v-model="form.nickname" readonly></el-input>
                            </el-form-item>
                            <el-form-item label="管理员用户名:" prop="username">
                                <el-input v-model="form.username" readonly></el-input>
                            </el-form-item>
                            <el-form-item label="删除安装目录:">
                                <el-checkbox-group v-model="form.del">
                                    <el-checkbox :label="1">
                                        <span></span>
                                    </el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="登陆后台:" prop="username">
                                <el-input v-model="backend" readonly>
                                    <template #append>
                                        <el-button type="primary" @click="goBackend">进入</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </template>
                    <el-divider style="margin-top:0;margin-bottom: 10px"></el-divider>
                    <div class="btn-box">
                        <el-button @click="prefix" v-if="step===1 || step===2" style="width: 49%;" type="primary">上一步</el-button>
                        <el-button @click="next" v-if="step===0 || step===1" :style="(step===0)?'width: 100%;':'width: 49%;'" type="primary">下一步</el-button>
                        <el-button @click="install" v-if="step===2" style="width: 49%;" type="danger">点击安装</el-button>
                    </div>
                </el-card>
            </div>
        </el-main>
    </el-container>
</div>
</body>
<script type="module">
    import * as zhCn from '/assets/js/zh-cn.js';
    import {rand} from '/assets/js/util.js';
    let Counter={
        data(){
            let that=this;
            return {
                form:{
                    db_host:'127.0.0.1',
                    db_name:'',
                    db_user:'',
                    db_pass:'',
                    db_port:'3306',
                    db_prefix:'yun_',
                    sitename:'我的网站',
                    alisname:'',
                    nickname:'超级管理员',
                    username:'admin',
                    mobile:'',
                    password:'',
                    rpassword:'',
                    domain:'<?php echo $result['doman']; ?>',
                    del:[1]
                },
                backend:'',
                env:{
                    operating_system:'<?php echo $result['operating_system']; ?>',
                    htaccess:<?php echo $result['htaccess']; ?>,
                    php_version:'<?php echo $result['php_version']; ?>',
                    yextends:<?php echo json_encode($result['yextends']); ?>,
                },
                step:0,
                rules:{
                    htaccess:[{message:'请开启Thinkphp伪静态',trigger:'blur',validator:function(rule, value, callback){
                            if(!value){
                                callback(new Error('请开启Thinkphp伪静态'));
                            }
                            callback();
                        }
                    }],
                    php_version:[{message:'php环境至少大于8.0',validator:function(rule, value, callback){
                            if(parseInt(value)<8){
                                callback(new Error('php环境至少大于8.0'));
                            }
                            callback();
                        }
                    }],
                    yextends:[{trigger:'blur',message:'请先安装扩展',validator:function(rule, value, callback){
                            for(let k in value){
                                if(!value[k]){
                                    callback(new Error(value[k].name+'未安装'));
                                }
                            }
                            callback();
                        }
                    }],
                    db_host:[{required:true,message:'请输入Mysql地址',trigger:'blur'}],
                    db_name:[{required:true,message:'请输入Mysql数据库名',trigger:'blur'}],
                    db_user:[{required:true,message:'请输入Mysql用户名',trigger:'blur'}],
                    db_pass:[{required:true,message:'请输入Mysql密码',trigger:'blur'}],
                    db_port:[{required:true,message:'请输入Mysql端口',trigger:'blur'}],
                    db_prefix:[{required:true,message:'请输入Mysql表前缀',trigger:'blur'}],
                    sitename:[{required:true,message:'请输入系统名称',trigger:'blur'}],
                    alisname:[{required:true,message:'请输入管理后台别名',trigger:'blur'}],
                    nickname:[{required:true,message:'请输入管理员昵称',trigger:'blur'}],
                    username:[{required:true,message:'请输入管理员用户名',trigger:'blur'}],
                    mobile:[{required:true,trigger:'blur',validator:function (rule, value, callback){
                            if(!value){
                                callback(new Error('请输入管理员手机号码'));
                            }
                            if(!(/^1[3456789]\d{9}$/.test(value))){
                                callback(new Error('手机号码格式不正确'));
                            }
                            callback();
                        }
                    }],
                    password:[{required:true,message:'请输入管理员密码',trigger:'blur'}],
                    rpassword:[{required:true,trigger:'blur',validator:function (rule, value, callback){
                            if(value!==that.form.password){
                                callback(new Error('两次密码不一致'));
                            }
                            callback();
                        }
                    }],
                }
            };
        },
        mounted:function (){
            this.rand();
            document.getElementById('container').style.display='flex';
        },
        methods:{
            install:function (){
                this.$refs.formRef2.validate((valid, fields)=>{
                    if(valid){
                        let elloading=ElementPlus.ElLoading.service({text:'系统安装中..'});
                        axios({
                            url: '?action=doInstall',
                            data: this.form,
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(res=>{
                            elloading.close();
                            if(res.data.code===0){
                                ElementPlus.ElMessage.error(res.data.msg);
                                return;
                            }
                            this.backend=this.form.domain+'/'+this.form.alisname;
                            this.step++;
                        });
                    }
                });
            },
            prefix:function (){
                this.step--;
            },
            next:function (){
                let ref;
                let fields=[];
                if(this.step===0) {
                    ref = 'formRef1';
                    fields=['php_version','htaccess','yextends'];
                }
                if(this.step===1) {
                    ref = 'formRef2';
                    fields=Object.keys(this.form);
                }
                let promiseAll=[];
                for(let i=0;i<fields.length;i++){
                    let promise=new Promise((resolve,reject)=>{
                        this.$refs[ref].validateField(fields[i],valid=>{
                            if(valid){
                                resolve();
                            }else{
                                reject();
                            }
                        });
                    });
                    promiseAll.push(promise);
                }
                if(this.step==1){
                    let promise=new Promise((resolve,reject)=>{
                        axios({
                            url: '?action=checkConnect',
                            data: {
                                db_host:this.form.db_host,
                                db_name:this.form.db_name,
                                db_user:this.form.db_user,
                                db_pass:this.form.db_pass,
                                db_port:this.form.db_port
                            },
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(res=>{
                            let r=res.data;
                            if(r.code===1){
                                resolve();
                            }else{
                                ElementPlus.ElMessage.error(r.msg);
                                reject();
                            }
                        });
                    });
                    promiseAll.push(promise);
                }
                Promise.all(promiseAll).then(()=>{
                    this.step++;
                });
            },
            //生成6到10位的随机字符串
            rand:function (){
                let num=rand(6,12);
                let str='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let res='';
                for(let i=0;i<num;i++){
                    res+=str[rand(0,str.length-1)];
                }
                this.form.alisname=res;
            },
            goBackend:function (){
                let append='';
                if(this.form.del[0]){
                    append='?del_install=1';
                }
                location.href=this.backend+append;
            }
        }
    };
    let app=Vue.createApp(Counter);
    app.use(ElementPlus, {locale: zhCn});
    app.mount('#app');
</script>
</html>