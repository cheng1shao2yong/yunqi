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
namespace app\admin\controller;

use app\admin\service\addons\AddonsService;
use app\common\controller\Backend;
use app\common\library\QRcode;
use app\common\model\Config;
use think\annotation\route\Group;
use think\annotation\route\Route;
use app\common\model\Addons as AddonsModel;
use think\facade\Db;
use think\facade\Cache;

#[Group("addons")]
class Addons extends Backend
{
    protected $noNeedRight = ['*'];

    /* @var AddonsService $service*/
    private $service;

    protected function _initialize()
    {
        parent::_initialize();
        if(!$this->auth->isSuperAdmin()){
            $this->error(__('超级管理员才能访问'));
        }
        $this->service=AddonsService::newInstance();
    }

    #[Route('GET,JSON','index')]
    public function index()
    {
        if($this->request->isAjax()){
            $type=$this->filter('type');
            $plain=$this->filter('plain');
            $page=$this->request->post('page/d',1);
            $limit=$this->request->post('limit/d',10);
            $keywords=$this->request->post('searchValue/s');
            try {
                if($plain=='local'){
                    $where=[];
                    if($type){
                        $where[]=['type','=',$type];
                    }
                    if($plain=='free'){
                        $where[]=['price','=',0];
                    }
                    if($plain=='not-free'){
                        $where[]=['price','>',0];
                    }
                    if($keywords){
                        $where[]=['name|key','like','%'.$keywords.'%'];
                    }
                    $fields='id,key,pack,type,name,description,author,document,price,version,open,install';
                    $result=AddonsModel::list($page,$limit,$fields,$where);
                    foreach ($result['rows'] as $key=>$value){
                        $result['rows'][$key]['download']=0;
                        $result['rows'][$key]['packed']=0;
                        $result['rows'][$key]['local']=1;
                        //判断目录是否存在
                        if(is_dir($this->service->getAddonsPath($value['type'],$value['pack']))){
                            $result['rows'][$key]['download']=1;
                        }
                        if(file_exists($this->service->getAddonsPack($value['type'],$value['pack'],$value['version']))){
                            $result['rows'][$key]['packed']=1;
                        }
                    }
                }else{
                    //远程获取的扩展
                    $result=$this->service->getAddons($page,$type,$plain,$limit,$keywords);
                    $where=[];
                    if($type){
                        $where[]=['type','=',$type];
                    }
                    $local=AddonsModel::list(1,1000,'id,pack,key,open,install',$where);
                    //对比远程扩展和本地扩展
                    foreach ($result['rows'] as $key=>$value){
                        $result['rows'][$key]['open']=0;
                        $result['rows'][$key]['install']=0;
                        $result['rows'][$key]['download']=0;
                        $result['rows'][$key]['packed']=0;
                        $result['rows'][$key]['local']=0;
                        foreach ($local['rows'] as $v){
                            if($value['key']==$v['key']){
                                $result['rows'][$key]['id']=$v['id'];
                                $result['rows'][$key]['local']=1;
                                $result['rows'][$key]['open']=$v['open'];
                                $result['rows'][$key]['install']=$v['install'];
                                //判断目录是否存在
                                if(is_dir($this->service->getAddonsPath($value['type'],$v['pack']))){
                                    $result['rows'][$key]['download']=1;
                                }
                                if(file_exists($this->service->getAddonsPack($value['type'],$v['pack'],$value['version']))){
                                    $result['rows'][$key]['packed']=1;
                                }
                            }
                        }
                    }
                }
                return json($result);
            }catch (\Exception $e){
                $this->error($e->getMessage());
            }
        }
        $this->assign('type',AddonsModel::TYPE);
        $this->assign('plugins_host',config('yunqi.plugins_host'));
        return $this->fetch();
    }

    #[Route('POST','multi')]
    public function multi()
    {
        $ids = $this->request->param('ids');
        $field = $this->request->param('field');
        $value = $this->request->param('value');
        if($field=='open'){
            $addon=AddonsModel::find($ids);
            if(!AddonsModel::checkKey($addon)){
                //禁止修改、删除，否则后果自负
                $this->error('不是你的扩展，无法操作');
            }
            $packfile=$this->service->getAddonsPack($addon['type'],$addon['pack'],$addon['version']);
            if($value && !is_file($packfile)){
                $this->error('扩展未打包，请先打包');
            }
            $addon->open=$value;
            $addon->save();
        }
        $this->success();
    }

