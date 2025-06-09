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
use app\common\controller\Backend;
use app\common\model\AuthGroup;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Validate;
use app\common\model\Admin as AdminModel;

/**
 * 管理员管理
 */
#[Group("auth/admin")]
class Admin extends Backend
{
    protected $groups;

    private $thirdLogin=false;

    protected $noNeedRight='third';

    use Actions{
        add as private _add;
        edit as private _edit;
        del as private _del;
    }

    public function _initialize()
    {
        parent::_initialize();
        $this->model=new AdminModel();
        $this->groups=AuthGroup::select();
        $this->thirdLogin=addons_installed('uniapp') && site_config("uniapp.scan_login");
        $this->assign('thirdLogin',$this->thirdLogin);
    }

    #[Route("*","index")]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            $this->assign('groupids',$this->auth->groupids);
            $this->assign('isSuperAdmin',$this->auth->isSuperAdmin());
            return $this->fetch();
        }
        if($this->request->post('selectpage')){
            return $this->selectpage();
        }
        $where=[];
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
            $or=[];
            foreach ($groupids as $v){
                $or[]="FIND_IN_SET({$v},groupids)";
            }
            $where[]=[implode(' or ',$or)];
        }
        [$where, $order, $limit, $with] = $this->buildparams($where);
        $third_ids=[];
        $list = $this->model
            ->where($where)
            ->order($order)
            ->paginate($limit)
            ->each(function($res) use (&$third_ids){
                $this->formartGroups($res);
                if($this->thirdLogin){
                    $third_ids[]=$res->third_id;
                }
            });
        $rows=$list->items();
        if($this->thirdLogin){
            $thirds=\app\common\model\Third::where('id','in',$third_ids)->column('id,openname','id');
            foreach ($rows as $k=>$v){
                $rows[$k]['third']=$thirds[$v['third_id']]??'';
            }
        }
        $result = ['total' => $list->total(), 'rows' => $rows];
        return json($result);
    }

    #[Route('GET,POST','edit')]
    public function edit()
    {
        $row=$this->model->find($this->request->get('ids'));
        $row->groupids=explode(',',$row->groupids);
        $groupids=$this->auth->getChildrenGroupIds();
        if(!$this->auth->isSuperAdmin()){
            foreach ($row->groupids as $v){
                if(!in_array($v,$groupids)){
                    $this->error(__('无权操作'));
                }
            }
        }
        if($this->request->isPost()){
            $params = $this->request->post("row/a");
            $postgroups=$params['groupids'];
            if(!$this->auth->isSuperAdmin()){
                foreach ($postgroups as $v){
                    if(!in_array($v,$groupids)){
                        $this->error(__('无权操作'));
                    }
                }
            }
            if ($params['password']) {
                if (!Validate::is($params['password'], '\S{6,30}')) {
                    $this->error(__('密码长度不对！'));
                }
                $params['salt'] = str_rand(4);
                $params['password'] = md5(md5($params['password']) . $params['salt']);
            } else {
                unset($params['password'], $params['salt']);
            }
            $params['groupids']=implode(',',$postgroups);
            if(isset($params['third_id']) && !$params['third_id']){
                $params['third_id']=null;
            }
            $row->save($params);
            $this->success();
        }else{
            $this->assign('row',$row);
            $this->assign('groupdata',$this->getGroupData());
            return $this->fetch();
        }
    }

    #[Route('GET,POST','add')]
    public function add()
    {
        if($this->request->isPost()){
            $groupids=$this->auth->getChildrenGroupIds();
            $params = $this->request->post("row/a");
            $postgroups=$params['groupids'];
            if(!$this->auth->isSuperAdmin()){
                foreach ($postgroups as $v){
                    if(!in_array($v,$groupids)){
                        $this->error(__('无权操作'));
                    }
                }
            }
            if (!$params['password']) {
                $this->error(__('请输入密码！'));
            }
            if (!Validate::is($params['password'], '\S{6,30}')) {
                $this->error(__('密码长度不对！'));
            }
            $params['salt'] = str_rand(4);
            $params['password'] = md5(md5($params['password']) . $params['salt']);
            $params['groupids']=implode(',',$postgroups);
            if(isset($params['third_id']) && !$params['third_id']){
                $params['third_id']=null;
            }
            $this->model->save($params);
            $this->success();
        }else{
            $this->assign('groupdata',$this->getGroupData());
            return $this->fetch();
        }
    }

    #[Route('GET,POST','del')]
    public function del()
    {
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
            $ids = $this->request->param("ids");
            $list = $this->model->where('id', 'in', $ids)->select();
            foreach ($list as $row){
                $row->groupids=explode(',',$row->groupids);
                foreach ($row->groupids as $v){
                    if(!in_array($v,$groupids)){
                        $this->error(__('无权操作'));
                    }
                }
            }
        }
        return $this->_del();
    }

    private function getGroupData()
    {
        $groupids='*';
        if(!$this->auth->isSuperAdmin()){
            $groupids=$this->auth->getChildrenGroupIds();
            foreach ($groupids as $k=>$v){
                //去除已经拥有的权限
                if(in_array($v,$this->auth->groupids)){
                    unset($groupids[$k]);
                }
            }
        }
        $groupdata=AuthGroup::getGroupListArray($groupids);
        return $groupdata;
    }

    private function formartGroups(&$admin)
    {
        $groups=$this->groups;
        $names=array_column($groups->toArray(),'name','id');
        $status=array_column($groups->toArray(),'status','id');
        $groupids=$admin->groupids?explode(',',$admin->groupids):[];
        foreach($groupids as $k=>$v){
            $groupids[$k]=[
                'id'=>$v,
                'status'=>$status[$v],
                'name'=>$names[$v]
            ];
        }
        $admin->groupids=$groupids;
    }
}
