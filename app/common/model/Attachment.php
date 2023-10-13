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

use think\Model;

class Attachment extends Model{

    public static function getCategory()
    {
        $category=site_config("dictionary.filegroup");
        return $category;
    }
    public static function getDisksType():array
    {
        $disks=config('filesystem.disks');
        $disksType=[];
        foreach($disks as $key=>$value){
            $disksType[$key]=$value['name'];
        }
        return $disksType;
    }
}