<?php
declare(strict_types=1);
namespace app\common\service;

/**
 * 多语言
 */
class LangService extends BaseService{
    /**
     * 当前语言包文件
     * @var string
     */
    private $lang;

    protected function init()
    {

    }

    public function get(string $name = null, array $vars = [])
    {
        if(!isset($this->lang[$name])) {
            $keys=array_keys($vars);
            foreach ($keys as &$k){
                $k='%'.$k;
            }
            return str_replace($keys,array_values($vars),$name);
        }
        $r=$this->lang[$name];
        $keys=array_keys($vars);
        foreach ($keys as &$k){
            $k='%'.$k;
        }
        return str_replace($keys,array_values($vars),$r);
    }

    public function load(string $language)
    {
        if($this->lang){
            return;
        }
        $modulename=app('http')->getName();
        $controllername = 'app\\'.$modulename.'\\controller\\'.str_replace('.','\\',request()->controller());
        $langFile = app()->getBasePath().$modulename.DS.'lang'.DS.$language.'.php';
        if(!is_file($langFile)){
            throw new \Exception('语言包文件不存在:'.$langFile);
        }
        $lang=include $langFile;
        $arr=isset($lang['default'])?$lang['default']:[];
        foreach ($lang['controller'] as $key=>$val){
            if($controllername==$key){
                $arr=array_merge($arr,$val);
            }
        }
        $this->lang=$arr;
    }

    public function all()
    {
        return $this->lang;
    }
}