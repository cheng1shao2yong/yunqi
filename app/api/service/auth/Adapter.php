<?php
declare(strict_types=1);
namespace app\api\service\auth;
use app\common\model\User;

interface Adapter{
    /**
     * 获取用户信息
     */
    public function userinfo(string $token):array|bool;
    /**
     * 退出登录
     */
    public function logout(string $token);

    /**
     * 登录
     */
    public function login(string $token,int $user_id):User;
}