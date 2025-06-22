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
use app\common\model\Department;
use think\annotation\route\Group;
use think\annotation\route\Route;

/**
 * 部门管理
 */
#[Group("auth/depart")]
class Depart extends Backend
{
    private $departdata;

    use Actions;

    public function _initialize()
    {
        parent::_initialize();
        $this->model=new Department();
        $this->departdata=Department::getDepartData();
        $this->assign('departdata',$this->departdata);
    }

    #[Route('GET,JSON','index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            return $this->fetch();
        }
        $result = ['total' => 1000, 'rows' =>$this->departdata];
        return json($result);
    }
}
