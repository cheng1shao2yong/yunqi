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

namespace app\common\exception;

use think\exception\Handle;
use think\exception\HttpException;
use think\facade\Cookie;
use think\facade\View;
use think\Response;
use Throwable;

class Http extends Handle
{
    public function render($request, Throwable $e): Response
    {
        event('write_log',$e);
        if($e instanceof HttpException && $e->getStatusCode() == 404){
            if(!$request->isAjax()) {
                View::engine()->layout(false);
                $modulename=app('http')->getName();
                View::assign('modulename',$modulename);
                View::assign('modulealis',get_module_alis($modulename));
                if($modulename=='admin'){
                    View::assign('windowId',Cookie::get('window-id'));
                    View::assign('windowType',Cookie::get('window-type'));
                }else{
                    View::assign('windowId',0);
                    View::assign('windowType','');
                }
                $result=View::fetch('common@/404');
                $response = Response::create($result, 'html', 404);
                return $response;
            }else{
                $response = Response::create(['code'=>0,'msg'=>'找不到页面'], 'json', 404);
                return $response;
            }
        }
        return parent::render($request, $e);
    }
}