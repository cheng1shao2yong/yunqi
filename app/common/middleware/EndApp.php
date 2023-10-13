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

namespace app\common\middleware;

use app\common\listener\WriteLog;

class EndApp
{
    public function handle($request, \Closure $next)
    {
        $response = $next($request);
        event('write_log',WriteLog::END);
        return $response;
    }
}