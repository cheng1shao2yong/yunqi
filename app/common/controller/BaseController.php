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

namespace app\common\controller;

use app\common\event\AppEvent;
use app\common\listener\WriteLog;
use app\common\service\LangService;
use think\facade\Cookie;
use think\facade\Lang;
use think\facade\View;
use think\facade\Loader;
use think\Request;
use think\Response;

/**
 * 后台控制器基类
 */
class BaseController
{
    /**
     * Request实例
     * @var \think\Request
     */
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
        event('write_log',WriteLog::BEGIN);
        $this->_initialize();
    }
    /**
     * 初始化方法
     * @return void
     */
    protected function _initialize()
    {

    }

    protected function assign(string|array $name, mixed $value = null)
    {
        return View::assign($name,$value);
    }

    protected function fetch(string $template = '', array $vars = [])
    {
        return View::fetch($template,$vars);
    }

    /**
     * 返回成功的操作
     * @param string $msg
     * @param mixed|null $data
     */
    protected function success(string $msg='',mixed $data=null)
    {
        $type='json';
        if(!$this->request->isAjax()) {
            $type = 'html';
        }
        $this->result($msg,$data,1,$type);
    }

    /**
     * 返回失败的操作
     * @param string $msg
     * @param mixed|null $data
     */
    protected function error(string $msg='',mixed $data=null)
    {
        $type='json';
        if(!$this->request->isAjax()) {
            $type = 'html';
        }
        $this->result($msg,$data,0,$type);
    }

    /**
     * 返回请求结果，当ajax请求时返回json，其他请求时返回html
     * @param string      $msg     提示消息
     * @param mixed       $data    返回数据
     * @param int         $code    错误码1为成功，0为失败
     * @param string|null $type    输出类型
     * @param array       $header  发送的 header 信息
     * @param array       $options Response 输出参数
     */
    protected function result(string $msg, mixed $data = null, int $code, string $type = null, array $header = [], array $options = [])
    {
        $result = [
            'code' => $code,
            'msg'  => $msg,
            'data' => $data,
        ];
        $statuscode = 200;
        if (isset($header['statuscode'])) {
            $statuscode = $header['statuscode'];
            unset($header['statuscode']);
        }
        if(!$this->request->isAjax()) {
             View::engine()->layout(false);
             $modulename=app('http')->getName();
             $result['modulename'] = $modulename;
             $result['modulealis'] = get_module_alis($modulename);
             View::assign('result',$result);
             $result=View::fetch('common@/msg');
        }
        $response = Response::create($result, $type, $statuscode)->header($header)->options($options);
        $response->send();
        event('write_log',WriteLog::END);
        exit;
    }
}
