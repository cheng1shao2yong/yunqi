<?php
declare(strict_types=1);

namespace app\index\controller;

use app\common\controller\BaseController;
use think\annotation\route\Get;
use think\facade\View;

class Index extends BaseController
{
    protected function _initialize()
    {
        parent::_initialize();
    }

    #[Get('/')]
    public function index()
    {
        $this->assign('version',site_config('basic.version'));
        return $this->fetch();
    }

    #[Get('/test')]
    public function test()
    {
        $this->success('dddd');
    }
}