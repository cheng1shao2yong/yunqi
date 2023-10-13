<?php
return [
    //检测参数
    app\common\middleware\ParamCheck::class,
    //检测ip黑名单
    app\common\middleware\IpCheck::class,
    //应用结束
    app\common\middleware\EndApp::class,
];
