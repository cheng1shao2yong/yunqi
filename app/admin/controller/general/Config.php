<?php
/**
 * ----------------------------------------------------------------------------
 * 行到水穷处，坐看云起时
 * 开发软件，找贵阳云起信息科技，官网地址:https://www.56q7.com/
 * ----------------------------------------------------------------------------
 * Author: 老成
 * email：85556713@qq.com
 */
declare(strict_types = 1);

namespace app\admin\controller\general;

use app\common\controller\Backend;
use app\common\model\Addons;
use app\common\model\Config as ConfigModel;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Cache;

/**
 * 系统配置
 */
#[Group("general/config")]
class Config extends Backend
{
    public function _initialize()
    {
        parent::_initialize();
    }

    #[Route("GET","index")]
    public function index()
    {
        if($this->request->isAjax()){
            $group=$this->request->get('group');
            $list=ConfigModel::where(['group'=>$group])->select();
            if($group=='addons'){
                $result=[];
                foreach ($list as $item){
                    $pack=$item->addons;
                    if(!isset($result[$pack])){
                        $name='';
                        $type='';
                        $addons=Addons::where(['pack'=>$pack])->find();
                        if($addons){
                            $name=$addons->name;
                            $type=Addons::TYPE[$addons['type']];
                        }
                        $result[$pack]=[
                            'key'=>$pack,
                            'name'=>$name,
                            'type'=>$type,
                            'list'=>[]
                        ];
                    }
                    $result[$pack]['list'][]=$item;
                }
                $this->success('',array_values($result));
            }
            $this->success('',$list);
        }
        $groupList= ConfigModel::where(['group'=>'dictionary','name'=>'configgroup'])->find()->value;
        $typeList=ConfigModel::getTypeList();
        $this->assign('groupList',$groupList);
        $this->assign('typeList',$typeList);
        $this->assign('app_debug',config('app.app_debug'));
        return $this->fetch();
    }

    #[Route("POST","del")]
    public function del()
    {
        $group=$this->request->post('group');
        $name=$this->request->post('name');
        $config=ConfigModel::where(['name'=>$name,'group'=>$group])->find();
        if(!$config->can_delete){
            $this->error(__('该配置不可删除'));
        }
        $config->delete();
        Cache::delete('site_config_'.$group);
        $this->success();
    }

    #[Route("POST","add")]
    public function add()
    {
        $data=$this->request->post('row/a');
        $name=($data['group']=='addons')?$data['addons_pack'].'_'.$data['name']:$data['name'];
        ConfigModel::where(['name'=>$name,'group'=>$data['group']])->find() && $this->error(__('配置已存在'));
        if($data['group']=='addons' && $data['addons_pack']==''){
            $this->error(__('扩展包名不能为空'));
        }
        $extend='';
        switch ($data['type']){
            case 'radio':
            case 'select':
                if(!isset($data['options'])){
                    $this->error(__('选项不能为空'));
                }
                $extend=htmlspecialchars_decode($data['options']);
                break;
            case 'checkbox':
            case 'selects':
                if(!isset($data['options'])){
                    $this->error(__('选项不能为空'));
                }
                if($data['value']){
                    $isarr=str_starts_with($data['value'], '[') &&  str_ends_with($data['value'], ']');
                    if(!$isarr){
                        $this->error(__('默认值必须是数组'));
                    }
                }
                $extend=htmlspecialchars_decode($data['options']);
                break;
            case 'selectpage':
            case 'selectpages':
                if($data['url']===''){
                    $this->error(__('参数%s不能为空',['s'=>'url']));
                }
                if($data['keyField']===''){
                    $this->error(__('参数%s不能为空',['s'=>'keyField']));
                }
                if($data['labelField']===''){
                    $this->error(__('参数%s不能为空',['s'=>'labelField']));
                }
                $extend=json_encode([
                    'url'=>$data['url'],
                    'keyField'=>$data['keyField'],
                    'labelField'=>$data['labelField'],
                ],JSON_UNESCAPED_UNICODE);
            break;
            case 'array':
                if($data['label']===''){
                    $this->error(__('数组标题不能为空'));
                }
                $extend=json_encode(explode(',',$data['label']),JSON_UNESCAPED_UNICODE);
            break;
        }
        (new ConfigModel())->save([
            'name'=>$name,
            'title'=>$data['title'],
            'type'=>$data['type'],
            'addons'=>($data['group']=='addons')?$data['addons_pack']:'',
            'group'=>$data['group'],
            'value'=>$data['value'],
            'rules'=>str_replace(',',';',$data['rules']),
            'tips'=>$data['tips'],
            'extend'=>$extend,
            'can_delete'=>1
        ]);
        Cache::delete('site_config_'.$data['group']);
        $this->success();
    }

    #[Route("POST","edit")]
    public function edit()
    {
        $data=$this->request->post('row/a');
        $group=$data['group'];
        if($group=='addons'){
            unset($data['addons']);
        }
        foreach ($data as $key=>$value){
            $value=htmlspecialchars_decode($value);
            if($group=='dictionary' && $key=='configgroup'){
                $editvalue=json_decode($value,true);
                $arr=array_keys($editvalue);
                if(!in_array('basic',$arr)){
                    $this->error(__('基础配置项必须存在'));
                }
                if(!in_array('app',$arr)){
                    $this->error(__('应用配置项必须存在'));
                }
                if(!in_array('addons',$arr)){
                    $this->error(__('插件配置项必须存在'));
                }
                if(!in_array('dictionary',$arr)){
                    $this->error(__('配置分组项必须存在'));
                }
            }
            ConfigModel::where(['group'=>$group,'name'=>$key])->update(['value'=>$value]);
        }
        Cache::delete('site_config_'.$data['group']);
        $this->success();
    }
}
