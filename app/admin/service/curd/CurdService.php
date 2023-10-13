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

namespace app\admin\service\curd;

use app\common\service\BaseService;
use app\common\model\AuthRule;
use think\facade\Cache;
use think\facade\Db;

include __DIR__.DS.'eof.php';

class CurdService extends BaseService
{
    public static $prefix;
    private $table;
    private $controller;
    private $model;
    private $menu;
    private $reduced;
    private $actions;
    private $actionList;
    private $fields;
    private $summary;
    private $expand;
    private $isTree;
    private $treeTitle;
    private $pagination;
    private $tabs;
    private $recyclebinField=[];
    private $relations;
    private $type;

    public function build()
    {
        $error='';
        Db::startTrans();
        try{
            if($this->actions['menu']){
                $this->createMenu();
            }
            $model=$this->createModel();
            $controller=$this->createController();
            $view=$this->createView();
            $js=$this->createJs();
            Db::commit();
        }catch (\Exception $e){
            $error=$e->getMessage();
            $this->rollback();
        }
        if($error){
            throw new \Exception($error);
        }
        $r=compact('model','controller','view','js');
        return $r;
    }
    public function volidate()
    {
        if($this->type=='file'){
            $filelist=$this->buildFile();
            foreach ($filelist as $key=>$file){
                if($key=='view'){
                    foreach ($file as $f){
                        if(file_exists($f)){
                            throw new \Exception(__('%s文件已存在',['s'=>'view']));
                        }
                    }
                }else if(file_exists($file)){
                    throw new \Exception(__('%s文件已存在',['s'=>$key]));
                }
            }
        }
        if($this->isTree && !$this->treeTitle){
            throw new \Exception(__('树形结构标题未定义'));
        }
        if(!key_exists('index',$this->actionList)){
            throw new \Exception(__('%s方法未定义',['s'=>'index']));
        }
    }

    public function clear()
    {
        $filelist=$this->buildFile();
        foreach ($filelist as $key=>$file){
            if($key=='view'){
                foreach ($file as $f){
                    if(file_exists($f)){
                        $time=filectime($f);
                        if(time()-$time>3600){
                            throw new \Exception(__('%s已创建超过一个小时，禁止删除',['s'=>'view']));
                        }
                        unlink($f);
                    }
                }
            }else if(file_exists($file)){
                $time=filectime($file);
                if(time()-$time>3600){
                    throw new \Exception(__('%s已创建超过一个小时，禁止删除',['s'=>$key]));
                }
                unlink($file);
            }
        }
    }

    protected function init()
    {
        $config = Db::getConfig();
        $default=$config['default'];
        self::$prefix=$config['connections'][$default]['prefix'];
        $recyclebinField=[];
        $relations=[];
        foreach ($this->fields as $key=>$value){
            $title=trim($value['title']);
            $this->fields[$key]['title']=$title?:$value['field'];
            if($this->actions['table'] && $value['visible']==='relation'){
                if(!$value['relation']){
                    throw new \Exception(__('%s字段关联关系未定义',['s'=>$value['title']]));
                }
                $relation=json_decode($value['relation'],true);
                if($value['field']==$relation['table']){
                    throw new \Exception(__('字段名与关联表名重名，禁止关联，建议修改字段名为%s',['s'=>$relation['table'].'_id']));
                }
                $relations[$value['field']]=$relation;
            }
            if(!empty($value['recyclebin'])){
                $type=$value['formatter'];
                if(!in_array($type,['text','image','images','date','datetime','tag','tags'])){
                    $type='text';
                }
                $recyclebinField[]=[
                    'field'=>$value['field'],
                    'type'=>$type,
                    'title'=>$value['title']
                ];
            }
        }
        if(key_exists('recyclebin',$this->actionList) && empty($recyclebinField)){
            throw new \Exception(__('回收站的显示字段未定义'));
        }
        $this->relations=$relations;
        $this->recyclebinField=$recyclebinField;
    }

