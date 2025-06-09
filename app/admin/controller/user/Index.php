<?php
/**
 * ----------------------------------------------------------------------------
 * 行到水穷处，坐看云起时
 * 开发软件，找贵阳云起信息科技，官网地址:https://www.56q7.com/
 * ----------------------------------------------------------------------------
 * Author: 老成
 * email：85556713@qq.com
 */
declare (strict_types = 1);

namespace app\admin\controller\user;

use app\common\controller\Backend;
use think\annotation\route\Group;
use app\admin\traits\Actions;
use app\common\model\User;
use app\common\model\UserLog;
use think\annotation\route\Route;

#[Group("user/index")]
class Index extends Backend
{
    protected $noNeedRight = ['index'];

    use Actions;

    protected function _initialize()
    {
        parent::_initialize();
        $this->model = new User();
    }

    #[Route('POST,GET','recharge')]
    public function recharge($ids)
    {
        if($this->request->isPost()){
            $module_type=$this->request->post('row.module_type');
            $change_type=$this->request->post('row.recharge_type');
            $change=$this->request->post('row.change/d');
            $remark=$this->request->post('row.remark');
            $order_no=time().rand(1000,9999);
            switch ($module_type){
                case 'score':
                    UserLog::addScoreLog($ids,$change_type,$change,$order_no,$remark);
                    break;
                case 'balance':
                    UserLog::addBalanceLog($ids,$change_type,$change,$order_no,$remark);
                    break;
            }
            $this->success();
        }else{
            $user=User::find($ids);
            $this->assign('moduletype',UserLog::TYPE);
            $this->assign('user',$user);
            return $this->fetch();
        }
    }

    #[Route('GET','test')]
    public function test()
    {
        return $this->fetch();
    }

    #[Route('GET,JSON','detail')]
    public function detail($ids)
    {
        if($this->request->isAjax()){
            $this->model=new UserLog();
            $where=[];
            $where[]=['type','=',$this->request->get('type')];
            $where[]=['user_id','=',$ids];
            [$where, $order, $limit, $with] = $this->buildparams($where);
            $list = $this->model
                ->where($where)
                ->order($order)
                ->paginate($limit);
            $result = ['total' => $list->total(), 'rows' => $list->items()];
            return json($result);
        }else{
            $user=User::find($ids);
            $this->assign('moduletype',UserLog::TYPE);
            $this->assign('user',$user);
            return $this->fetch();
        }
    }
}

