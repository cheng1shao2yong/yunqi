<?php
/**
 * ----------------------------------------------------------------------------
 * 行到水穷处，坐看云起时
 * 开发软件，找贵阳云起信息科技，官网地址:https://www.56q7.com/
 * ----------------------------------------------------------------------------
 * Author: 老成
 * email：85556713@qq.com
 */
declare (strict_types = 1);

namespace app\admin\controller;

use app\admin\service\curd\CurdService;
use app\common\controller\Backend;
use app\common\model\AuthRule;
use app\common\model\Queue;
use app\admin\command\Queue as QueueCommand;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Db;

#[Group("develop")]
class Develop extends Backend
{
    protected $noNeedRight = ['*'];

    protected function _initialize()
    {
        parent::_initialize();
        if(!$this->auth->isSuperAdmin()){
            $this->error(__('超级管理员才能访问'));
        }
    }

    //一键crud
    #[Route("GET,JSON","crud")]
    public function crud()
    {
       if($this->request->isJson()){
            if(!config('app.app_debug')) {
                $this->error(__('只允许在开启调试模式下执行'));
            }
            $data=$this->request->post();
            try{
                $service=CurdService::newInstance($data);
                $service->volidate();
                $content=$service->build();
                if($data['type']=='file'){
                    $url=$service->getIndexUrl();
                    $this->success(__('创建成功'),$url);
                }
                if($data['type']=='code'){
                    $this->success('',$content);
                }
            }catch (\Exception $e){
                $this->error($e->getMessage());
            }
       }else{
           $tree=AuthRule::getMenuListTree('*');
           $ruledata=[0 => __('无')];
           foreach ($tree as $value){
               $ruledata[$value['id']]=$value['title'];
           }
           $config = Db::getConfig();
           $default=$config['default'];
           $prefix=$config['connections'][$default]['prefix'];
           $this->assign('ruledata',$ruledata);
           $this->assign('app',['admin']);
           $this->assign('tablePrefix',$prefix);
           $this->assignJsFile('develop/crud.js');
           return $this->fetch();
       }
    }

