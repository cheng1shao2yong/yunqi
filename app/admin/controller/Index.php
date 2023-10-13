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

namespace app\admin\controller;

use app\common\controller\Backend;
use think\annotation\route\Route;
use think\captcha\facade\Captcha;
use think\facade\Session;

class Index extends Backend
{
    protected $noNeedLogin = ['login','captcha'];
    protected $noNeedRight = ['index', 'logout'];

    #[Route('GET','index')]
    public function index()
    {
        $referer = session('referer');
        list($menulist, $selected, $referer) = $this->auth->getSidebar($referer);
        $this->assign('menulist',$menulist);
        $this->assign('selected',$selected);
        $this->assign('referer',$referer);
        return $this->fetch();
    }

    #[Route('GET','captcha')]
    public function captcha()
    {
        return Captcha::create();
    }

    #[Route('POST,GET','login')]
    public function login()
    {
        if(!$this->request->isPost()){
            if($this->auth->isLogin()){
                $alis=get_module_alis();
                return redirect(request()->domain().'/'.$alis.'/index');
            }
            $this->assign('logo',site_config("basic.logo"));
            $this->assign('sitename',site_config("basic.sitename"));
            $this->assign('login_captcha',config('yunqi.login_captcha'));
            $this->assign('referer',$this->request->get('referer',''));
            $this->assignJsFile('user/login.js');
            return $this->fetch();
        }
        $username = $this->request->post('username');
        $password = $this->request->post('password');
        $captcha = $this->request->post('captcha');
        if(!captcha_check($captcha)){
            $this->error(__('验证码错误'),0);
        }
        try{
            Session::delete('captcha');
            Session::save();
            $this->auth->login($username,$password);
        }catch (\Exception $e){
            $this->error($e->getMessage(),1);
        }
        $this->success(__('登陆成功'));
    }

    #[Route('GET','logout')]
    public function logout()
    {
        $this->auth->logout();
        $alis=get_module_alis();
        return redirect(request()->domain().'/'.$alis.'/login');
    }
}
