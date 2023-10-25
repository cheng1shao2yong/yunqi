<?php
/**
 * ----------------------------------------------------------------------------
 * 行到水穷处，坐看云起时
 * 开发软件，找贵阳云起信息科技，官网地址:https://www.56q7.com/
 * ----------------------------------------------------------------------------
 * Author: 老成
 * email：85556713@qq.com
 */
declare(strict_types=1);

namespace app\admin\service\addons;

use app\common\model\AuthRule;
use app\common\model\Config;
use app\common\service\BaseService;
use app\common\library\Http;
use app\common\model\Addons;
use think\facade\Db;

class AddonsService extends BaseService {

    private $pluginsPath;

    private $pluginsHost;

    private $menuid;

    protected function init()
    {
        $this->pluginsPath=root_path().'addons'.DS;
        $this->pluginsHost=config('yunqi.plugins_host');
    }

    public function getAddonsPath(string $type,string $pack)
    {
        $path=$this->pluginsPath.$type.DS.$pack.DS;
        return $path;
    }

    public function getAddonsPack(string $type,string $pack,string $version)
    {
        $path=$this->pluginsPath.$type.DS.$pack.DS.$version.'.zip';
        return $path;
    }

    public function delAddons(string $key)
    {
        /* @var Addons $addon*/
        $addon=Addons::where('key',$key)->find();
        $addonpath=$this->getAddonsPath($addon['type'],$addon['pack']);
        rmdirs($addonpath);
        $addon->delete();
    }

    public function download(array $addon)
    {
        $packdir=$this->pluginsPath.$addon['type'].DS.$addon['pack'];
        if(is_dir($packdir)){
            throw new \Exception('存在同名的包【'.$packdir.'】，请先卸载');
        }
        $savefile=$this->getAddonsPack($addon['type'],$addon['pack'],$addon['version']);
        $transaction_id=isset($addon['transaction_id'])?$addon['transaction_id']:'';
        $response=Http::download($this->pluginsHost.'/addons/download?key='.$addon['key'].'&transaction_id='.$transaction_id,$savefile);
        if(!$response->isSuccess()){
            rmdirs($packdir);
            throw new \Exception($response->errorMsg);
        }
        //解压下载文件
        $zip = new \ZipArchive();
        if ($zip->open($savefile) === TRUE) {
            $addonspath=$this->getAddonsPath($addon['type'],$addon['pack']);
            $package=$addonspath.'package'.DS;
            $zip->extractTo($package);
            $zip->close();
            $this->copy_file($package.'Install.php',$addonspath.'Install.php');
            if(is_file($package.'install.sql')){
                $this->copy_file($package.'install.sql',$addonspath.'install.sql');
                unlink($package.'install.sql');
            }
            unlink($package.'Install.php');
            unlink($savefile);
            (new Addons())->save($addon);
        } else {
            throw new \Exception('解压失败');
        }
    }

    public function checkPayStatus(string $key,string $out_trade_no)
    {
        $response=Http::get($this->pluginsHost.'/addons/checkpay?key='.$key.'&out_trade_no='.$out_trade_no);
        if(!$response->isSuccess()){
            throw new \Exception($response->errorMsg);
        }
        return $response->content;
    }

    public function uninstall(string $key,array $actions)
    {
        $addon=Addons::where('key',$key)->find();
        $this->includeInstall($addon);
        $addonpath=$this->getAddonsPath($addon['type'],$addon['pack']);
        if(!is_file($addonpath.'Install.php')){
            throw new \Exception('安装文件不存在');
        }
        $install='\\addons\\'.$addon['type'].'\\'.$addon['pack'].'\\Install';
        try{
            Db::startTrans();
            //删除菜单
            if(in_array('menu',$actions)){
                AuthRule::where(['addons'=>$addon['pack']])->delete();
            }
            //删除配置
            if(in_array('config',$actions)){
                Config::where(['addons'=>$addon['pack']])->delete();
            }
            //删除数据表
            if(in_array('tables',$actions)){
                $tables=$this->parseTable($addonpath);
                foreach ($tables as $table){
                    $sql="drop table {$table};";
                    Db::execute($sql);
                }
            }
            //卸载文件
            foreach ($install::$files as $file){
                $path=root_path().$file;
                if(is_file($path)){
                    unlink($path);
                }
                if(is_dir($path)){
                    rmdirs($path);
                }
            }
            $install::uninstall();
            $addon->install=0;
            $addon->save();
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            throw new \Exception($e->getMessage());
        }
    }

