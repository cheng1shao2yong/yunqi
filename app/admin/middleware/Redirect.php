<?php
/**
 * ----------------------------------------------------------------------------
 * 行到水穷处，坐看云起时
 * 开发软件，找贵阳云起信息科技，官网地址:https://www.56q7.com/
 * ----------------------------------------------------------------------------
 * Author: 老成
 * email：85556713@qq.com
 */
declare(strict_types = 1);

namespace app\admin\middleware;

class Redirect{
    public function handle($request, \Closure $next)
    {
        $modulealis=get_module_alis();
        // 非选项卡时重定向
        if (!$request->isPost() && !$request->isAjax() && !$request->isJson() && input("ref") == 'addtabs') {
            $url = preg_replace_callback("/([\?|&]+)ref=addtabs(&?)/i", function ($matches) {
                return $matches[2] == '&' ? $matches[1] : '';
            }, $request->url());
            redirect('/'.$modulealis.'/index')->with('referer',build_url($url))->send();
        }
        return $next($request);
    }
}