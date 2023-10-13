<?php
declare(strict_types=1);

namespace app\common\service;

/**
 * 权限服务
 */
abstract class AuthService extends BaseService
{
    //允许返回给前台的字段
    protected $allowFields = [];

    protected $login_user = null;

    /**
     * 登录
     * @param string $username 用户名
     * @param string $password 密码
     */
    abstract public function login(string $username, string $password);

    /**
     * 手机验证码登录
     * @param string $mobile
     * @param string $code
     * @return mixed
     */
    abstract public function loginByMobile(string $mobile, string $code);

    /**
     * 第三方平台登录
     * @param string $platform
     * @param string $openid
     * @return mixed
     */
    abstract public function loginByThirdPlatform(string $platform, string $openid);
    /**
     * 获取用户信息
     * @return array
     */
    abstract public function userinfo(bool $allinfo=false);
    /**
     * 退出登录
     * @return bool
     */
    abstract public function logout();

    public function __get($name)
    {
        return isset($this->login_user[$name])?$this->login_user[$name]:null;
    }

    /**
     * 检查是否登录
     * @return bool
     */
    public function isLogin()
    {
        if(!$this->login_user){
            return false;
        }
        return true;
    }

    protected function init()
    {
        $login_user = $this->userinfo(true);
        if($login_user){
            $this->login_user=$login_user;
        }
    }
}