    public function getAddonsInstallInfo(string $key)
    {
        $addon=Addons::where('key',$key)->find();
        $this->includeInstall($addon);
        $addonpath=$this->getAddonsPath($addon['type'],$addon['pack']);
        if(!is_file($addonpath.'Install.php')){
            throw new \Exception('安装文件不存在');
        }
        $install='\\addons\\'.$addon['type'].'\\'.$addon['pack'].'\\Install';
        return [$addon,$install::$menu,$install::$config,array_values($this->parseTable($addonpath))];
    }

    public function payCode(string $key,string $out_trade_no)
    {
        $response=Http::get($this->pluginsHost.'/addons/paycode?key='.$key.'&out_trade_no='.$out_trade_no);
        if(!$response->isSuccess()){
            throw new \Exception($response->errorMsg);
        }
        return $response->content;
    }

    public function install(string $key)
    {
        $addon=Addons::where('key',$key)->find();
        $this->includeInstall($addon);
        $addonpath=$this->getAddonsPath($addon['type'],$addon['pack']);
        if(!is_file($addonpath.'Install.php')){
            throw new \Exception('安装文件不存在');
        }
        if(!is_dir($addonpath.'package')){
            throw new \Exception('安装包不存在');
        }
        $install='\\addons\\'.$addon['type'].'\\'.$addon['pack'].'\\Install';
        if(!$this->checkInstallFiles($install::$files,$error)){
            throw new \Exception($error);
        }
        //检测表是否存在
        $tables=$this->parseTable($addonpath);
        foreach ($tables as $table){
            if(!empty(Db::query("SHOW TABLES LIKE '{$table}'"))){
                throw new \Exception('表【'.$table.'】已存在');
            }
        }
        //检测配置是否冲突
        foreach ($install::$config as &$value){
            $havaconfig=Config::where(['name'=>$value['name'],'group'=>'addons'])->find();
            if($havaconfig){
                throw new \Exception('配置【'.$value['title'].'】已存在');
            }
            $value['group']='addons';
            $value['addons']=$addon['pack'];
            $value['can_delete']=1;
            $value['value']=$value['value']??'';//默认值
        }
        //检测依赖
        foreach ($install::$require as $require){
            if(!class_exists($require)){
                throw new \Exception('缺少类：'.$require.'，请先安装依赖包或扩展');
            }
        }
        //安装菜单
        $this->menuid=(int)AuthRule::max('id')+1;
        $menus=$this->parseMenu($install::$menu,$addon['pack']);
        try{
            Db::startTrans();
            Db::name('auth_rule')->insertAll($menus);
            //安装配置
            (new Config())->saveAll($install::$config);
            //安装sql
            if(is_file($addonpath.'install.sql')){
                //直接导入数据库文件
                $sql=file_get_contents($addonpath.'install.sql');
                $this->installSql($sql);
                //修改表名
                foreach ($tables as $old=>$newtable){
                    Db::execute("alter table {$old} rename to {$newtable};");
                }
            }
            //安装文件
            $package=$addonpath.'package'.DS;
            foreach ($install::$files as $file){
                $path=$package.$file;
                if(is_dir($path)){
                    $this->copy_dir($path,root_path().$file);
                }
                if(is_file($path)){
                    $this->copy_file($path,root_path().$file);
                }
            }
            $install::install();
            $addon->install=1;
            $addon->save();
            Db::commit();
        }catch(\Exception $e){
            Db::rollback();
            throw new \Exception($e->getMessage());
        }
    }

    //安装sql文件
    private function installSql(string $sql)
    {
        $host=config('database.connections.mysql.hostname');
        $port=config('database.connections.mysql.hostport');
        $dbname=config('database.connections.mysql.database');
        $dbuser=config('database.connections.mysql.username');
        $dbpass=config('database.connections.mysql.password');
        $dsn="mysql:host={$host};port={$port};dbname={$dbname}";
        $pdo = new \PDO($dsn, $dbuser, $dbpass);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $pdo->exec($sql);
    }

    public function checkTransactionId(string $pack,string $transaction_id)
    {
        $response=Http::get($this->pluginsHost.'/addons/checktransactionid?pack='.$pack.'&transaction_id='.$transaction_id);
        if(!$response->isSuccess()){
            throw new \Exception($response->errorMsg);
        }
        return $response->content;
    }

