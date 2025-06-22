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

namespace app\admin\controller\auth;

use app\common\controller\Backend;
use app\admin\traits\Actions;
use think\annotation\route\Route;
use think\annotation\route\Group;
use app\common\model\AuthRule;
use think\facade\Cache;
use think\facade\Db;

/**
 * 规则管理
 */
#[Group("auth/rule")]
class Rule extends Backend
{
    use Actions{
        add as private _add;
        edit as private _edit;
    }

    protected function _initialize()
    {
        parent::_initialize();
        $this->model = new AuthRule();
        Cache::delete('admin_rule_list');
        Cache::delete('admin_menu_list');
    }

    #[Route('GET,JSON','index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            return $this->fetch();
        }
        $tree=AuthRule::getRuleListTree('*');
        $result = ['total' => 1000, 'rows' => $tree];
        return json($result);
    }

    #[Route('GET,POST','add')]
    public function add()
    {
        $this->beforeAction();
        return $this->_add();
    }

    #[Route('GET,POST','edit')]
    public function edit()
    {
        $this->beforeAction();
        return $this->_edit();
    }

    #[Route('GET,POST','del')]
    public function del()
    {
        $ids = $this->request->param("ids");
        $list = $this->model->where('id', 'in', $ids)->select();
        foreach ($list as $item) {
            $ins=AuthRule::where(['pid'=>$item->id,'ismenu'=>1])->count();
            if($ins>0){
                $this->error(__('请先删除【%s】的子菜单',['s'=>$item->title]));
            }
        }
        $count = 0;
        Db::startTrans();
        try {
            foreach ($list as $item) {
                AuthRule::where(['pid'=>$item->id])->delete();
                $count += $item->delete();
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($count) {
            $this->success();
        }
        $this->error(__('没有记录被删除'));
    }

    private function beforeAction()
    {
        if(!$this->request->isPost()){
            $tree=AuthRule::getRuleListTree('*',true);
            $ruledata=array_merge(array([
                'id'=>'0',
                'title'=>__('无'),
                'childlist'=>[]
            ]),$tree);
            $this->assign('ruledata',$ruledata);
            $this->assign('menutypeList',AuthRule::menutypeList);
        }else{
            $ismenu=$this->request->post('row.ismenu');
            $controller=$this->request->post('row.controller');
            if($controller && !class_exists($controller)){
                $this->error(__('控制器不存在'));
            }
            if($ismenu){
                $action=$this->request->post('row.action');
                if($action){
                    if(!method_exists($controller,$action)){
                        $this->error(__('方法%s不存在',['s'=>$action]));
                    }
                }
            }else{
                $this->postParams['menutype']='';
                $this->postParams['icon']='';
                $this->postParams['extend']='';
                $this->postParams['status']='';
                $actions=$this->request->post('row.actions');
                if(!$actions){
                    $this->error(__('请填写方法列表'));
                }
                $actions=json_decode(htmlspecialchars_decode($actions),true);
                $title=[];
                $action=[];
                foreach ($actions as $key=>$value){
                    if(!method_exists($controller,$key)){
                        $this->error(__('方法%s不存在',['s'=>$key]));
                    }
                    $action[]=$key;
                    $title[]=$value;
                }
                $this->postParams['action']=json_encode($action,JSON_UNESCAPED_UNICODE);
                $this->postParams['title']=json_encode($title,JSON_UNESCAPED_UNICODE);
            }
        }
    }
}
