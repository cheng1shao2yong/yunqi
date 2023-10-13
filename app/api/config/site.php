<?php
// +----------------------------------------------------------------------
// | 应用设置
// +----------------------------------------------------------------------

return [
     'auth'=>[
          //允许同时在线的设备数量
         'allow_device_num'=>10,
          //使用期间自动续时
         'keepalive'=>true,
          //保持登陆时间，单位秒
         'keepalive_time'=>24*3600*30,
         //用户信息保存适配器，更换适配器需要实现app\api\service\auth\Adapter接口
         'adapter'=>app\api\service\auth\MysqlAdapter::class,
     ],
    'upload'=>[
        //上传地址
        'uploadurl' => 'ajax/upload',
        //上传适配器
        'disks'   => 'local_public',
        //最大可上传大小，单位mb
        'maxsize'   => 10,
        //可上传的文件类型
        'mimetype'  => 'jpg,png,bmp,jpeg,gif,txt,doc,docx,xls,xlsx',
        //生成缩略图
        'thumb'=>true,
        //压缩图片
        'compress'=>true,
        //图片加水印
        'watermark'=>true
    ]
];
