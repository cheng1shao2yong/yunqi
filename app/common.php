<?php
declare (strict_types = 1);

use app\common\model\Addons;
use think\facade\Cache;
use app\common\model\Config;
use app\common\service\LangService;

if (!function_exists('site_config')) {

    /**
     * 获取/设置系统配置
     * @param string $name 属性名
     * @param mixed  $vars 属性值
     * @return mixed
     */
    function site_config(string $name,mixed $vars='')
    {
        if(strpos($name,'.')!==false){
            $name=explode('.',$name);
            $group=$name[0];
            $name=$name[1];
        }else{
            $group=$name;
            $name='';
        }
        if(!$vars){
            $groupval=Cache::get('site_config_'.$group);
            if(!$groupval){
                $groupval=Config::where('group',$group)->column('value','name');
                foreach ($groupval as $key=>$val){
                    if(is_string($val)){
                        if (str_starts_with($val, '{') &&  str_ends_with($val, '}')) {
                            $groupval[$key]=json_decode($val,true);
                            continue;
                        }
                        if(str_starts_with($val, '[') &&  str_ends_with($val, ']')){
                            $groupval[$key]=json_decode($val,true);
                            continue;
                        }
                    }
                    $groupval[$key]=$val;
                }
                Cache::set('site_config_'.$group,$groupval);
            }
            if($name) {
                return $groupval[$name];
            }else{
                return $groupval;
            }
        }else{
            if($name) {
                if(is_array($vars)){
                    $vars=json_encode($vars,JSON_UNESCAPED_UNICODE);
                }
                Config::where(['group'=>$group,'name'=>$name])->update(['value'=>$vars]);
            }else{
                foreach ($vars as $key=>$val){
                    if(is_array($val)){
                        $val=json_encode($val,JSON_UNESCAPED_UNICODE);
                    }
                    Config::where(['group'=>$group,'name'=>$key])->update(['value'=>$val]);
                }
            }
            Cache::delete('site_config_'.$group);
        }
    }
}

if (!function_exists('__')) {

    /**
     * 获取语言变量值
     * @param string $name 语言变量名
     * @param array  $vars 动态变量值
     * @param string $lang 语言
     * @return mixed
     */
    function __(string $name,array $vars = [])
    {
        return LangService::newInstance()->get($name,$vars);
    }
}
if (!function_exists('str_rand')) {
    /**
     * 获取随机字符串
     * @return string
     */
    function str_rand(int $num,string $str=''):string
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

if (!function_exists('uuid')) {
    /**
     * 获取全球唯一标识
     * @return string
     */
    function uuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}

if (!function_exists('get_module_alis')) {
    /**
     * 获取模块别名
     * @return string
     */
    function get_module_alis(string $module='')
    {
        if(!$module){
            $module=app('http')->getName();
        }
        $arr=config('app.app_map');
        foreach ($arr as $key=>$vars){
            if($vars==$module){
                return $key;
            }
        }
        return $module;
    }
}

if (!function_exists('build_url')) {
    /**
     * 生成url地址
     * @return string
     */
    function build_url(string $url,string $module=''):string
    {
        $arr=parse_url($url);
        $modulename=get_module_alis($module);
        $url_html_suffix='.'.config('route.url_html_suffix');
        if(strpos($arr['path'],$url_html_suffix)===false){
            $arr['path'].=$url_html_suffix;
        }
        $r='';
        if(isset($arr['scheme'])){
            $r.=$arr['scheme'].'://';
        }
        if(isset($arr['host'])){
            $r.=$arr['host'];
        }
        if(isset($arr['path'])){
            if(!str_starts_with($arr['path'],'/')) {
                $r .= '/'.$modulename.'/';
            }
            $r.=$arr['path'];
        }
        if(isset($arr['query'])){
            $r.='?'.$arr['query'];
        }
        return $r;
    }
}

if (!function_exists('rmdirs')) {

    /**
     * 删除文件夹
     * @param string $dirname  目录
     * @param bool   $withself 是否删除自身
     * @return boolean
     */
    function rmdirs(string $dirname, bool $withself = true)
    {
        if (!is_dir($dirname)) {
            return false;
        }
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dirname, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $fileinfo) {
            $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            $todo($fileinfo->getRealPath());
        }
        if ($withself) {
            @rmdir($dirname);
        }
        return true;
    }
}

if (!function_exists('create_file')) {
    /**
     * 创建文件并写入内容，如果所在文件夹不存在，则创建
     */
    function create_file(string $filepath, string $content = ''){
        $dir = dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($filepath, $content);
    }
}

if (!function_exists('get_addons')) {
    /**
     * 获取插件信息
     * @param string $pack 插件标识
     * @return array|bool
     */
    function get_addons(string $pack='')
    {
        $addons=Cache::get('download-addons');
        if(!$addons){
            $addons=Addons::field('id,key,type,name,install,open')->select();
            Cache::set('download-addons',$addons);
        }
        if(!$pack){
            return $addons;
        }
        foreach ($addons as $addon){
            if($addon['pack']==$pack){
                return $addon;
            }
        }
        return false;
    }
}

if (!function_exists('addons_installed')) {
    /**
     * 判断是否安装插件
     * @param string $pack 插件标识
     * @return array|bool
     */
    function addons_installed(string $pack)
    {
        $addons=Cache::get('download-addons');
        if(!$addons){
            $addons=Addons::field('id,key,pack,type,name,install,open')->select();
            Cache::set('download-addons',$addons);
        }
        foreach ($addons as $addon){
            if($addon['pack']==$pack && $addon['install']==1){
                return true;
            }
        }
        return false;
    }
}
