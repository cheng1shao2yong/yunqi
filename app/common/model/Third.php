<?php

namespace app\common\model;

use app\api\service\ApiAuthService;
use app\common\model\base\ConstTraits;
use think\facade\Db;
use think\facade\Log;
use think\Model;

/**
 * 第三方登录模型
 */
class Third extends Model
{

    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 追加属性
    protected $append = [

    ];

    use ConstTraits;

    const PLATFORM = [
        'miniapp' => '微信小程序',
        'mpapp' => '微信公众号',
    ];

    public function user()
    {
        return $this->belongsTo('\app\common\model\User', 'user_id', 'id');
    }

    public static function connect($platform, $params = [])
    {
        $time = time();
        $nickname = $params['nickname']??'用户昵称';
        $mobile = $params['mobile']??'';
        $avatar = $params['avatar']??request()->domain().'/assets/img/avatar.png';
        $values = [
            'platform'      => $platform,
            'openid'        => $params['openid'],
            'unionid'       => isset($params['unionid'])?$params['unionid']:null,
            'openname'      => $nickname,
            'access_token'  => isset($params['access_token'])?$params['access_token']:null,
            'refresh_token' => isset($params['refresh_token'])?$params['refresh_token']:null,
            'expires_in'    => isset($params['expires_in'])?$params['expires_in']:null,
            'logintime'     => $time,
            'expiretime'    => isset($params['expires_in'])?$time + $params['expires_in']:null,
        ];
        Db::startTrans();
        try {
            //是否有自己的
            $third = self::where(['platform' => $platform, 'openid' => $params['openid']])->with(['user'])->find();
            if ($third && !$third->user){
                $third->delete();
            }
            if($third && $third->user){
                $user = $third->user;
                $user->nickname = $nickname;
                $user->avatar = $avatar;
                $user->mobile = $mobile;
                $user->logintime = $time;
                $user->loginip = request()->ip();
                $user->save();
                $third->save($values);
            }else{
                $user_id=0;
                if (isset($params['unionid']) && $params['unionid']) {
                    $third = self::where(['unionid' => $params['unionid']])->with(['user'])->find();
                    if ($third && $third->user) {
                        $user_id=$third->user->id;
                    }
                }
                if(!$user_id){
                    $user=User::createNewUser('',$nickname,$avatar,'',$mobile);
                    $user_id=$user->id;
                }
                $values['user_id'] = $user_id;
                self::create($values);
            }
            $auth=ApiAuthService::newInstance();
            $auth->loginByThirdPlatform($platform,$params['openid']);
            Db::commit();
        } catch (\Exception $e) {
            $error=$e->getMessage();
            Log::error($error);
            Db::rollback();
        }
    }
}
