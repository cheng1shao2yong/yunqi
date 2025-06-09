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
use app\common\model\Admin;
use app\common\model\Qrcode;
use think\annotation\route\Route;
use think\captcha\facade\Captcha;
use think\facade\Session;

class Index extends Backend
{
    protected $noNeedLogin = ['login','captcha','qrcodeLogin'];
    protected $noNeedRight = ['index','logout','platform','changeTheme'];


    #[Route('GET','index')]
    public function index()
    {
        $referer=Session::pull('referer');
        if($referer){
            Session::save();
        }
        list($platform,$menulist, $selected, $referer) = $this->auth->getSidebar($referer);
        $this->assign('site',site_config('basic'));
        $this->assign('platform',$platform);
        $this->assign('menulist',$menulist);
        $this->assign('selected',$selected);
        $this->assign('referer',$referer);
        return $this->fetch('',[],false);
    }

    #[Route('POST','change-theme')]
    public function changeTheme()
    {
        $key=$this->request->post('key');
        $value=$this->request->post('value');
        if($value==='true'){
            $value=true;
        }
        if($value==='false'){
            $value=false;
        }
        $element_ui=Admin::where('id',$this->auth->id)->value('element_ui');
        if($element_ui){
            $element_ui=json_decode($element_ui,true);
        }else{
            $element_ui=[];
        }
        $element_ui[$key]=$value;
        $element_ui=json_encode($element_ui);
        Admin::update(['element_ui'=>$element_ui],['id'=>$this->auth->id]);
        Session::set('admin.element_ui',$element_ui);
        Session::save();
        $this->success();
    }

    #[Route('GET','captcha')]
    public function captcha()
    {
        return Captcha::create();
    }

    #[Route('GET','platform')]
    public function platform()
    {
        $id=$this->request->get('id');
        Session::set('admin.platform_id',$id);
        Session::save();
        $this->success();
    }

    #[Route('GET','qrcodeLogin')]
    public function qrcodeLogin()
    {
        $token=$this->request->get('token');
        $admin_id=$this->request->get('admin_id');
        $adminlist=[];
        if($this->auth->loginByThird($token,$admin_id,$adminlist)){
            $this->success(__('登陆成功'));
        }
        $this->error('',$adminlist);
    }

    #[Route('POST,GET','login')]
    public function login()
    {
        if(!$this->request->isPost()){
            if($this->auth->isLogin()){
                $alis=get_module_alis();
                return redirect(request()->domain().'/'.$alis.'/index');
            }
            $thirdLogin=addons_installed('uniapp') && site_config("uniapp.scan_login");
            if($thirdLogin){
                $config=[
                    'appid'=>site_config("uniapp.mpapp_id"),
                    'appsecret'=>site_config("uniapp.mpapp_secret"),
                ];
                $qrcode=Qrcode::createQrcode(Qrcode::TYPE('管理员扫码登录'),token(),5*60);
                $wechat=new \WeChat\Qrcode($config);
                $ticket = $wechat->create($qrcode->id)['ticket'];
                $url=$wechat->url($ticket);
                $this->assign('qrcode',$url);
            }
            $this->assign('thirdLogin',$thirdLogin);
            $this->assign('logo',site_config("basic.logo"));
            $this->assign('sitename',site_config("basic.sitename"));
            $this->assign('login_captcha',config('yunqi.login_captcha'));
            return $this->fetch();
        }
        $username = $this->request->post('username');
        $password = $this->request->post('password');
        $captcha = $this->request->post('captcha');
        if(config('yunqi.login_captcha') && !captcha_check($captcha)){
            $this->error(__('验证码错误'),0);
        }
        try{
            $this->auth->login($username,$password);
            Session::delete('captcha');
            Session::save();
        }catch (\Exception $e){
            $this->error($e->getMessage(),1);
        }
        $this->success(__('登陆成功'));
    }

    #[Route('GET','logout')]
    public function logout()
    {
        $alis=get_module_alis();
        $this->auth->logout();
        $url=request()->domain().'/'.$alis.'/login';
        return redirect($url);
    }
}
