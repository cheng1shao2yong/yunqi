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

use app\common\model\AdminLog as LogModel;
use app\common\model\Admin;
use app\common\controller\Backend;
use think\annotation\route\Group;
use think\annotation\route\Route;

/**
 * 管理员日志
 */
#[Group("auth/adminlog")]
class Adminlog extends Backend
{

    protected $relationField=[];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new LogModel();
    }

    #[Route('GET,JSON','index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            return $this->fetch();
        }
        [$where, $order, $limit, $with] = $this->buildparams();
        $list = $this->model
            ->where(function ($query){
                if(!$this->auth->isSuperAdmin()){
                    $query->whereIn('admin_id',$this->getChildrenAdminIds());
                }
            })
            ->order($order)
            ->paginate($limit);
        $result = ['total' => $list->total(), 'rows' => $list->items()];
        return json($result);
    }

    #[Route('POST','del')]
    public function del()
    {
        $adminids=$this->getChildrenAdminIds();
        $ids = $this->request->post('ids');
        foreach ($ids as $id){
            if(!in_array($id,$adminids)){
                $this->error(__('没有权限'));
            }
        }
        if ($ids) {
            $this->model->whereIn('id', $ids)->delete();
        }
        $this->success();
    }

    #[Route('GET','detail')]
    public function detail($ids)
    {
        $row = $this->model->where(['id' => $ids])->find();
        $adminids=$this->getChildrenAdminIds();
        if(!in_array($row->admin_id,$adminids)){
            $this->error(__('没有权限'));
        }
        $row->content=htmlspecialchars_decode($row->content);
        $this->assign("row", $row);
        return $this->fetch();
    }

    private function getChildrenAdminIds()
    {
        $groupids=$this->auth->getChildrenGroupIds();
        $or=[];
        foreach ($groupids as $v){
            $or[]="FIND_IN_SET({$v},groupids)";
        }
        $where=implode(' or ',$or);
        $adminids=Admin::where($where)->column('id');
        return $adminids;
    }
}