    public function package(string $key)
    {
        $addon=Addons::where('key',$key)->find();
        if(!Addons::checkKey($addon)){
            //禁止修改、删除，否则后果自负
            throw new \Exception('不是你的扩展，无法操作');
        }
        $this->includeInstall($addon);
        $packfile=$this->getAddonsPack($addon['type'],$addon['pack'],$addon['version']);
        if(is_file($packfile)){
            throw new \Exception('已经打包过了');
        }
        $addonpath=$this->getAddonsPath($addon['type'],$addon['pack']);
        if(!is_file($addonpath.'Install.php')){
            throw new \Exception('安装文件不存在');
        }
        $install='\\addons\\'.$addon['type'].'\\'.$addon['pack'].'\\Install';
        if(!$this->checkPackFiles($install::$files,$error)){
            throw new \Exception($error);
        }
        $package=$addonpath.'package'.DS;
        foreach ($install::$files as $file){
            $path=root_path().$file;
            if(is_dir($path)){
                $this->copy_dir($path,$package.$file,$install::$unpack);
            }
            if(is_file($path)){
                $this->copy_file($path,$package.$file,$install::$unpack);
            }
        }
        $zip=new \ZipArchive();
        $zip->open($packfile,\ZipArchive::CREATE);
        self::addFileToZip($package,$package,$zip);
        //追加安装文件
        $zip->addFile($addonpath.'Install.php','Install.php');
        //追加数据库文件
        if(is_file($addonpath.'install.sql')){
            $zip->addFile($addonpath.'install.sql','install.sql');
        }
        $zip->close();
        $addon->save();
    }

    public function create(array $param)
    {
        include __DIR__.DS.'eof.php';
        $pack=$param['pack'];
        $addons=Addons::where('pack',$pack)->find();
        if($addons){
            throw new \Exception('包名已经存在，请更换包名');
        }
        $type=$param['type'];
        $addonspath=$this->getAddonsPath($type,$pack);
        if(is_dir($addonspath)){
            throw new \Exception('扩展目录已经存在，请先删除');
        }
        $files=$param['files'];
        //将换行符转换为数组
        $files=array_map(function ($file){
            return trim($file);
        },explode("\n",$files));
        if(!$this->checkCreateFiles($files,$error)){
            throw new \Exception($error);
        }
        $unpack=$param['unpack'];
        $unpack=array_map(function ($file){
            return trim($file);
        },explode("\n",$unpack));
        //设置依赖
        $require=$param['require'];
        $require=array_map(function ($class){
            return trim($class);
        },explode("\n",$require));
        $config=Config::whereIn('id',$param['config'])->select()->toArray();
        $menu=AuthRule::getRuleList($param['menu']);
        //加密密钥
        $param['secret_key']=md5(str_rand(10).rand(1000,9999));
        //生成key
        $param['key']=md5($param['type'].$param['pack'].$param['author'].$param['version'].$param['secret_key']);
        //创建Install文件
        $files_txt=rtrim(getFilesTxt($files));
        $unpack_txt=rtrim(getUnpackTxt($unpack));
        $require_txt=rtrim(getRequireTxt($require));
        $config_txt=rtrim(getConfigTxt($config));
        $menu_txt=rtrim(getMenuTxt($menu));
        $install=$this->getContent('install',[
            'pack'=>$pack,
            'type'=>$type,
            'files'=>$files_txt,
            'unpack'=>$unpack_txt,
            'require'=>$require_txt,
            'config'=>$config_txt,
            'menu'=>$menu_txt,
        ]);
        //创建打包目录
        $package=$addonspath.'package'.DS;
        mkdir($package,0777,true);
        file_put_contents($addonspath.'Install.php',$install);
        //拷贝数据文件
        $tables=$param['tables'];
        if($tables){
            $savesql=$addonspath.'install.sql';
            $prefix=config('database.connections.mysql.prefix');
            $sqltxt='';
            foreach ($tables as $table){
                $nopretable=str_replace($prefix,'__PREFIX__',$table);
                $createComment=PHP_EOL.'-- 创建表结构 `'.$nopretable.'`'.PHP_EOL;
                $sql="SHOW CREATE TABLE `{$table}`";
                $createResult=Db::query($sql)[0]['Create Table'].';';
                $createResult=str_replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS',$createResult);
                $createResult=str_replace($prefix,'__PREFIX__',$createResult);
                $sql="select * from `{$table}`";
                $data=Db::query($sql);
                $insertComment='';
                $insertResult='';
                if(count($data)>0){
                    $insertComment=PHP_EOL.PHP_EOL.'-- 导入表数据 `'.$nopretable.'`'.PHP_EOL;
                    $insertResult='';
                    foreach ($data as $item){
                        $insertResult.="INSERT INTO `{$nopretable}` VALUES (";
                        foreach ($item as $value){
                            if($value===null) {
                                $insertResult .= 'null,';
                            }else if(is_string($value)){
                                $value=addslashes($value);
                                $insertResult.="'{$value}',";
                            }else{
                                $insertResult.="'{$value}',";
                            }
                        }
                        $insertResult=rtrim($insertResult,',');
                        $insertResult.=");".PHP_EOL;
                    }
                }else{
                    $createResult.=PHP_EOL;
                }
                $sqltxt.=$createComment.$createResult.$insertComment.$insertResult;
            }
            file_put_contents($savesql,$sqltxt);
        }
        //拷贝文件
        foreach ($files as $file){
            $path=root_path().$file;
            if(is_dir($path)){
                $this->copy_dir($path,$package.$file,$unpack);
            }
            if(is_file($path)){
                $this->copy_file($path,$package.$file,$unpack);
            }
        }
        $param['install']=1;
        (new Addons())->save($param);
    }

