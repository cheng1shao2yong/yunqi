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

namespace app\admin\command\queueEvent;

use app\common\model\Msg;

class SendMsg implements EventInterFace
{
    public static function handle($output)
    {
        $list=Msg::where(['status'=>0])->select();
        foreach ($list as $msg){
            $handle=$msg->getHanlde();
            $handle->send($msg);
        }
    }
}