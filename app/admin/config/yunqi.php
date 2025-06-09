<?php
// +----------------------------------------------------------------------
// | 应用设置
// +----------------------------------------------------------------------

return [
    //支持语言包
    'language_list'    =>    [
        'zh-cn'=>'中文简体',
        'zh-tw'=>'中文繁體',
        'en-us'=>'English'
    ],
    //默认语言包
    'language'=>'zh-cn',
    //登录验证码
    'login_captcha' => true,
    //登录失败超过10次则1天后重试
    'login_failure_retry' => true,
    //是否同一账号同一时间只能在一个地方登录
    'login_unique' => false,
    //是否开启IP变动检测
    'loginip_check' => false,
    //界面主题
    'elementUi' => [
        //布局
        'layout' => 'vertical',
        //主题颜色
        'theme_color' => '#276EB8',
        //暗黑模式
        'dark' => false,
        //面包屑
        'breadcrumb' => true,
        //折叠菜单
        'is_menu_collapse' => false,
        //选项卡
        'tabs' => true,
        //底部
        'footer' => true,
    ],
    //上传文件
    'upload'=>[
        //上传地址
        'uploadurl' => 'ajax/upload',
        //上传适配器
        'disks'   => 'local_public',
        //最大可上传大小，单位mb
        'maxsize'   => 20,
        //可上传的文件类型
        'mimetype'  => 'jpg,png,bmp,jpeg,gif,webp,zip,rar,wav,mp4,mp3,webm,doc,docx,xls,xlsx,pdf',
        //生成缩略图
        'thumb'=>true,
        //压缩图片
        'compress'=>true,
        //图片加水印
        'watermark'=>true
    ],
    //插件获取地址
    'plugins_host'=>'https://www.56q7.com'
];
