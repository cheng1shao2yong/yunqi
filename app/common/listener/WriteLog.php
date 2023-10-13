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

namespace app\common\listener;

use app\admin\service\AdminAuthService;
use app\common\model\AdminLog;
use think\facade\Log;
use think\exception\HttpException;

class WriteLog
{
    const BEGIN=1;
    const ADMIN=2;
    const END=3;

    public static $starttime;


    //不记录日志的控制器
    private $noWriteLog=[
        [
            'controller'=>'app\\admin\\controller\\Ajax',
            'action'=>'*'
        ],
        [
            'controller'=>'app\\admin\\controller\\Index',
            'action'=>['captcha']
        ]
    ];

    public function handle($event)
    {
        $request=request();
        $modulename=app('http')->getName();
        $controllername = $request->controller();
        $actionname = $request->action();
        if(!$this->checkLog($modulename,$controllername,$actionname)){
            return;
        }
        if(is_numeric($event)){
            switch ($event){
                case self::BEGIN:
                    self::$starttime=microtime(true);
                    Log::record("Url：{$request->url()} Method:{$request->method()}");
                    Log::record("----------{$modulename}----------{$controllername}----------{$actionname}----------");
                    break;
                case self::END:
                    $usetime=round(microtime(true)-self::$starttime,5);
                    Log::record("请求完成，耗时：".$usetime."秒\n");
                    Log::save();
                    break;
                case self::ADMIN:
                    $this->writeAdminLog();
                    break;
            }
        }
        if(is_string($event)){
            Log::record($event);
        }
        if($event instanceof \Exception){
            log::save();
        }
    }

    public function writeAdminLog()
    {
        if(!request()->isPost()){
            return;
        }
        $auth = AdminAuthService::newInstance();
        if(!$auth->isLogin()){
            return;
        }
        $controllername=$auth->getRoute('controllername');
        $actionname=$auth->getRoute('actionname');
        $content = $this->parseContent(request()->post());
        if(empty($content)){
            $content='';
        }else{
            $content=json_encode($content,JSON_UNESCAPED_UNICODE);
        }
        $url=$auth->getPath($controllername,$actionname);
        $insert=[
            'admin_id'=>$auth->id,
            'username'=>$auth->username,
            'controller'=>$controllername,
            'action'=>$actionname,
            'url'=>$url,
            'title'=>$auth->getRoute('title'),
            'content'=>$content,
            'useragent' => substr(request()->server('HTTP_USER_AGENT'), 0, 255),
            'ip'=>request()->ip()
        ];
        (new AdminLog())->save($insert);
    }

    private function checkLog($modulename,$controllername,$actionname)
    {
        $controllername = 'app\\'.$modulename.'\\controller\\'.str_replace('.','\\',$controllername);
        foreach ($this->noWriteLog as $item){
            if($item['controller']==$controllername){
                if(is_string($item['action'])){
                    $item['action']=explode(',',$item['action']);
                }
                if(in_array('*',$item['action']) || in_array($actionname,$item['action'])){
                    return false;
                }
            }
        }
        return true;
    }

    //递归将数组arr中key为password和token的值置空
    private function parseContent(array $arr)
    {
        foreach ($arr as $key=>$val){
            if(is_array($val)){
                $arr[$key]=$this->parseContent($val);
            }else{
                if($key=='password' || $key=='token'){
                    $arr[$key]='******';
                }
            }
        }
        return $arr;
    }
}