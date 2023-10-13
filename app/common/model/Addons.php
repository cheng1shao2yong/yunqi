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

use app\common\model\base\ConstTraits;
use think\Model;

class Addons extends Model
{
    use ConstTraits;

    const TYPE=[
        'plugin'=>'插件',
        'component'=>'js组件',
        'app'=>'应用',
        'cms-temp'=>'cms模板',
    ];

    public static function list(int $page,int $limit,string $fields,array $where=[])
    {
        $list=Addons::where($where)->limit(($page-1)*$limit,$limit)->select();
        $rows=[];
        $fields=explode(',',$fields);
        foreach ($list as $addon){
            if(!self::checkKey($addon)){
                //人家的插件，不要动
                $addon['price']=0;
            }
            $obj=[];
            foreach ($fields as $field){
                $obj[$field]=$addon[$field];
            }
            $rows[]=$obj;
        }
        $total=Addons::where($where)->count();
        $result = ['total' => $total, 'rows' => $rows];
        return $result;
    }

    public static function checkKey(Addons $addon){
        $key=md5($addon['type'].$addon['pack'].$addon['author'].$addon['version'].$addon['secret_key']);
        if($key!=$addon['key']){
            return false;
        }
        return true;
    }
}
