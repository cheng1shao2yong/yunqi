<?php
return [
    //启用session
    think\middleware\SessionInit::class,
    //非选项卡时重定向
    app\admin\middleware\Redirect::class
];
