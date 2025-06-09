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

namespace app\admin\command;

use app\common\model\Queue as QueueModel;
use think\console\Command;
use think\console\Input;
use think\console\Output;

class Queue extends Command
{
    protected $output;

    private static $EventTime=[];

    public static $timetxt=__DIR__.DIRECTORY_SEPARATOR.'queueEvent'.DIRECTORY_SEPARATOR.'time.txt';
    public static $locktxt=__DIR__.DIRECTORY_SEPARATOR.'queueEvent'.DIRECTORY_SEPARATOR.'lock.txt';

    private $breath=0;

    //定义更新时间
    const  refreshTime=300;

    protected function configure()
    {
        $this->setName('Event')->setDescription('队列任务');
    }

    protected function execute(Input $input, Output $output)
    {
        $this->output=$output;
        $this->getQueueList();
        $this->output('启动队列服务');
        while(true){
            sleep(1);
            $r=intval(file_get_contents(self::$timetxt));
            if($r==0){
                $this->output('关闭轮询任务服务');
                (new QueueModel())->saveAll(self::$EventTime);
                break;
            }
            if(file_exists(self::$locktxt)){
                $r=intval(file_get_contents(self::$locktxt));
                $this->output('更新了轮询任务');
                unlink(self::$locktxt);
            }
            foreach (self::$EventTime as &$value){
                $function=$value['function'];
                $delay=$value['delay'];
                $filter=$value['filter'];
                if($value['limit']!==0 && $value['times']>=$value['limit']){
                    continue;
                }
                if($value['status']!='normal'){
                    continue;
                }
                $lasttime='';
                if($value['lasttime']){
                    $lasttime=strtotime($value['lasttime']);
                }
                try {
                    if($this->runEvent($function,$delay,$filter,$lasttime)){
                        $value['times']++;
                        $value['error']='';
                        $value['lasttime']=date('Y-m-d H:i:s');
                    }
                }catch (\Exception $e) {
                    $this->output('执行出错:'.$e->getMessage());
                    $value['times']++;
                    $value['lasttime']=date('Y-m-d H:i:s');
                    $value['error']=$e->getMessage();
                    $value['status']='hidden';
                }
                if($value['filter']){
                    $value['filter']=json_encode($value['filter']);
                }
            }
            //每5分钟更新一次数据库
            if($r%self::refreshTime===0){
                (new QueueModel())->saveAll(self::$EventTime);
                $this->getQueueList();
            }
            $this->breath++;
            file_put_contents(self::$timetxt,$this->breath);
        }
    }

    private function getQueueList()
    {
        $list=QueueModel::alias('queue')->whereRaw("queue.limit=0 or queue.limit>queue.times")->select()->toArray();
        self::$EventTime=$list;
    }

    private function runEvent($event,$time,$filter,$lasttime):bool
    {
        $now=time();
        if($filter){
            foreach ($filter as $key=>$fx){
                if(date($key,$now)!=$fx){
                    return false;
                }
            }
        }
        if($lasttime && $lasttime+$time>$now){
            return false;
        }
        $class="\\app\\admin\\command\\queueEvent\\".$event;
        if(!class_exists($class)){
            throw new \Exception('处理类'.$event.'不存在');
        }else{
            $class::handle($this->output);
            return true;
        }
    }

    private function output($msg)
    {
        $this->output->info(date('Y-m-d H:i:s').'-'.$msg);
    }
}