    public function getAddons(int $page,string $type,string $plain,int $limit,string $keywords='')
    {
        $data=[
            'page'=>$page,
            'type'=>$type,
            'plain'=>$plain,
            'limit'=>$limit
        ];
        if($keywords){
            $data['keywords']=$keywords;
        }
        $response=Http::get($this->pluginsHost.'/addons/list',$data);
        if($response->isSuccess()){
            return $response->content;
        }else{
            return [
                'total'=>0,
                'rows'=>[]
            ];
        }
    }

    private function parseMenu(array $menu,string $pack,int $pid=0)
    {
        $time=time();
        $rr=[];
        foreach ($menu as $item){
            $id=$this->menuid;
            $arr=[];
            $arr['id']=$id;
            $arr['pid']=isset($item['pid'])?$item['pid']:$pid;
            $arr['addons']=$pack;
            $arr['controller']=$item['controller'];
            $arr['action']=$item['action'];
            $arr['title']=$item['title'];
            $arr['icon']=$item['icon'];
            $arr['weigh']=$item['weigh'];
            $arr['ismenu']=$item['ismenu'];
            $arr['extend']=$item['extend'];
            if($arr['ismenu']){
                $arr['status']='normal';
                $arr['menutype']=$item['menutype'];
            }else{
                $arr['status']=null;
                $arr['menutype']=null;
            }
            $arr['createtime']=$time;
            $arr['updatetime']=$time;
            $rr[]=$arr;
            $this->menuid++;
            if(isset($item['childlist'])){
                $ir=$this->parseMenu($item['childlist'],$pack,$id);
                $rr=array_merge($rr,$ir);
            }
        }
       return $rr;
    }

    private function parseTable(string $addonspath)
    {
        $sqlpath=$addonspath.'install.sql';
        if(!is_file($sqlpath)){
            return [];
        }
        $prefix=config('database.connections.mysql.prefix');
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
        return $tables;
    }

    private function addFileToZip(string $root,string $folder,\ZipArchive $zip){
        $handler=opendir($folder);
        while (($filename=readdir($handler))!==false){
            if($filename!='.' && $filename!='..'){
                if(is_dir($folder.$filename)){
                    $this->addFileToZip($root,$folder.$filename.DS,$zip);
                }else{
                    $writefile=substr($folder,strlen($root));
                    $zip->addFile($folder.$filename,$writefile.$filename);
                }
            }
        }
        @closedir($handler);
    }

    private function includeInstall(Addons $addon)
    {
        $install=root_path().'addons'.DS.$addon['type'].DS.$addon['pack'].DS.'Install.php';
        include $install;
    }

    private function checkInstallFiles(array $files,&$error)
    {
        usort($files,function ($x,$y){
            return strlen($x)-strlen($y);
        });
        foreach ($files as $k1=>$file)
        {
            foreach ($files as $k2=>$check){
                if($k1!=$k2 && $file==$check){
                    $error='检测到安装目录或文件【'.$file.'】重复';
                    return false;
                }
                if($k1!=$k2 && str_starts_with($file, $check)){
                    $error='检测到安装目录或文件【'.$file.'】包含于【'.$check.'】中';
                    return false;
                }
            }
            $path=root_path().$file;
            if(is_file($path) || is_dir($path)){
                $error='检测到安装目录或文件【'.$file.'】已经存在';
                return false;
            }
        }
        return true;
    }