    //清除创建
    #[Route("JSON","clear")]
    public function clear()
    {
        if(!config('app.app_debug')) {
            $this->error(__('只允许在开启调试模式下执行'));
        }
        $data=$this->request->post();
        try{
            CurdService::newInstance($data)->clear();
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success(__('清除成功'));
    }

    //构造表格
    #[Route("GET,POST","queue")]
    public function queue()
    {
        if($this->request->isAjax()){
            $list=Queue::alias('queue')->whereRaw("queue.limit=0 or queue.limit>queue.times")->select();
            $this->success('',$list);
        }
        $this->assignJsFile('develop/queue.js');
        return $this->fetch();
    }

    #[Route("GET","queueLog")]
    public function queueLog()
    {
        $type=$this->request->get('type');
        //每次读取1kb
        $readSize=1024*2;
        $log=root_path().'queue.log';
        if($type=='total'){
            if (!file_exists($log)) {
                $this->success('',1);
            }
            //获取文件大小
            $size=filesize($log);
            //获取总页数
            $total=ceil($size/$readSize);
            $this->success('',$total);
        }
        if($type=='content'){
            $page=$this->request->get('page/d');
            if (!file_exists($log)) {
                $this->success('');
            }
            $fp=fopen($log,'r');
            //定位到读取的页数的行首
            $start=($page-1)*$readSize;
            fseek($fp,$start);
            while ($start>0){
                $char=fgetc($fp);
                if($char=="\n"){
                    break;
                }
                $start--;
                $readSize++;
                fseek($fp,$start);
            }
            $content='';
            while(!feof($fp)) {
                $content.=fgets($fp);
                if(strlen($content)>$readSize){
                    break;
                }
            }
            fclose($fp);
            $this->success('',$content);
        }
    }

    #[Route("POST","delQueue")]
    public function delQueue()
    {
        $this->queueReload(function(){
            $id=$this->request->post('id');
            Queue::find($id)->delete();
        });
        $list=Queue::alias('queue')->whereRaw("queue.limit=0 or queue.limit>queue.times")->select();
        $this->success(__('删除成功'),$list);
    }

    private function queueReload($callback)
    {
        try{
            $callback();
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $refreshTime=QueueCommand::refreshTime;
        $time=QueueCommand::$timetxt;
        $locktime=intval(file_get_contents($time));
        $locktime=$locktime+($refreshTime-$locktime%$refreshTime);
        file_put_contents(QueueCommand::$locktxt,$locktime);
    }

    #[Route("GET,POST","addQueue")]
    public function addQueue()
    {
        if($this->request->isPost()){
            $data=$this->request->post('row/a');
            if(!class_exists("\\app\\admin\\command\\queueEvent\\".$data['function'])){
                $this->error(__('处理类不存在'));
            }
            $filter=[];
            if($data['filter']){
                foreach ($data['filter'] as $key=>$value){
                    $value=trim($value);
                    if($value==''){
                        continue;
                    }
                    $year=intval(date('Y'));
                    if($key=='年'){
                        $value=intval($value);
                        if($value<$year){
                            $this->error(__('年份不能小于当前年份'));
                        }
                        $value=(string)$value;
                    }
                    if($key=='月'){
                        $value=intval($value);
                        if($value<1 || $value>12){
                            $this->error(__('月份必须在1-12之间'));
                        }
                        if($value<10){
                            $value='0'.$value;
                        }
                        $value=(string)$value;
                    }
                    if($key=='日'){
                        $value=intval($value);
                        if($value<1 || $value>31){
                            $this->error(__('日必须在1-31之间'));
                        }
                        if($value<10){
                            $value='0'.$value;
                        }
                        $value=(string)$value;
                    }
                    if($key=='时'){
                        $value=intval($value);
                        if($value<0 || $value>23){
                            $this->error(__('时必须在0-23之间'));
                        }
                        if($value<10){
                            $value='0'.$value;
                        }
                        $value=(string)$value;
                    }
                    if($key=='分'){
                        $value=intval($value);
                        if($value<0 || $value>59){
                            $this->error(__('分必须在0-59之间'));
                        }
                        if($value<10){
                            $value='0'.$value;
                        }
                        $value=(string)$value;
                    }
                    if($key=='秒'){
                        $value=intval($value);
                        if($value<0 || $value>59){
                            $this->error(__('秒必须在0-59之间'));
                        }
                        if($value<10){
                            $value='0'.$value;
                        }
                        $value=(string)$value;
                    }
                    switch ($key){
                        case '年':
                            $filter['Y']=$value;
                            break;
                        case '月':
                            $filter['m']=$value;
                            break;
                        case '日':
                            $filter['d']=$value;
                            break;
                        case '时':
                            $filter['H']=$value;
                            break;
                        case '分':
                            $filter['i']=$value;
                            break;
                        case '秒':
                            $filter['s']=$value;
                            break;
                    }
                }
                $data['filter']=json_encode($filter,JSON_UNESCAPED_UNICODE);
            }
            $this->queueReload(function () use ($data){
                (new Queue())->save($data);
            });
            $this->success(__('添加成功'));
        }
        $this->assignJsFile('develop/queue.js');
        return $this->fetch();
    }

    #[Route("GET,POST","queueStatus")]
    public function queueStatus()
    {
        $timetxt=QueueCommand::$timetxt;
        if($this->request->isPost()){
            $status=$this->request->post('status');
            $timetxt1=intval(file_get_contents($timetxt));
            sleep(2);
            $timetxt2=intval(file_get_contents($timetxt));
            if($status){
                if($timetxt1!=$timetxt2) {
                    $this->error(__('队列正在执行中'));
                }
                $str=php_ini_loaded_file();
                $str=substr($str,0,strrpos($str,'/'));
                $phppath='';
                $callback='';
                if (substr(php_uname(), 0, 7) == "Windows"){
                    if(!function_exists('popen') || !function_exists('pclose')){
                        $this->error(__('popen或pclose函数被禁用了'));
                    }
                    $phppath=substr($str,0,strrpos($str,'/')).DS.'bin'.DS.'php.exe';
                    $callback=function ($cmd){
                        pclose(popen($cmd,'r'));
                    };
                }
                if (substr(php_uname(), 0, 5) == "Linux"){
                    if(!function_exists('exec')){
                        $this->error(__('exec函数被禁用了'));
                    }
                    $phppath=substr($str,0,strrpos($str,'/')).DS.'bin'.DS.'php';
                    $callback=function ($cmd){
                         $logpath=root_path()."queue.log";
                         if(file_exists($logpath)){
                             unlink($logpath);
                         }
                         exec("{$cmd} > {$logpath} &");
                    };
                }
                if($phppath==''){
                    $this->error(__('当前操作仅支持windows或linux系统'));
                }
                $command=root_path().'think Queue';
                $cmd=$phppath." ".$command;
                file_put_contents($timetxt,1);
                $callback($cmd);
                $this->success();
            }else{
                if($timetxt1==$timetxt2) {
                    $this->error(__('队列服务已经停止了'));
                }
                file_put_contents($timetxt,0);
                $this->success();
            }
        }
        $timetxt1=intval(file_get_contents($timetxt));
        sleep(2);
        $timetxt2=intval(file_get_contents($timetxt));
        $status='normal';
        $keeptime=$timetxt2;
        $stoptime='';
        if($timetxt1==$timetxt2) {
            $status='hidden';
            $stoptime=date('Y-m-d H:i:s',filemtime($timetxt));
        }
        $this->success('',compact('status','keeptime','stoptime'));
    }

    //获取表格
    #[Route("JSON","getTable")]
    public function getTable()
    {
        $limit=$this->request->post('limit/d',7);
        $page=$this->request->post('page/d',7);
        $labelValue=$this->request->post('labelValue');
        $where="";
        if($labelValue) {
            $where="and `TABLE_NAME` like '%{$labelValue}%'";
        }
        $offect=($page-1)*$limit;
        $config = Db::getConfig();
        $default=$config['default'];
        $dbname=$config['connections'][$default]['database'];
        $count=Db::query("SELECT COUNT(*) AS `count` FROM `information_schema`.`TABLES` where `TABLE_SCHEMA` = '{$dbname}' {$where};");
        $tableList = Db::query("SELECT `TABLE_NAME` AS `name`,`TABLE_COMMENT` AS `title` FROM `information_schema`.`TABLES` where `TABLE_SCHEMA` = '{$dbname}' {$where} limit {$offect},{$limit};");
        foreach ($tableList as $key=>$value){
            $tableList[$key]['title']=$tableList[$key]['name'].($tableList[$key]['title']?' - '.$tableList[$key]['title']:'');
        }
        return json(['total'=>$count[0]['count'],'rows'=>$tableList]);
    }

    //获取字段
    #[Route("GET","getFields")]
    public function getFields()
    {
        $table = $this->request->get('table');
        $config = Db::getConfig();
        $default=$config['default'];
        $dbname=$config['connections'][$default]['database'];
        //从数据库中获取表字段信息
        $sql = "SELECT `COLUMN_NAME` AS `name`,`COLUMN_COMMENT` AS `title`,`DATA_TYPE` AS `type` FROM `information_schema`.`columns` WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION";
        //加载主表的列
        $fieldList = Db::query($sql, [$dbname, $table]);
        $this->success("",$fieldList);
    }
}
