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

namespace app\common\model;

use app\common\library\Tree;
use think\Model;

class AuthGroup extends Model{
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    protected $type = [
        'updatetime'     =>  'timestamp:Y-m-d H:i',
        'createtime'     =>  'timestamp:Y-m-d H:i',
    ];
    public static function getGroupListTree(mixed $groupids=''):array
    {
        if($groupids=='*'){
            $ruleList = self::field('id,pid,name,status')->order('id ASC')->select()->toArray();
            $rootid=0;
        }else{
            $ruleList = self::whereIn('id',$groupids)->field('id,pid,name,status')->order('id ASC')->select()->toArray();
            if(count($ruleList)===0){
                return [];
            }
            $rootid=$ruleList[0]['pid'];
        }
        Tree::instance()->init($ruleList);
        $list = Tree::instance()->getTreeArray($rootid);
        return $list;
    }

    public static function getGroupListArray(mixed $groupids=''):array
    {
        return Tree::instance()->getTreeList(self::getGroupListTree($groupids));
    }
}