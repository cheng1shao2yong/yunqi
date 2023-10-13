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

class AuthRule extends Model{

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    protected $type = [
        'updatetime'     =>  'timestamp:Y-m-d H:i',
        'createtime'     =>  'timestamp:Y-m-d H:i',
    ];

    const menutypeList = [
        'addtabs'=>'选项卡',
        'dialog'=>'弹窗',
        'blank'=>'跳转链接',
    ];

    public static function onAfterInsert($rule)
    {
        $rule->weigh=1000-$rule->id;
        $rule->save();
    }

    public static function getRuleListTree(mixed $ruleids):array
    {
        if($ruleids=='*'){
            $ruleList = self::field('id,pid,title,icon,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }else{
            $ruleList = self::whereIn('id',$ruleids)->field('id,pid,title,icon,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }
        Tree::instance()->init($ruleList);
        $list = Tree::instance()->getTreeList(Tree::instance()->getTreeArray(0), 'title');
        return $list;
    }

    public static function getMenuListTree(mixed $ruleids):array
    {
        if($ruleids=='*'){
            $ruleList = self::where('ismenu',1)->field('id,pid,title,icon,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }else{
            $ruleList = self::where('ismenu',1)->whereIn('id',$ruleids)->field('id,pid,title,icon,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }
        Tree::instance()->init($ruleList);
        $list = Tree::instance()->getTreeList(Tree::instance()->getTreeArray(0), 'title');
        return $list;
    }

    public static function getRuleList(mixed $ruleids):array
    {
        if($ruleids=='*'){
            $ruleList = self::field('id,pid,title,icon,ismenu,menutype,extend,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }else{
            $ruleList = self::whereIn('id',$ruleids)->field('id,pid,title,icon,ismenu,menutype,extend,controller,action,ismenu,weigh,status')->order('weigh DESC,id ASC')->select()->toArray();
        }
        $tree=new Tree();
        $tree->init($ruleList);
        $list = $tree->getTreeArray(0);
        return $list;
    }
}