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


use think\Model;

class UserLog Extends Model
{
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = false;

    protected $type = [
        'createtime'     =>  'timestamp:Y-m-d H:i',
    ];

    const TYPE=[
        'balance'=>'余额',
        'score'=>'积分'
    ];

    public static function addBalanceLog($user_id,$change_type,$change,$order_no,$remark)
    {
        self::addLog($user_id,'balance',$change_type,$change,$order_no,$remark);
    }

    public static function addScoreLog($user_id,$change_type,$change,$order_no,$remark)
    {
        self::addLog($user_id,'score',$change_type,$change,$order_no,$remark);
    }

    private static function addLog($user_id,$module,$change_type,$change,$order_no,$remark)
    {
        $user=User::find($user_id);
        if(!$user){
            throw new \Exception('会员不存在！'.$user_id);
        }
        $before=(string)$user->$module;
        $after='';
        $scale=0;
        if($module=='balance'){
            $scale=2;
        }
        switch ($change_type){
            case 'add':
                $after=bcadd($before,(string)$change,$scale);
                break;
            case 'minus':
                $after=bcsub($before,(string)$change,$scale);
                break;
            case 'last':
                $after=$change;
                break;
        }
        $type_txt=self::TYPE[$module];
        if($after<0){
            throw new \Exception($type_txt.'不能小于0');
        }
        $log=new self();
        $log->order_no=$order_no;
        $log->user_id=$user_id;
        $log['type']=$module;
        $log->before=$before;
        $log->change=$change;
        $log->after=$after;
        $log->remark=$remark;
        $log->save();
        $user->$module=$after;
        $user->save();
    }
}
