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

class Config extends Model{

    /**
     * 读取配置类型
     * @return array
     */
    public static function getTypeList()
    {
        $typeList = [
            'text'          => __('单行文本'),
            'textarea'      => __('多行文本'),
            'password'      => __('密码'),
            'editor'        => __('富文本'),
            'number'        => __('数字'),
            'date'          => __('日期'),
            'dateange'      => __('日期区间'),
            'time'          => __('时间'),
            'timerange'     => __('时间区间'),
            'select'        => __('下拉列表'),
            'selects'       => __('下拉列表(多选)'),
            'image'         => __('图片'),
            'images'        => __('多张图片'),
            'file'          => __('文件'),
            'files'         => __('多个文件'),
            'switch'        => __('开关'),
            'radio'         => __('单项选择'),
            'checkbox'      => __('多项选择'),
            'selectpage'    => __('关联表'),
            'selectpages'   => __('关联表(多选)'),
            'json'         => __('JSON')
        ];
        return $typeList;
    }
    public function getValueAttr(string $data)
    {
        if(!$data){
            return $data;
        }
        //判断data是否是json数据类型
        if (str_starts_with($data, '{') &&  str_ends_with($data, '}')) {
            return json_decode($data, true);
        }
        if(str_starts_with($data, '[') &&  str_ends_with($data, ']')){
            return json_decode($data, true);
        }
        return $data;
    }

    public function getExtendAttr(string $data)
    {
        if(!$data){
            return $data;
        }
        //判断data是否是json数据类型
        if (str_starts_with($data, '{') &&  str_ends_with($data, '}')) {
            return json_decode($data, true);
        }
        if(str_starts_with($data, '[') &&  str_ends_with($data, ']')){
            return json_decode($data, true);
        }
        return $data;
    }

}