    #[Route('GET,POST','create')]
    public function create()
    {
        if($this->request->isPost()){
            $param=$this->request->post('row/a');
            try{
                $param['version']=(string)$param['version'];
                if(intval($param['version'])<1000){
                    $param['version']=implode('.',str_split($param['version']));
                }else{
                    $param['version']=substr($param['version'],0,2).'.'.substr($param['version'],2,1).'.'.substr($param['version'],3,1);
                }
                $this->service->create($param);
                Cache::set('download-addons','');
            }catch (\Exception $e){
                $this->error($e->getMessage());
            }
            $this->success('创建成功');
        }
        $this->assign('type',AddonsModel::TYPE);
        $dbname=config('database.connections.mysql.database');
        $tableList =Db::query("SELECT `TABLE_NAME` AS `name` FROM `information_schema`.`TABLES` where `TABLE_SCHEMA` = '{$dbname}';");
        $this->assign('table',array_map(function ($item){
            return $item['name'];
        },$tableList));
        $config=Config::where('can_delete',1)->column('id,name,title','id');
        $this->assign('sonfig',$config);
        return $this->fetch();
    }

    #[Route('POST','pack')]
    public function pack()
    {
        $key=$this->request->post('key');
        try{
            $this->service->package($key);
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('打包成功');
    }

    #[Route('GET','checkTransactionId')]
    public function checkTransactionId()
    {
        $pack=$this->request->get('pack');
        $transaction_id=$this->request->get('transaction_id');
        try{
            $result=$this->service->checkTransactionId($pack,$transaction_id);
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('',$result);
    }

    #[Route('POST','install')]
    public function install()
    {
        $key=$this->request->post('key');
        try{
            $this->service->install($key);
            Cache::set('download-addons','');
            Cache::delete('admin_rule_list');
            Cache::delete('admin_menu_list');
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('安装成功');
    }

    #[Route('GET','payCode')]
    public function payCode()
    {
        $key=$this->request->get('key');
        $out_trade_no=$this->request->get('out_trade_no');
        try{
            $code_url=$this->service->payCode($key,$out_trade_no);
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $errorCorrectionLevel = 'L';  //容错级别
        $matrixPointSize = 10;//生成图片大小
        QRcode::png($code_url,false, $errorCorrectionLevel, $matrixPointSize, 2);
        exit;
    }

    #[Route('GET,POST','uninstall')]
    public function uninstall()
    {
        if($this->request->isGet()){
            $key=$this->request->get('key');
            [$addon,$menu,$config,$tables]=$this->service->getAddonsInstallInfo($key);
            $this->assign('addon',$addon);
            $this->assign('menu',$menu);
            $this->assign('conf',$config);
            $this->assign('tables',$tables);
            return $this->fetch();
        }
        if($this->request->isPost()){
            $key=$this->request->post('key');
            $actions=$this->request->post('actions',[]);
            try{
                $this->service->uninstall($key,$actions);
                Cache::set('download-addons','');
                Cache::delete('admin_rule_list');
                Cache::delete('admin_menu_list');
            }catch (\Exception $e){
                $this->error($e->getMessage());
            }
            $this->success('卸载成功');
        }
    }

    #[Route('POST','download')]
    public function download()
    {
        $postdata=$this->request->post();
        try{
            $this->service->download($postdata);
            Cache::set('download-addons','');
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('下载成功');
    }

    #[Route('POST','del')]
    public function del()
    {
        $key=$this->request->post('key');
        try{
            $this->service->delAddons($key);
            Cache::set('download-addons','');
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('删除成功');
    }

    #[Route('GET','checkPayStatus')]
    public function checkPayStatus()
    {
        $out_trade_no=$this->request->get('out_trade_no');
        $key=$this->request->get('key');
        try{
            $r=$this->service->checkPayStatus($key,$out_trade_no);
        }catch (\Exception $e){
            $this->error($e->getMessage());
        }
        $this->success('',$r);
    }

}