    private function checkCreateFiles(array $files,&$error)
    {
        usort($files,function ($x,$y){
            return strlen($x)-strlen($y);
        });
        foreach ($files as $k1=>$file)
        {
            foreach ($files as $k2=>$check){
                if($k1!=$k2 && $file==$check){
                    $error='检测到要创建目录或文件【'.$file.'】重复';
                    return false;
                }
                if($k1!=$k2 && str_starts_with($file, $check)){
                    $error='检测到要创建目录或文件【'.$file.'】包含于【'.$check.'】中';
                    return false;
                }
            }
            $path=root_path().$file;
            if(!is_file($path) && !is_dir($path)){
                $error='检测到要创建目录或文件【'.$file.'】不存在';
                return false;
            }
        }
        return true;
    }


    private function checkPackFiles(array $files,&$error)
    {
        usort($files,function ($x,$y){
            return strlen($x)-strlen($y);
        });
        foreach ($files as $k1=>$file)
        {
            foreach ($files as $k2=>$check){
                if($k1!=$k2 && $file==$check){
                    $error='检测到打包目录或文件【'.$file.'】重复';
                    return false;
                }
                if($k1!=$k2 && str_starts_with($file, $check)){
                    $error='检测到打包目录或文件【'.$file.'】包含于【'.$check.'】中';
                    return false;
                }
            }
            $path=root_path().$file;
            if(!is_file($path) && !is_dir($path)){
                $error='检测到打包目录或文件【'.$file.'】不存在';
                return false;
            }
        }
        return true;
    }

    private function copy_file(string $from,string $to,array $filters=[])
    {
        if(!is_file($from)){
            return;
        }
        //判断文件扩展名是否在过滤列表中
        $ext='*.'.strtolower(substr($from,strrpos($from,'.')+1));
        if(in_array($ext,$filters)){
            return;
        }
        //获取文件$to所在的目录
        $folder=substr($to,0,strrpos($to,DS));
        if(!is_dir($folder)){
            mkdir($folder, 0777, true);
        }
        copy($from,$to);
    }

    private function copy_dir(string $from, string $to,array $filters=[])
    {
        if(!is_dir($from)){
            return;
        }
        if(!is_dir($to)){
            mkdir($to,0777,true);
        }
        $handle= dir($from);
        while($entry = $handle->read()) {
            if(($entry != ".") && ($entry != "..")){
                if(in_array($entry,$filters)){
                    continue;
                }
                if(is_dir($from."/".$entry)){
                    $this->copy_dir($from."/".$entry,$to."/".$entry,$filters);
                }
                if(is_file($from."/".$entry)){
                    //判断文件扩展名是否在过滤列表中
                    $ext='*.'.strtolower(substr($entry,strrpos($entry,'.')+1));
                    if(in_array($ext,$filters)){
                        continue;
                    }
                    copy($from."/".$entry,$to."/".$entry);
                }
            }
        }
    }

    private function getContent(string $file,array $replace=[]):string
    {
        $filepath=__DIR__.DS.$file.'.txt';
        $myfile = fopen($filepath, "r");
        $content='';
        $if=[];
        $lastline='';
        while(!feof($myfile)) {
            $line_str = fgets($myfile);
            if($line_str){
                $ix=false;
                if($lastline==='' && trim($line_str)===''){
                    $ix=true;
                }
                //条件判断
                if(strpos($line_str,'<#if')!==false){
                    $continue=false;
                    $if_str=substr($line_str,strpos($line_str,'<#if')+4);
                    $if_str=substr($if_str,0,strpos($if_str,'#>'));
                    $keys=array_keys($replace);
                    $values=array_map(function ($res){
                        return '$replace[\''.$res.'\']';
                    },$keys);
                    $if_str=str_replace(array_keys($replace),$values,$if_str);
                    $phpstr="if(!({$if_str})){\$continue=true;}";
                    eval($phpstr);
                    $if[]=$continue;
                    $ix=true;
                }
                if(strpos($line_str,'<#endif#>')!==false){
                    array_pop($if);
                    $ix=true;
                }
                foreach ($if as $value) {
                    if ($value) {
                        $ix = true;
                        break;
                    }
                }
                if($ix){
                    continue;
                }
                //替换内容
                foreach ($replace as $key=>$value){
                    if(is_string($value)){
                        $line_str=str_replace('<#'.$key.'#>',$value,$line_str);
                    }
                }
                $content.=$line_str;
                $lastline=trim($line_str);
            }
        }
        fclose($myfile);
        return $content;
    }
}