<?php
declare(strict_types=1);
namespace app\api\service\auth;


use app\common\model\UserToken;
use app\common\model\User;
use think\facade\Config;

class MysqlAdapter implements Adapter
{
    public function userinfo(string $token):array|false
    {
        $time=time();
        $usertoken=UserToken::where(function ($query) use ($token,$time){
            $token=md5($token);
            $query->where('token','=',$token);
            $query->where('expire','>',$time);
        })->withJoin('user','right')->find();
        if($usertoken){
            $auth=Config::get('site.auth');
            //当登陆时间小于保持登陆时间的一半时，自动续时
            if($auth['keepalive'] && $usertoken->expire-$time<$auth['keepalive_time']/2){
                $usertoken->expire=$time+$auth['keepalive_time'];
                $usertoken->save();
            }
            return $usertoken->user->toArray();
        }
        return false;
    }

    public function login(string $token,int $user_id):User
    {
        $user=User::find($user_id);
        if(!$user){
            throw new \Exception('用户不存在');
        }
        if($user->status!='normal'){
            throw new \Exception('用户状态异常');
        }
        $keepalive_time=Config::get('site.auth.keepalive_time');
        UserToken::create([
            'token'=>md5($token),
            'user_id'=>$user_id,
            'expire'=>time()+$keepalive_time
        ]);
        $allow_device_num=Config::get('site.auth.allow_device_num');
        //如果数据库中保存的设备数大于允许的设备数，如果超出则挤出去最早登陆的设备
        $time=time();
        $count=UserToken::where('user_id',$user_id)->where('expire','>',$time)->count();
        if($count>$allow_device_num){
            $usertoken=UserToken::where('user_id',$user_id)->where('expire','>',$time)->order('id','asc')->find();
            $usertoken->delete();
        }
        return $user;
    }

    public function logout(string $token)
    {
        UserToken::where('token',$token)->delete();
    }
}