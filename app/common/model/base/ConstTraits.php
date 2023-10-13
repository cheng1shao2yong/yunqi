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
namespace app\common\model\base;

trait ConstTraits
{
    public static function __callStatic($method, $args) {
        $classname=get_called_class();
        //判断当前类是否存在静态方法
        $class=new \ReflectionClass($classname);
        if($class->hasConstant($method)){
            //获取类的常量,常量名为$method
            $arr=constant("{$classname}::{$method}");
            foreach ($arr as $k=>$v){
                if($args[0]==$v){
                    return $k;
                }
            }
            return null;
        }else{
            return parent::__callStatic($method, $args);
        }
    }
}