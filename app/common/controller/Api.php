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

namespace app\common\controller;

use app\api\service\ApiAuthService;
use think\exception\HttpResponseException;
use think\facade\Config;
use think\Response;

class Api extends BaseController
{
    /**
     * 当前登录用户
     * @var \app\api\service\ApiAuthService
     */
    protected $auth;
    /**
     * 无需登录的方法,同时也就不需要鉴权了
     * @var array
     */
    protected $noNeedLogin = [];

    protected function _initialize()
    {
        $class=Config::get('site.auth.adapter');
        $this->auth=ApiAuthService::newInstance(['adapter'=>new $class()]);
        $actionname = $this->request->action();
        $noNeedLoginSet=is_string($this->noNeedLogin)?[$this->noNeedLogin]:$this->noNeedLogin;
        $noNeedLogin = in_array('*',$noNeedLoginSet) || in_array($actionname,$noNeedLoginSet);
        //需要登陆
        if(!$noNeedLogin && !$this->auth->isLogin()){
            $response = Response::create(__('没有操作权限!'), 'html', 401);
            throw new HttpResponseException($response);
        }
    }
}