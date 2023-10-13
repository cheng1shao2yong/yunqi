<?php
declare(strict_types=1);

namespace app\index\controller;

use app\common\controller\BaseController;
use think\annotation\route\Get;

class Index extends BaseController
{
    #[Get('/')]
    public function index()
    {
        $this->assign('version',site_config('basic.version'));
        return $this->fetch();
    }
}