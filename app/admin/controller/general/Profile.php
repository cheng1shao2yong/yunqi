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

namespace app\admin\controller\general;

use app\common\model\Admin;
use app\common\controller\Backend;
use app\common\model\AdminLog;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Session;
use think\facade\Validate;

/**
 * 个人信息
 */
#[Group("general/profile")]
class Profile extends Backend
{
    protected $noNeedRight='*';

    protected $relationField=[];

    public function _initialize()
    {
        parent::_initialize();
        $this->model=new AdminLog();
    }

    /**
     * 查看
     */
    #[Route("*",'index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            $thirdLogin=addons_installed('uniapp') && site_config("uniapp.scan_login");
            $field='id,username,nickname,mobile,avatar';
            if($thirdLogin){
                $field.=',third_id';
            }
            $this->assign('thirdLogin',$thirdLogin);
            $this->assign('admininfo',Admin::field($field)->find($this->auth->id));
            return $this->fetch();
        }
        $where=[];
        if(!$this->auth->isSuperAdmin()){
            $where[]=['admin_id','=',$this->auth->id];
        }
        [$where, $order, $limit, $with] = $this->buildparams($where);
        $list = $this->model
            ->where($where)
            ->order($order)
            ->paginate($limit);
        $result = ['total' => $list->total(), 'rows' => $list->items()];
        return json($result);
    }

    /**
     * 更新个人信息
     */
    #[Route("POST",'update')]
    public function update()
    {
        $params = $this->request->post("row/a");
        if(!empty($params['password'])){
            if (!Validate::is($params['password'], '\S{6,30}')) {
                $this->error(__('密码长度不对！'));
            }
            $params['salt'] = str_rand(4);
            $params['password'] = md5(md5($params['password']) . $params['salt']);
        }else{
            unset($params['password']);
        }
        $admin=Admin::find($this->auth->id);
        $admin->save($params);
        Session::set('admin.mobile',$params['mobile']);
        Session::set('admin.nickname',$params['nickname']);
        Session::set('admin.avatar',$params['avatar']);
        Session::save();
        $this->success();
    }
}
