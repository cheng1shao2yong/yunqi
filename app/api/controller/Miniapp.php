<?php
declare (strict_types = 1);

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Third;
use think\annotation\route\Group;
use think\annotation\route\Post;

#[Group("miniapp")]
class Miniapp extends Api
{
    protected $noNeedLogin = ['login','getMobile','mockLogin'];

    #[Post('login')]
    public function login()
    {
        $code=$this->request->post('code');
        $config=[
            'appid'=>site_config("addons.uniapp_miniapp_id"),
            'appsecret'=>site_config("addons.uniapp_miniapp_secret")
        ];
        $mini = new \WeMini\Crypt($config);
        $data = $mini->session($code);
        $openid=$data['openid'];
        $unionid=isset($data['unionid'])?$data['unionid']:'';
        $avatar=$this->request->post('avatar');
        $nickname=$this->request->post('nickname');
        $mobile=$this->request->post('mobile');
        //判断是否启用账号绑定
        Third::connect(Third::PLATFORM('微信小程序'), compact('openid', 'unionid', 'avatar', 'nickname', 'mobile'));
        $this->auth->loginByThirdPlatform(Third::PLATFORM('微信小程序'),$openid);
        $token=$this->auth->getToken();
        $userinfo=$this->auth->userinfo();
        $this->success('登录成功',compact('token','userinfo'));
    }

    #[Post('getMobile')]
    public function getMobile()
    {
        $code=$this->request->post('code');
        $config=[
            'appid'=>site_config("addons.uniapp_miniapp_id"),
            'appsecret'=>site_config("addons.uniapp_miniapp_secret")
        ];
        $mini = new \WeMini\Crypt($config);
        $result=$mini->getPhoneNumber($code);
        $this->success('',$result['phone_info']['phoneNumber']);
    }

    //模拟登陆
    #[Post('mock-login')]
    public function mockLogin()
    {
        $openid=$this->request->post('openid');
        $this->auth->loginByThirdPlatform(Third::PLATFORM('微信小程序'),$openid);
        $token=$this->auth->getToken();
        $userinfo=$this->auth->userinfo();
        $this->success('登录成功',compact('token','userinfo'));
    }
}
