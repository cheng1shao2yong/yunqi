<?php
declare(strict_types=1);

namespace app\admin\command\queueEvent;

use app\common\model\Msg;

class Test implements EventInterFace
{
    public static function handle($output)
    {
        $output->info('测试dddddddddddddd');
    }
}