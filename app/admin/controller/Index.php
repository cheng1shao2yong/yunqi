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
use app\common\model\QrcodeScan;
use app\common\model\Third;
use think\annotation\route\Route;
use think\captcha\facade\Captcha;
use think\facade\Session;

class Index extends Backend
{
    protected $noNeedLogin = ['login','captcha','qrcodeLogin'];
    protected $noNeedRight = ['index', 'logout'];

    #[Route('GET','index')]
    public function index()
    {
        $referer = session('referer');
        list($menulist, $selected, $referer) = $this->auth->getSidebar($referer);
        $this->assign('menulist',$menulist);
        $this->assign('selected',$selected);
        $this->assign('referer',$referer);
        return $this->fetch('',[],false);
    }

    #[Route('GET','captcha')]
    public function captcha()
    {
        return Captcha::create();
    }

    #[Route('GET','qrcodeLogin')]
    public function qrcodeLogin()
    {
        $token=$this->request->get('token');
        if($this->auth->loginByThird($token)){
            $this->success(__('登陆成功'));
        }
        $this->error();
    }

    #[Route('POST,GET','login')]
    public function login()
    {
        if(!$this->request->isPost()){
            if($this->auth->isLogin()){
                $alis=get_module_alis();
                return redirect(request()->domain().'/'.$alis.'/index');
            }
            $thirdLogin=addons_installed('uniapp') && site_config("addons.uniapp_scan_login");
            if($thirdLogin){
                $config=[
                    'appid'=>site_config("addons.uniapp_mpapp_id"),
                    'appsecret'=>site_config("addons.uniapp_mpapp_secret"),
                ];
                $qrcode=new Qrcode();
                $qrcode->type='backend-login';
                $qrcode->foreign_key=token();
                $qrcode->save();
                $wechat=new \WeChat\Qrcode($config);
                $ticket = $wechat->create($qrcode->id)['ticket'];
                $url=$wechat->url($ticket);
                $this->assign('qrcode',$url);
            }
            $this->assign('thirdLogin',$thirdLogin);
            $this->assign('logo',site_config("basic.logo"));
            $this->assign('sitename',site_config("basic.sitename"));
            $this->assign('login_captcha',config('yunqi.login_captcha'));
            $this->assign('referer',$this->request->get('referer',''));
            return $this->fetch();
        }
        $username = $this->request->post('username');
        $password = $this->request->post('password');
        $captcha = $this->request->post('captcha');
        if(config('yunqi.login_captcha') && !captcha_check($captcha)){
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
