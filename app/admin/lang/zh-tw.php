<?php
use app\admin\controller\Ajax;
use app\admin\controller\Index;
return [
    //全局语言包
    'default'=>[
        '添加'=>'添加',
        '编辑'=>'編輯',
        '删除'=>'刪除',
        '更多'=>'更多',
        '正常'=>'正常',
        '隐藏'=>'隱藏',
        '是'=>'是',
        '否'=>'否',
    ],
    //控制器语言包
    'controller'=>[
        Index::class=>[
            '控制台'=>'控制台',
            '常规管理'=>'常規管理',
            '系统配置'=>'系統配置',
            '分类管理'=>'分類管理',
            '附件管理'=>'附件管理',
            '个人资料'=>'個人資料',
            '菜单规则'=>'菜單規則',
            '管理员管理'=>'管理員管理',
            '角色组'=>'角色組',
            '管理员日志'=>'管理員日志',
            '一键Crud'=>'一鍵Crud',
            '任务队列'=>'任務隊列',
            '权限管理'=>'權限管理',
            '开发管理'=>'開發管理'
        ],
        Ajax::class=>[

        ]
        //...自己加
    ]
];