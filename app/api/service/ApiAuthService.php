<?php
declare(strict_types=1);
namespace app\api\service;

use app\api\service\auth\Adapter;
use app\api\service\authAdapter\BaseAdapter;
use app\common\model\Third;
use app\common\service\AuthService;
use think\facade\Cookie;


class ApiAuthService extends AuthService
{
    protected $allowFields = ['id', 'nickname', 'mobile', 'avatar', 'balance', 'score'];
    private Adapter $adapter;

    private $token;

    public function userinfo(bool $allinfo = false)
    {
        $token=request()->header('token');
        if(!$token){
            $token=Cookie::get('token');
        }
        if(!$token){
            $token=request()->get('token');
        }
        if(!$token){
            $token=request()->post('token');
        }
        if(!$token){
            $token=$this->token;
        }
        if(!$token){
            return false;
        }
        $user=$this->adapter->userinfo($token);
        $this->token=$token;
        if(!$user){
            return false;
        }
        if($allinfo){
            return $user;
        }else{
            return array_intersect_key($user,array_flip($this->allowFields));
        }
    }

    public function logout()
    {
        $this->adapter->logout($this->token);
    }

    public function getToken()
    {
        return $this->token;
    }

    public function login(string $username, string $password)
    {
        // TODO: Implement login() method.
    }

    public function loginByMobile(string $mobile, string $code)
    {
        // TODO: Implement loginByMobile() method.
    }

    public function loginByThirdPlatform(string $platform, string $openid)
    {
        $third=Third::where(['openid'=>$openid,'platform'=>$platform])->find();
        if(!$third){
            throw new \Exception(__('找不到第三方用户信息'));
        }
        $token=uuid();
        $user=$this->adapter->login($token,$third->user_id);
        $this->login_user=$user;
        $this->token=$token;
    }
}