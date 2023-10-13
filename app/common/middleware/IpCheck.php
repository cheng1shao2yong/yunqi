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

use think\exception\HttpResponseException;
use think\Response;

class IpCheck
{
    public function handle($request, \Closure $next)
    {
        $ip = $request->ip();
        $forbiddenip = site_config('basic.forbiddenip');
        if($forbiddenip){
            $forbiddenipArr=array_filter(explode("\n", str_replace("\r\n", "\n", $forbiddenip)));;
            if (count($forbiddenipArr)>0 && \Symfony\Component\HttpFoundation\IpUtils::checkIp($ip, $forbiddenipArr)) {
                $response = Response::create('请求无权访问', 'html', 403);
                throw new HttpResponseException($response);
            }
        }
        return $next($request);
    }
}