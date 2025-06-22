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

use app\admin\traits\Actions;
use app\common\model\AuthGroup;
use app\common\model\Admin;
use app\common\controller\Backend;
use app\common\model\AuthRule;
use think\annotation\route\Group as GroupAnnotation;
use think\annotation\route\Route;

/**
 * 角色组
 */
#[GroupAnnotation("auth/group")]
class Group extends Backend
{
    protected $noNeedRight=['roletree'];
    private $groupdata=null;

    use Actions{
        index as private _index;
        add as private _add;
        edit as private _edit;
        del as private _del;
        multi as private _multi;
    }

    public function _initialize()
    {
        parent::_initialize();
        $this->model=new AuthGroup();
    }

    private function getGroupData()
    {
        $groupids='*';
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
        }
        return AuthGroup::getGroupListTree($groupids);
    }

    #[Route('GET,JSON','index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            $this->assign('groupids',$this->auth->groupids);
            return $this->fetch();
        }
        $result = ['total' => 1000, 'rows' =>$this->getGroupData()];
        return json($result);
    }

    #[Route('GET,POST','add')]
    public function add()
    {
        if($this->request->isPost()){
            $this->volidate();
        }else{
            $this->assign('groupdata',$this->getGroupData());
        }
        return $this->_add();
    }

    #[Route('GET,POST','edit')]
    public function edit()
    {
        if($this->request->isPost()){
            $this->volidate();
            return $this->_edit();
        }else{
            $ids = $this->request->get('ids');
            $row = $this->model->find($ids);
            $count=0;
            $row->rules=implode(',',$this->getDiffRules($row->rules,$count));
            $this->assign('row', $row);
            $this->assign('groupdata',$this->getGroupData());
            return $this->fetch();
        }
    }

    private function getDiffRules($rules,&$count)
    {
        if(is_string($rules)){
            $rules=explode(',',$rules);
        }
        $ruleslist=AuthRule::field('id,pid')->select();
        $pids=[];
        foreach ($ruleslist as $rule){
            if(!in_array($rule->id,$rules) && $rule->pid){
                $pids[]=$rule->pid;
            }
        }
        $pids=array_unique($pids);
        //删除数组$rules中存在于$pids中的元素
        $rules=array_diff($rules,$pids);
        if(count($pids)!=$count){
            $count=count($pids);
            $rules=$this->getDiffRules($rules,$count);
        }
        return $rules;
    }

    #[Route('POST,GET','del')]
    public function del()
    {
        $ids = $this->request->param("ids");
        $ids=explode(',',$ids);
        foreach ($ids as $id){
            $count=Admin::where("FIND_IN_SET({$id},groupids)")->count();
            if($count>0){
                $this->error(__('请先删除该角色组下的管理员'));
            }
        }
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
            foreach ($ids as $id){
                if(!in_array($id,$groupids)){
                    $this->error(__('无权操作'));
                }
            }
            foreach ($ids as $id){
                if(in_array($id,$this->auth->groupids)){
                    $this->error(__('无权操作'));
                }
            }
        }
        return $this->_del();
    }

    #[Route('POST,GET','multi')]
    public function multi()
    {
        $ids = $this->request->param('ids');
        $ids=is_string($ids)?explode(',',$ids):$ids;
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
            foreach ($ids as $id){
                if(!in_array($id,$groupids)){
                    $this->error(__('无权操作'));
                }
            }
            foreach ($ids as $id){
                if(in_array($id,$this->auth->groupids)){
                    $this->error(__('无权操作'));
                }
            }
        }
        return $this->_multi();
    }

    #[Route('GET','roletree')]
    public function roletree($groupid=0)
    {
        if($groupid==1){
            $ruleids='*';
        }else{
            $ruleids=explode(',',AuthGroup::find($groupid)->auth_rules);
        }
        $list=AuthRule::getRuleList($ruleids);
        return json($list);
    }

    //验证加菜单的权限
    private function volidate()
    {
        $pid=$this->request->post('row.pid');
        $rules=$this->request->post('row.rules');
        $ids=$this->request->get('ids');
        if($pid==$ids){
            $this->error(__('上级不能是自己'));
        }
        if(empty($rules)){
            $this->error(__('角色操作权限不能为空'));
        }
        if(!$this->auth->isSuperAdmin()){
            $auth_rules=explode(',',$this->request->post('row.auth_rules'));
            $userrule=$this->auth->getUserRuleList();
            $usermenu=$this->auth->getUserMenuList();
            $arr=array_column(array_merge($userrule,$usermenu),'id');
            for($i=0;$i<count($auth_rules);$i++){
                if(!in_array($auth_rules[$i],$arr)){
                    $this->error(__('无权操作'));
                }
            }
            $groupids=$this->auth->getChildrenGroupIds();
            if(!in_array($pid,$groupids)){
                $this->error(__('无权操作'));
            }
        }
    }
}
