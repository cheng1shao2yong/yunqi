SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for __PREFIX__addons
-- ----------------------------
CREATE TABLE `__PREFIX__addons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(50) DEFAULT NULL COMMENT '唯一识别key',
  `secret_key` varchar(50) DEFAULT NULL,
  `pack` varchar(30) DEFAULT NULL COMMENT '包名',
  `type` varchar(30) DEFAULT NULL COMMENT '类型',
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `author` varchar(30) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT '0',
  `version` varchar(20) DEFAULT NULL,
  `install` tinyint(4) DEFAULT '0',
  `open` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for __PREFIX__admin
-- ----------------------------
CREATE TABLE `__PREFIX__admin` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户名',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '昵称',
  `password` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码',
  `salt` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码盐',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '/assets/img/avatar.png' COMMENT '头像',
  `mobile` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '手机号码',
  `groupids` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loginfailure` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '失败次数',
  `logintime` int(10) unsigned DEFAULT NULL COMMENT '登录时间',
  `loginip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '登录IP',
  `token` varchar(59) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'Session标识',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ----------------------------
-- Table structure for __PREFIX__admin_log
-- ----------------------------
CREATE TABLE `__PREFIX__admin_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `admin_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '管理员ID',
  `username` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '管理员名字',
  `controller` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '日志标题',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '内容',
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'IP',
  `useragent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'User-Agent',
  `createtime` bigint(16) DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `name` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员日志表';

