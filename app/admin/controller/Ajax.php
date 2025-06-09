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

use app\admin\service\AdminUploadService;
use app\common\controller\Backend;
use app\common\library\Tree;
use app\common\model\Attachment;
use app\common\model\QrcodeScan;
use app\common\model\Third;
use app\common\model\Qrcode;
use app\common\model\Category;
use app\common\service\msg\BackendMsg;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Cache;
use think\facade\Config;
use think\Response;

#[Group("ajax")]
class Ajax extends Backend{

    protected $noNeedRight = ['*'];
    protected $noNeedLogin = ['js'];
    /**
     *上传文件
     */
    #[Route('POST','upload')]
    public function upload()
    {
        $disks=$this->request->post('disks');
        if(!$disks){
            $disks=$this->config['upload']['disks'];
        }
        $category=$this->request->post('category');
        $catelist=site_config('dictionary.filegroup');
        if(!key_exists($category,$catelist)){
            $category='';
        }
        $file = $this->request->file('file');
        $classname=config('filesystem.disks')[$disks]['class'];
        $name=config('filesystem.disks')[$disks]['name'];
        if(!class_exists($classname)){
            $this->error($name.'扩展未安装，请先下载');
        }
        try{
            $savename=$classname::newInstance([
                'config'=>config('yunqi.upload'),
                'admin_id'=>$this->auth->id,
                'category'=>$category,
                'file'=>$file
            ])->save();
        }catch (\Exception $e){
            $this->error(__('上传文件出错'),[
                'file'=>$e->getFile(),
                'line'=>$e->getLine(),
                'msg'=>$e->getMessage()
            ]);
        }
        $this->success('',$savename);
    }

