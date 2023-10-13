<?php
declare (strict_types = 1);

namespace app\api\controller;

use app\common\controller\Api;
use think\annotation\route\Get;
use think\annotation\route\Group;

#[Group("user")]
class User extends Api
{
    #[Get('userinfo')]
    public function userinfo()
    {
        $user=$this->auth->userinfo();
        $this->success('',$user);
    }

    #[Get('test')]
    public function test()
    {
        $this->success('你已经登陆过了');
    }
}
