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
use app\common\library\Http;
use think\annotation\route\Group;
use think\annotation\route\Route;

#[Group("qqmap")]
class Qqmap extends Backend {

    protected $noNeedRight = ['*'];

    #[Route('GET','key')]
    public function key()
    {
        $qqmap_key=site_config("addons.qqmap_key");
        $this->success('',$qqmap_key);
    }

    #[Route('GET','search')]
    public function search()
    {
        $keywords=$this->request->get('keywords');
        $qqmap_key=site_config("addons.qqmap_key");
        $url="https://apis.map.qq.com/ws/place/v1/suggestion/?keyword={$keywords}&key={$qqmap_key}";
        $response=Http::get($url);
        $r=$response->content;
        if(isset($r['data']) && count($r['data'])>0){
            $this->success('',$r['data']);
        }
        $this->success();
    }
}