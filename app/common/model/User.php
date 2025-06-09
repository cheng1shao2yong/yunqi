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

namespace app\common\model;

use app\common\model\base\BaseModel;

class User extends BaseModel
{
    //创建一个新用户
    public static function createNewUser(
        string $username='',
        string $nickname='',
        string $avatar='',
        string $email='',
        string $mobile='',
        string $password=''
    ){
        if(!$username){
            $username='u-'.str_rand(6);
        }
        if(!$nickname){
            $nickname='n-'.str_rand(6);
        }
        if(!$avatar){
            $avatar=request()->domain().'/assets/img/avatar.jpg';
        }
        if(!$email){
            $email=$username.'@'.request()->host();
        }
        $salt=str_rand(4);
        if($password){
            $password=md5(md5($password.$salt));
        }else{
            $password=md5(md5($username.$salt));
        }
        $user=self::create([
            'username'=>$username,
            'nickname'=>$nickname,
            'avatar'=>$avatar,
            'email'=>$email,
            'mobile'=>$mobile,
            'password'=>$password,
            'salt'=>$salt,
            'joinip'=>request()->ip(),
            'jointime'=>time(),
            'status'=>'normal',
        ]);
        return $user;
    }

    public function log()
    {
        return $this->hasMany(UserLog::class,'user_id','id');
    }
}