    /**
     *读取私有文件
     */
    #[Route('GET','readfile')]
    public function readfile(string $sha1='')
    {
        $attachment=Attachment::where("sha1",$sha1)->find();
        $filepath=root_path().$attachment['url'];
        $myfile = fopen($filepath, "r");
        $filecontent=fread($myfile,filesize($filepath));
        fclose($myfile);
        $ext = pathinfo($filepath, PATHINFO_EXTENSION);
        if(
            $ext=='jpg'  ||
            $ext=='JPG'  ||
            $ext=='png'  ||
            $ext=='PNG'  ||
            $ext=='jpeg' ||
            $ext=='JPEG' ||
            $ext=='gif'  ||
            $ext=='GIF'  ||
            $ext=='bmp'  ||
            $ext=='BMP'
        ){
            header('Content-type:image/'.$ext);
            echo $filecontent;
            exit();
        }
        $filename = pathinfo($filepath, PATHINFO_FILENAME);
        Header ( "Content-type: application/octet-stream");
        Header ( "Accept-Ranges: bytes" );
        Header ( "Accept-Length: ".filesize ($filepath));
        Header ( "Content-Disposition: attachment; filename=".$filename.".".$ext);
        echo $filecontent;
        exit();
    }
    /**
     * 模拟读取通知消息，需要开发者完善动态效果
     */
    #[Route('GET,POST','message')]
    public function message()
    {
        $msgService=BackendMsg::newInstance(['msg_type'=>'backend']);
        //阅读消息
        if($this->request->isPost()){
            $ids=$this->request->post('ids/a');
            $msgService->read($ids);
            $this->success();
        }
        //获取消息
        if($this->request->isGet()){
            $message=$msgService->list($this->auth->id,1,100,false);
            if(empty($message)){
                $this->success('',array([
                    'title'=>__('通知消息'),
                    'list'=>[]
                ]));
            }
            $r=[];
            foreach ($message as $value){
                 $hastitle=false;
                 foreach ($r as $xs){
                     if($xs['title']==$value['title']){
                         $hastitle=true;
                     }
                 }
                 if(!$hastitle){
                     $r[]=[
                         'title'=>$value['title'],
                         'list'=>[]
                     ];
                 }
            }
            foreach ($message as $value){
                foreach ($r as $key=>$xs){
                    if($xs['title']==$value['title']){
                        $r[$key]['list'][]=$value;
                    }
                }
            }
            $this->success('',$r);
        }
    }
    /**
     * 清空系统缓存
     */
    #[Route('GET','wipecache')]
    public function wipecache()
    {
        try {
            $type = $this->request->request("type");
            switch ($type) {
                case 'all':
                    // no break
                case 'content':
                    //内容缓存
                    Cache::clear();
                    if ($type == 'content') {
                        break;
                    }
                case 'template':
                    // 模板缓存
                    $list=scandir(root_path().'app'.DS);
                    foreach ($list as $file){
                        if(!is_dir($file)){
                            continue;
                        }
                        if($file=='common'){
                            continue;
                        }
                        $temp=root_path().'runtime'.DS.$file.DS.'temp';
                        if(is_dir($temp)){
                            rmdirs($temp, false);
                        }
                    }
                    if ($type == 'template') {
                        break;
                    }
                case 'browser':
                    // 浏览器缓存
                    if ($type == 'browser') {
                        break;
                    }
            }
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
        $this->success();
    }
    /**
     * 获取分类
     */
    #[Route('GET','category')]
    public function category()
    {
        $type = $this->request->get('type', '');
        $pid = $this->request->get('pid', 0);
        $where = ['status' => 'normal'];
        if ($type) {
            $where['type'] = $type;
        }
        $categorylist = Category::where($where)->field('id,pid,name')->order('weigh desc,id desc')->select()->toArray();
        $r=Tree::instance()->init($categorylist)->getTreeArray($pid);
        $this->success('',$r);
    }

    /**
     * 获取地区
     */
    #[Route('GET','area')]
    public function area()
    {
        if(!addons_installed('area')){
            $this->error('请先安装插件area');
        }
        $pid = $this->request->get("pid");
        $provincelist = \app\common\model\Area::where('pid',$pid)->field('id,name')->select();
        $this->success('', $provincelist);
    }

    /**
     * 获取js文件
     */
    #[Route('GET','js/:name')]
    public function js($name)
    {
        $header = ['Content-Type' => 'application/javascript'];
        if (!Config::get('app.app_debug')) {
            $offset = 30 * 60 * 60 * 24; // 缓存一个月
            $header['Cache-Control'] = 'public';
            $header['Pragma'] = 'cache';
            $header['Expires'] = gmdate("D, d M Y H:i:s", time() + $offset) . " GMT";
        }
        // 页面缓存
        ob_start();
        ob_implicit_flush(false);
        require(root_path().'runtime'.DS.'admin'.DS.'temp'.DS.$name.'-js.php');
        // 获取并清空缓存
        $content = ob_get_clean();
        $response = Response::create(trim($content))->header($header);
        $response->send();
        exit;
    }

    //绑定第三方账号
    #[Route('GET,JSON','third/:action')]
    public function third($action)
    {
        if($action=='qrcode'){
            $platform=$this->request->get('platform');
            $foreign_key=$this->request->get('foreign_key');
            if($platform=='mpapp'){
                $config=[
                    'appid'=>site_config("uniapp.mpapp_id"),
                    'appsecret'=>site_config("uniapp.mpapp_secret"),
                ];
                $qrcode=Qrcode::createQrcode(Qrcode::TYPE('绑定第三方账号'),$foreign_key,5*60);
                $wechat=new \WeChat\Qrcode($config);
                $ticket = $wechat->create($qrcode->id)['ticket'];
                $url=$wechat->url($ticket);
                $content=file_get_contents($url);
                header('Content-Type: image/png');
                echo $content;
                exit;
            }
        }
        if($action=='check'){
            $platform=$this->request->get('platform');
            $foreign_key=$this->request->get('foreign_key');
            $scan=QrcodeScan::where('foreign_key',$foreign_key)->find();
            if($scan){
                $third=Third::where(['openid'=>$scan->openid,'platform'=>$platform])->find();
                if($third){
                    $this->success('',$third);
                }
            }
            $this->error();
        }
        if($action=='selectpage'){
            $platform=$this->request->get('platform');
            $this->model=new Third();
            $where=[];
            $where[]=['platform','=',$platform];
            return $this->selectpage($where);
        }
    }
}