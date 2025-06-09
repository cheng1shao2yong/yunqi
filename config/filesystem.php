<?php

return [
    // 默认磁盘
    'default' => 'public',
    // 磁盘列表
    'disks'   => [
        //本地私有文件
        'local_private'  => [
            'name'=>'本地私有文件',
            'type' => 'local',
            'root' => app()->getRootPath() . 'storage',
            'class'=> \app\common\service\upload\PrivateUploadService::class
        ],
        //本地开放文件
        'local_public' => [
            'name'=>'本地开放文件',
            'type' => 'local',
            'root' => app()->getRootPath() . 'public/upload',
            'class'=> \app\common\service\upload\PublicUploadService::class
        ],
        //腾讯云存储
        'tencent_cos' => [
            'name'=>'上传到腾讯云',
            'class'=> \app\common\service\upload\TencentUploadService::class
        ],
        //腾讯云存储
        'aliyun_oss' => [
            'name'=>'上传到阿里云',
            'class'=> \app\common\service\upload\AliyunUploadService::class
        ],
        // 更多的磁盘配置信息
    ],
];