    public function getIndexUrl()
    {
        $pack=str_replace('\\','/',substr($this->controller,strpos($this->controller,'controller\\')+11));
        $pack=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $pack));
        return request()->domain().build_url($pack.'/index','admin');
    }

    private function createMenu()
    {
        $title=trim($this->menu['title']);
        if(!$title){
            throw new \Exception(__('菜单标题未定义'));
        }
        $menu=AuthRule::where(['controller'=>$this->controller])->count();
        if($menu){
            throw new \Exception(__('菜单已存在'));
        }
        $rule=new AuthRule();
        $rule->save([
            'controller'=>$this->controller,
            'action'=>$this->menu['action'],
            'pid'=>$this->menu['pid'],
            'title'=>$title,
            'menutype'=>$this->menu['menutype'],
            'status'=>'normal',
            'extend'=>'',
            'icon'=>$this->menu['icon'],
            'ismenu'=>1
        ]);
        $pid=$rule->id;
        $action=array_keys($this->actionList);
        $xtitle=array_values($this->actionList);
        $rule->insert([
            'controller'=>$this->controller,
            'action'=>json_encode($action,JSON_UNESCAPED_UNICODE),
            'pid'=>$pid,
            'title'=>json_encode($xtitle,JSON_UNESCAPED_UNICODE),
            'ismenu'=>0
        ]);
        Cache::delete('admin_rule_list');
    }

    private function rollback()
    {
        Db::rollback();
        if($this->type=='file'){
            $filelist=$this->buildFile();
            foreach ($filelist as $key=>$file){
                if($key=='view'){
                    foreach ($file as $f){
                        if(file_exists($f)){
                            unlink($f);
                        }
                    }
                }else if(file_exists($file)){
                    unlink($file);
                }
            }
        }
    }

    private function buildFile(mixed $key=false)
    {
        $rootPath = root_path();
        $controller=$rootPath.str_replace('\\',DS,$this->controller).'.php';
        $model=$rootPath.str_replace('\\',DS,$this->model).'.php';
        $temp=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $this->controller));
        $view=[
            'index'=>$rootPath.str_replace(['\\','controller'],[DS,'view'],$temp).DS.'index.html',
        ];
        if(key_exists('add',$this->actionList)){
            $view['add']=$rootPath.str_replace(['\\','controller'],[DS,'view'],$temp).DS.'add.html';
        }
        if(key_exists('edit',$this->actionList)){
            $view['edit']=$rootPath.str_replace(['\\','controller'],[DS,'view'],$temp).DS.'edit.html';
        }
        $js=$rootPath.'public'.DS.'assets'.DS.'js'.DS.str_replace(['app\\','controller\\','\\'],['','',DS],$temp).'.js';
        $arr=compact('controller','model','view','js');
        if($key){
            return $arr[$key];
        }
        return $arr;
    }

    private function createView()
    {
        $keys=array_keys($this->actionList);
        $reduced=$this->reduced;
        $table=$this->actions['table'];
        $form=$this->actions['form'];
        $isTree=$this->isTree;
        $treeTitle=$this->treeTitle;
        $viewContent=[];
        foreach ($keys as $key){
            if(in_array($key,['del','multi','import','download','recyclebin'])){
               continue;
            }
            $action=$key;
            $title=$this->actionList[$key];
            $search=[];
            $commonSearch=false;
            $pagination=$this->pagination;
            $tabs=$this->tabs;
            $toolbar=['refresh'];
            if($key=='index'){
                foreach ($this->actionList as $xkey=>$value){
                    if(in_array($xkey,['add','edit','del'])){
                        $toolbar[]=$xkey;
                    }
                }
                $slot='';
                $weigh=0;
                foreach ($this->fields as $value){
                    if(!empty($value['search'])){
                        $search[]=$value['field'];
                    }
                    if(trim($value['operate'])){
                        $commonSearch=true;
                    }
                    if($value['field']=='weigh' && $value['type']=='int'){
                        $weigh=1;
                    }
                    if($value['field']=='status' && $value['type']=='varchar'){
                        $toolbar[]='more';
                    }
                    $slot.=getTableslot($value);
                }
                $slot=rtrim($slot);
                foreach ($this->actionList as $fkey=>$value){
                    if(in_array($fkey,['import','download','recyclebin'])){
                        $toolbar[]=$fkey;
                    }
                }
                $search=empty($search)?'':implode(',',$search);
                $toolbarStr=implode(',',$toolbar);
                $controller=str_replace('\\','\\\\',$this->controller);
                $summary=$this->summary;
                $expand=$this->expand;
                $replace=compact('title','reduced','table','form','slot','expand','weigh','search','summary','controller','toolbar','toolbarStr','commonSearch','pagination','tabs','isTree');
                $content=$this->getContent('view-index',$replace);
            }else if($key=='add' || $key=='edit'){
                $temp='';
                if($key=='edit'){
                    $temp=str_replace('\\','/',substr($this->controller,strpos($this->controller,'controller\\')+11));
                    $temp=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $temp)).'/add';
                }
                $slot='';
                foreach ($this->fields as $value){
                    $slot.=getFormslot($value,$isTree,$treeTitle);
                }
                $slot=rtrim($slot);
                $replace=compact('action','title','reduced','table','slot','form','temp');
                $content=$this->getContent('view-add-edit',$replace);
            }else{
                $replace=compact('title');
                $content=$this->getContent('view-method',$replace);
            }
            if($this->type=='file'){
                $file=$this->buildFile('view')[$key];
                create_file($file,$content);
            }
            $viewContent[$key]=$content;
        }
        return $viewContent;
    }

    private function createJs()
    {
        $reduced=$this->reduced;
        $table=$this->actions['table'];
        $form=$this->actions['form'];
        $expand=$this->expand;
        $actions=array_keys($this->actionList);
        $pack=str_replace('\\','/',substr($this->controller,strpos($this->controller,'controller\\')+11));
        $pack=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $pack));
        $dian='';
        for($i=0;$i<count(explode('/',$pack));$i++){
            $dian.='../';
        }
        $sort='';
        $fields='';
        $isTree=$this->isTree;
        $treeTitle=$this->treeTitle;
        foreach ($this->fields as $value){
            $fields.=getFields($value,$table,$form,$isTree,$treeTitle);
            if($value['field']=='weigh' && $value['type']=='int'){
                $sort=true;
            }
        }
        $fields=rtrim($fields);
        $isTree=$this->isTree;
        $replace=compact('dian','pack','reduced','table','form','actions','expand','sort','isTree','fields');
        $content=$this->getContent('js',$replace);
        if($this->type=='file'){
            $file=$this->buildFile('js');
            create_file($file,$content);
        }
        return $content;
    }

    private function createController()
    {
        $reduced=$this->reduced;
        $controllerName=substr($this->controller,strrpos($this->controller,'\\')+1);
        $namespace=substr($this->controller,0,strrpos($this->controller,'\\'));
        $model=$this->model;
        $modelName=substr($this->model,strrpos($this->model,'\\')+1);
        $recyclebinField=rtrim(getRecyclebinField($this->recyclebinField));
        $recyclebinType=rtrim(getRecyclebinType($this->recyclebinField));
        $table=$this->actions['table'];
        $form=$this->actions['form'];
        $group=str_replace('\\','/',substr($this->controller,strpos($this->controller,'controller\\')+11));
        $group=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $group));
        $methods='';
        foreach ($this->actionList as $key=>$value){
            if($table && in_array($key,['index','del','multi','import','download','recyclebin'])){
                continue;
            }
            if($form && in_array($key,['add','edit'])){
                continue;
            }
            $methods.=getAction($key,$value);
        }
        $methods=rtrim($methods);
        $relation=$this->getRelation();
        $actionList=$this->actionList;
        $isTree=$this->isTree;
        $summary=$this->summary;
        $treeTitle=$this->treeTitle;
        $replace=compact(
            'namespace','controllerName','model','modelName',
            'group','table','summary','form', 'relation',
            'methods','actionList','isTree','treeTitle',
            'recyclebinField','recyclebinType'
        );
        if($reduced){
            $content=$this->getContent('controller-reduced',$replace);
        }else{
            $content=$this->getContent('controller-normal',$replace);
        }
        if($this->type=='file'){
            $file=$this->buildFile('controller');
            create_file($file,$content);
        }
        return $content;
    }

    private function getRelation()
    {
        if(!$this->actions['table']){
            return '';
        }
        $relation=[];
        foreach ($this->relations as $value){
            $relation[]=str_replace(self::$prefix,'',$value['table']);
        }
        $relation=count($relation)>0?json_encode($relation):'';
        return $relation;
    }

    private function createModel()
    {
        //用户自定义模型名
        $modelName=substr($this->model,strrpos($this->model,'\\')+1);
        //根据表名生成模型名
        $table=str_replace(self::$prefix,'',$this->table);
        $tableModelName=str_replace(' ','',ucwords(str_replace('_',' ',$table)));
        $name='';
        if($tableModelName!=$modelName) {
            $name = $table;
        }
        $createtime=false;
        $updatetime=false;
        $deletetime=false;
        $weigh=false;
        foreach ($this->fields as $value){
            if($value['field']=='createtime'){
                $createtime=true;
            }
            if($value['field']=='updatetime'){
                $updatetime=true;
            }
            if($value['field']=='deletetime'){
                $deletetime=true;
            }
            if($value['field']=='weigh'){
                $weigh=true;
            }
        }
        $methods='';
        foreach($this->relations as $field=>$value){
            $methods.=getRelation($field,$value);
        }
        $methods=rtrim($methods);
        if($createtime && $updatetime && $deletetime) {
            $content=$this->getContent('model-extend-base',compact('modelName','name','weigh','methods'));
        }else{
            $content=$this->getContent('model-normal',compact('modelName','name','createtime','updatetime','deletetime','weigh','methods'));
        }
        if($this->type=='file'){
            $file=$this->buildFile('model');
            create_file($file,$content);
        }
        return $content;
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