-- ----------------------------
-- Table structure for __PREFIX__attachment
-- ----------------------------
CREATE TABLE `__PREFIX__attachment` (
  `id` int(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '类别',
  `admin_id` int(10) unsigned DEFAULT '0' COMMENT '管理员ID',
  `user_id` int(10) unsigned DEFAULT NULL COMMENT '会员ID',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '物理路径',
  `fullurl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumburl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_image` tinyint(4) DEFAULT NULL,
  `imagetype` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagewidth` int(11) DEFAULT NULL,
  `imageheight` int(11) DEFAULT NULL,
  `filename` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '文件名称',
  `filesize` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '文件大小',
  `mimetype` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'mime类型',
  `storage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local' COMMENT '存储位置',
  `sha1` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '文件 sha1编码',
  `weigh` int(11) DEFAULT '0',
  `uploadtime` int(10) unsigned DEFAULT NULL COMMENT '上传时间',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建日期',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附件表';

-- ----------------------------
-- Table structure for __PREFIX__auth_group
-- ----------------------------
CREATE TABLE `__PREFIX__auth_group` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父组别',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '组名',
  `rules` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则ID',
  `auth_rules` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分组表';

-- ----------------------------
-- Records of __PREFIX__auth_group
-- ----------------------------
INSERT INTO `__PREFIX__auth_group` VALUES ('1', '0', '超级管理组', '*', '*', 'normal', '1491635035', '1491635035');

-- ----------------------------
-- Table structure for __PREFIX__auth_rule
-- ----------------------------
CREATE TABLE `__PREFIX__auth_rule` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父ID',
  `controller` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '规则名称',
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '规则名称',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图标',
  `menutype` enum('addtabs','blank','dialog') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜单类型',
  `ismenu` tinyint(1) unsigned DEFAULT '0' COMMENT '是否为菜单',
  `extend` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '扩展属性',
  `weigh` int(10) DEFAULT '0' COMMENT '权重',
  `addons` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '状态',
  `createtime` int(16) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(16) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`),
  KEY `weigh` (`weigh`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='节点表';

-- ----------------------------
-- Records of __PREFIX__auth_rule
-- ----------------------------
INSERT INTO `__PREFIX__auth_rule` VALUES ('1', '0', 'app\\admin\\controller\\Dashboard', 'index', '控制台', 'fa fa-dashboard', 'addtabs', '1', null, '999', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('2', '0', null, null, '常规管理', 'fa fa-cogs', 'addtabs', '1', null, '997', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('3', '2', 'app\\admin\\controller\\general\\Config', 'index', '系统配置', 'fa fa-cog', 'addtabs', '1', null, '996', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('4', '2', 'app\\admin\\controller\\general\\Category', 'index', '分类管理', 'fa fa-leaf', 'addtabs', '1', null, '995', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('5', '2', 'app\\admin\\controller\\general\\Attachment', 'index', '附件管理', 'fa fa-file-image-o', 'addtabs', '1', null, '994', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('6', '2', 'app\\admin\\controller\\general\\Profile', 'index', '个人资料', 'fa fa-user', 'addtabs', '1', null, '993', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('7', '0', null, null, '权限管理', 'fa fa-group', 'addtabs', '1', null, '992', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('8', '7', 'app\\admin\\controller\\auth\\Rule', 'index', '菜单规则', 'fa fa-bars', 'addtabs', '1', null, '998', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('9', '7', 'app\\admin\\controller\\auth\\Group', 'index', '角色组', 'fa fa-th-large', 'addtabs', '1', null, '990', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('10', '7', 'app\\admin\\controller\\auth\\Admin', 'index', '管理员管理', 'fa fa-user', 'addtabs', '1', null, '989', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('11', '7', 'app\\admin\\controller\\auth\\Adminlog', 'index', '管理员日志', 'fa fa-list-alt', 'addtabs', '1', null, '988', null, 'normal', '1491635035', '1690879080');
INSERT INTO `__PREFIX__auth_rule` VALUES ('12', '0', null, null, '用户管理', 'fa fa-user', 'addtabs', '1', null, '896', null, 'normal', '1491635035', '1692775961');
INSERT INTO `__PREFIX__auth_rule` VALUES ('13', '12', 'app\\admin\\controller\\user\\Index', 'index', '会员列表', 'fa fa-user', 'addtabs', '1', null, '906', null, 'normal', '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('14', '3', 'app\\admin\\controller\\general\\Config', '[\"index\",\"add\",\"edit\",\"del\"]', '[\"查看\",\"添加\",\"编辑\",\"删除\"]', null, null, '0', null, '979', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('15', '5', 'app\\admin\\controller\\general\\Attachment', '[\"index\",\"add\",\"multi\",\"del\",\"setcate\"]', '[\"查看\",\"添加\",\"更新\",\"删除\",\"设置分类\"]', null, null, '0', null, '978', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('16', '8', 'app\\admin\\controller\\auth\\Rule', '[\"index\",\"add\",\"edit\",\"multi\",\"del\"]', '[\"查看\",\"添加\",\"编辑\",\"更新\",\"删除\"]', null, null, '0', null, '977', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('17', '9', 'app\\admin\\controller\\auth\\Group', '[\"index\",\"add\",\"edit\",\"multi\",\"del\"]', '[\"查看\",\"添加\",\"编辑\",\"更新\",\"删除\"]', null, null, '0', null, '976', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('18', '10', 'app\\admin\\controller\\auth\\Admin', '[\"index\",\"add\",\"edit\",\"multi\",\"del\"]', '[\"查看\",\"添加\",\"编辑\",\"更新\",\"删除\"]', null, null, '0', null, '975', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('19', '1', 'app\\admin\\controller\\Dashboard', '[\"index\"]', '[\"查看\"]', null, null, '0', null, '974', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('20', '4', 'app\\admin\\controller\\general\\Category', '[\"index\",\"add\",\"edit\",\"multi\",\"del\"]', '[\"查看\",\"添加\",\"编辑\",\"更新\",\"删除\"]', null, null, '0', null, '973', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('21', '6', 'app\\admin\\controller\\general\\Profile', '[\"index\",\"update\"]', '[\"查看\",\"更新\"]', null, null, '0', null, '972', null, null, '1491635035', '1491635035');
INSERT INTO `__PREFIX__auth_rule` VALUES ('22', '11', 'app\\admin\\controller\\auth\\Adminlog', '[\"index\",\"del\",\"detail\"]', '[\"查看\",\"删除\",\"详情\"]', null, null, '0', null, '970', null, null, '1690883964', '1690885832');
INSERT INTO `__PREFIX__auth_rule` VALUES ('23', '13', 'app\\admin\\controller\\user\\Index', '[\"index\"]', '[\"查看\"]', null, null, '0', null, '905', null, null, '1690948968', '1692598929');
INSERT INTO `__PREFIX__auth_rule` VALUES ('24', '0', null, null, '开发管理', 'fa fa-bug', 'addtabs', '1', null, '987', null, 'normal', '1691023857', '1691023857');
INSERT INTO `__PREFIX__auth_rule` VALUES ('25', '24', 'app\\admin\\controller\\Develop', 'crud', '一键Crud', 'fa fa-codepen', 'addtabs', '1', null, '967', null, 'normal', '1691025627', '1691046865');
INSERT INTO `__PREFIX__auth_rule` VALUES ('26', '24', 'app\\admin\\controller\\Develop', 'queue', '任务队列', 'fa fa-list-ol', 'addtabs', '1', null, '904', null, 'normal', '1692589366', '1692612046');
INSERT INTO `__PREFIX__auth_rule` VALUES ('27', '25', 'app\\admin\\controller\\Develop', '[\"crud\",\"clear\"]', '[\"生成\",\"清除\"]', null, null, '0', null, '891', null, null, '1694399955', '1694400040');
INSERT INTO `__PREFIX__auth_rule` VALUES ('28', '26', 'app\\admin\\controller\\Develop', '[\"delQueue\",\"addQueue\",\"queueStatus\"]', '[\"删除任务\",\"添加任务\",\"修改状态\"]', null, null, '0', null, '890', null, null, '1694400178', '1694400208');
INSERT INTO `__PREFIX__auth_rule` VALUES ('29', '24', 'app\\admin\\controller\\Addons', 'index', '应用扩展', 'fa fa-puzzle-piece', 'addtabs', '1', null, '889', null, 'normal', '1694508078', '1694592851');

-- ----------------------------
-- Table structure for __PREFIX__category
-- ----------------------------
CREATE TABLE `__PREFIX__category` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父ID',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '栏目类型',
  `name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `image` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '图片',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `weigh` (`weigh`,`id`),
  KEY `pid` (`pid`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ----------------------------
-- Records of __PREFIX__category
-- ----------------------------
INSERT INTO `__PREFIX__category` VALUES ('1', '0', 'default', '服装', null, null, '985', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('2', '1', 'default', 'T恤', null, null, '984', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('3', '1', 'default', '裙子', null, null, '983', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('4', '1', 'default', '帽子', null, null, '982', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('5', '1', 'default', '裤子', null, null, '981', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('6', '0', 'default', '电子产品', null, null, '980', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('7', '6', 'default', '电脑', null, null, '979', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('8', '6', 'default', '手机', null, null, '977', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('9', '6', 'default', '蓝牙音响', null, null, '978', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('10', '7', 'default', 'MacBook', null, null, '976', 'normal', null, null);
INSERT INTO `__PREFIX__category` VALUES ('11', '7', 'default', '小米笔记本', null, null, '975', 'normal', null, null);

-- ----------------------------
-- Table structure for __PREFIX__config
-- ----------------------------
CREATE TABLE `__PREFIX__config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '变量名',
  `group` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '分组',
  `addons` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '变量标题',
  `tip` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '变量描述',
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '类型:string,text,int,bool,array,datetime,date,file',
  `value` text COLLATE utf8mb4_unicode_ci COMMENT '变量值',
  `rules` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '验证规则',
  `can_delete` tinyint(4) DEFAULT '1',
  `extend` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '扩展属性',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`group`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置';

-- ----------------------------
-- Records of __PREFIX__config
-- ----------------------------
INSERT INTO `__PREFIX__config` VALUES ('1', 'categorytype', 'dictionary', null, '分类分组', '', 'json', '{\"default\":\"默认\",\"cate1\":\"分类一\",\"cate2\":\"分类二\",\"cate3\":\"分类三\"}', '', '0', '[\"键名\",\"键值\"]');
INSERT INTO `__PREFIX__config` VALUES ('2', 'configgroup', 'dictionary', null, '配置分组', '', 'json', '{\"basic\":\"基础配置\",\"app\":\"应用配置\",\"addons\":\"扩展配置\",\"dictionary\":\"配置分组\"}', '', '0', '[\"键名\",\"键值\"]');
INSERT INTO `__PREFIX__config` VALUES ('3', 'filegroup', 'dictionary', null, '附件分组', '', 'json', '{\"fold-1\":\"相册1\",\"fold-2\":\"相册2\",\"fold-3\":\"相册3\"}', '', '0', '[\"键名\",\"键值\"]');
INSERT INTO `__PREFIX__config` VALUES ('4', 'sitename', 'basic', null, '站点名称', '', 'text', '云油道', 'required', '0', '');
INSERT INTO `__PREFIX__config` VALUES ('5', 'logo', 'basic', null, '站点Logo', '', 'image', '/assets/img/logo.png', 'required', '0', '');
INSERT INTO `__PREFIX__config` VALUES ('6', 'forbiddenip', 'basic', null, 'IP黑名单', '', 'textarea', '', '', '0', '');
INSERT INTO `__PREFIX__config` VALUES ('7', 'version', 'basic', null, '版本号', '', 'text', '1.1.001', 'required', '0', '');
INSERT INTO `__PREFIX__config` VALUES ('8', 'copyright', 'basic', null, '版权标识', '', 'text', '贵阳云起信息科技有限公司', 'required', '0', '');

-- ----------------------------
-- Table structure for __PREFIX__msg
-- ----------------------------
CREATE TABLE `__PREFIX__msg` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `msg_type` varchar(20) DEFAULT NULL COMMENT '消息类型',
  `handle` varchar(255) DEFAULT NULL,
  `send_to` varchar(255) DEFAULT NULL,
  `content` text,
  `status` tinyint(4) DEFAULT '0',
  `error` varchar(255) DEFAULT NULL,
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  `deletetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for __PREFIX__queue
-- ----------------------------
CREATE TABLE `__PREFIX__queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `function` varchar(30) NOT NULL,
  `limit` int(11) DEFAULT '0' COMMENT '限制次数,0为循环执行',
  `filter` varchar(255) DEFAULT NULL,
  `delay` int(11) NOT NULL COMMENT '两次执行间隔时间',
  `times` int(11) DEFAULT '0' COMMENT '已经执行的次数',
  `lasttime` datetime DEFAULT NULL COMMENT '上次执行的时间',
  `status` varchar(255) DEFAULT 'normal',
  `error` varchar(255) DEFAULT NULL,
  `createtime` int(11) DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL,
  `deletetime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of __PREFIX__queue
-- ----------------------------
INSERT INTO `__PREFIX__queue` VALUES ('1', '发送消息', 'SendMsg', '0', '', '60', '23123', '2023-09-21 11:21:02', 'normal', '', '1694141040', '1695266512', null);

-- ----------------------------
-- Table structure for __PREFIX__user
-- ----------------------------
CREATE TABLE `__PREFIX__user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户名',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '昵称',
  `password` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码',
  `salt` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码盐',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '电子邮箱',
  `mobile` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '手机号',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '头像',
  `level` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '等级',
  `sex` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT '性别',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '余额',
  `score` int(10) NOT NULL DEFAULT '0' COMMENT '积分',
  `successions` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '连续登录天数',
  `maxsuccessions` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '最大连续登录天数',
  `prevtime` int(10) unsigned DEFAULT NULL COMMENT '上次登录时间',
  `logintime` int(10) unsigned DEFAULT NULL COMMENT '登录时间',
  `loginip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '登录IP',
  `loginfailure` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '失败次数',
  `joinip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '加入IP',
  `jointime` bigint(16) DEFAULT NULL COMMENT '加入时间',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `deletetime` int(10) unsigned DEFAULT NULL,
  `updatetime` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  KEY `email` (`email`),
  KEY `mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- ----------------------------
-- Records of __PREFIX__user
-- ----------------------------
INSERT INTO `__PREFIX__user` VALUES ('1', 'laocheng', '老成', 'c4fa2414ad0f73313b3425b50b4af4f4', 'UxO5', '85556713@qq.com', '13027867015', '/assets/img/avatar.jpg', '0', '1', null, '0.00', '0', '1', '1', null, null, '', '0', '59.51.173.98', '1695613583', 'normal', '1695613583', null, '1695613583');

-- ----------------------------
-- Table structure for __PREFIX__user_log
-- ----------------------------
CREATE TABLE `__PREFIX__user_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `order_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('score','balance') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `change` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0.00' COMMENT '变更余额',
  `before` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0.00' COMMENT '变更前余额',
  `after` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0.00' COMMENT '变更后余额',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注',
  `createtime` int(10) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `order_no` (`order_no`(191))
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员余额变动表';

-- ----------------------------
-- Table structure for __PREFIX__user_token
-- ----------------------------
CREATE TABLE `__PREFIX__user_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(50) DEFAULT NULL,
  `expire` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
