<?php
declare(strict_types=1);
namespace app\common\service\msg;

use app\common\model\MpSubscribe;
use app\common\model\Third;
use app\common\service\MsgService;
use app\common\model\Msg;

class WechatMsg extends MsgService{

    protected $msg_type='wechat';

    const 公司入驻审核='brr01eC6vBe-XiKZ4q0dXeqMmz3fYzdK2jRe2CLfVHo';

    const 完成添加公司="";
    const 加急配送提醒="93FNX2uF4lMp0BSFUA3TtguWL-eNG4UV1gH-UbHW2fE";
    const 支付成功通知="DiT3UFYt91SpuBlAfLWBSl6peM4jdAoEyVRAvAnUr5Q";

    const 公司审核成功='7ygiHY9YQ7V8XFTOlysV1PHJPEXqs0apUEp3rfjiTCc';
    const 月付支付通知='aiJO5DO90zgDXsSF8GOHxEeswWMi-fg41Qq6LlyYSH4';

    protected function sendEvent(Msg $msg): bool
    {
        $config=[
            'appid'=>site_config("weichat.mp_appid"),
            'appsecret'=>site_config("weichat.mp_secret"),
        ];
        // 实例接口
        $wechat = new \WeChat\Template($config);
        // 执行操作
        try{
            $wechat->send(json_decode($msg->content,true));
            return true;
        }catch (\Exception $e){
            $this->error=$e->getMessage();
            return false;
        }
    }

    /**
     * 新店铺入驻审核
     */
    public static function newCompanyApply($user_id,$register_id,$applyinfo)
    {
        $openid=self::getUserMpOpenid($user_id);
        if(!$openid){
            return;
        }
        $postdata=[
            'touser'=>$openid,
            'template_id'=>self::公司入驻审核,
            //'url'=>request()->domain().'/h5/#/pages/admin/addstore?register_id='.$register_id,
            'miniprogram'=>[
                'appid'=>site_config('weichat.mini_appid'),
                'pagepath'=>'/pages/admin/addstore?register_id='.$register_id,
            ],
            'data'=>[
                'thing1'=>['value'=>$applyinfo['name']],
                'thing2'=>['value'=>$applyinfo['contact']],
                'phone_number3'=>['value'=>$applyinfo['mobile']]
            ]
        ];
        $postdata=json_encode($postdata,JSON_UNESCAPED_SLASHES);
        $service=self::newInstance();
        $service->create($postdata,$user_id);
    }

    public static function noticePayMonthBill($user_id,$bill)
    {
        $openid=self::getUserMpOpenid($user_id);
        if(!$openid){
            return;
        }
        $bill->starttime=substr($bill->starttime,0,10);
        $bill->endtime=substr($bill->endtime,0,10);
        $postdata=[
            'touser'=>$openid,
            'template_id'=>self::月付支付通知,
            //'url'=>request()->domain().'/h5/#/pages/buy/yuefu?goods_id='.$bill->goods_id,
            'miniprogram'=>[
                'appid'=>site_config('weichat.mini_appid'),
                'pagepath'=>'/pages/buy/yuefu?goods_id='.$bill->goods_id,
            ],
            'data'=>[
                'amount1'=>['value'=>$bill->total_money],
                'time2'=>['value'=>$bill->starttime.'~'.$bill->endtime],
                'thing8'=>['value'=>$bill->goods->name],
            ]
        ];
        $postdata=json_encode($postdata,JSON_UNESCAPED_UNICODE);
        $service=self::newInstance();
        $service->create($postdata,$user_id);
    }

    public static function hurryOrderDelivery($user_id,$order)
    {
        $openid=self::getUserMpOpenid($user_id);
        if(!$openid){
            return;
        }
        $postdata=[
            'touser'=>$openid,
            'template_id'=>self::加急配送提醒,
            'miniprogram'=>[
                'appid'=>site_config('weichat.mini_appid'),
                'pagepath'=>'/pages/driver/today',
            ],
            'data'=>[
                'thing1'=>['value'=>'1笔订单需立即配送'],
                'thing2'=>['value'=>$order->number.$order->spec->unit.$order->goods->name],
                'phrase4'=>['value'=>$order->company->contact],
            ]
        ];
        $postdata=json_encode($postdata,JSON_UNESCAPED_UNICODE);
        $service=self::newInstance();
        $service->create($postdata,$user_id);
    }

    public static function payOrderSuccess($order)
    {
        $openid=self::getUserMpOpenid($order->user_id);
        if(!$openid){
            return;
        }
        $postdata=[
            'touser'=>$openid,
            'template_id'=>self::支付成功通知,
            //'url'=>request()->domain().'/h5/#/pages/buy/index?name=order&goods_id='.$order->goods_id,
            'miniprogram'=>[
                'appid'=>site_config('weichat.mini_appid'),
                'pagepath'=>'/pages/buy/index?name=order&goods_id='.$order->goods_id,
            ],
            'data'=>[
                'amount2'=>['value'=>$order->total_money],
                'time3'=>['value'=>$order->createtime],
                'character_string6'=>['value'=>$order->order_no],
                'thing8'=>['value'=>$order->number.$order->spec->unit.$order->goods->name],
            ]
        ];
        $postdata=json_encode($postdata,JSON_UNESCAPED_UNICODE);
        $service=self::newInstance();
        $service->create($postdata,$order->user_id);
    }

    public static function companyApplySuccess($company)
    {
        $openid=self::getUserMpOpenid($company->user_id);
        if(!$openid){
            return;
        }
        $postdata=[
            'touser'=>$openid,
            'template_id'=>self::公司审核成功,
            //'url'=>request()->domain().'/h5/#/pages/index/index',
            'miniprogram'=>[
                'appid'=>site_config('weichat.mini_appid'),
                'pagepath'=>'/pages/index/index',
            ],
            'data'=>[
                'thing1'=>['value'=>$company['name']],
                'thing2'=>['value'=>$company['contact']],
                'phone_number3'=>['value'=>$company['mobile']],
                'time4'=>['value'=>$company['updatetime']],
            ]
        ];
        $postdata=json_encode($postdata,JSON_UNESCAPED_UNICODE);
        $service=self::newInstance();
        $service->create($postdata,$company->user_id);
    }

    public static function addCompanyNoticeToUser($user_id,$applyinfo,$createtime)
    {

    }

    private static function getUserMpOpenid($user_id)
    {
        $unionid=Third::where(['user_id'=>$user_id])->value('unionid');
        $openid=MpSubscribe::where(['unionid'=>$unionid])->value('openid');
        return $openid;
    }
}