<?php
use app\admin\controller\Ajax;
use app\admin\controller\Index;
return [
    //全局语言包
    'default'=>[
        '添加'=>'Add',
        '编辑'=>'Edit',
        '删除'=>'Delete',
        '更多'=>'More',
        '正常'=>'Normal',
        '隐藏'=>'Hidden',
        '是'=>'Yes',
        '否'=>'No',
    ],
    //控制器语言包
    'controller'=>[
        Index::class=>[
            '控制台'=>'Dashboard',
            '常规管理'=>'General',
            '系统配置'=>'System',
            '分类管理'=>'Category',
            '附件管理'=>'Attachment',
            '个人资料'=>'Profile',
            '菜单规则'=>'Menu',
            '管理员管理'=>'Admin',
            '角色组'=>'Role',
            '管理员日志'=>'Admin Log',
            '一键Crud'=>'Crud',
            '任务队列'=>'Task Queue',
            '权限管理'=>'Permission',
            '开发管理'=>'Development',
        ],
        Ajax::class=>[

        ]
        //...英语不好,自己加
    ]
];