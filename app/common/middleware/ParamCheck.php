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

class ParamCheck
{
    public function handle($request, \Closure $next)
    {
        //移除HTML标签
        if($request->isPost()){
            $request->filter('trim,htmlspecialchars');
        }
        if($request->isGet()){
            $request->filter('trim,strip_tags');
        }
        if(strpos($request->url(),'/index.php')!==false){
            redirect(str_replace('/index.php','',$request->url()))->send();
            exit();
        }
        return $next($request);
    }
}