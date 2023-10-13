<?php
declare (strict_types = 1);

namespace app\api\controller;

use app\common\controller\Api;
use think\annotation\route\Get;
use think\annotation\route\Group;
use think\annotation\route\Post;

#[Group("index")]
class Index extends Api
{
    protected $noNeedLogin = ['*'];

    #[Get('testget')]
    public function testget()
    {
        $data=$this->request->get();
        $this->success('返回消息',$data);
    }

    #[Post('testpost')]
    public function testpost()
    {
        $data=$this->request->post();
        $this->success('返回消息',$data);
    }

    #[Get('list')]
    public function list()
    {
        $page=$this->request->get('page/d');
        //假装有29条数据
        $limit=0;
        if($page==1 || $page==2){
            $limit=10;
        }
        if($page==3){
            $limit=9;
        }
        if($page>3){
            $limit=0;
        }
        $res=[];
        for ($i=0;$i<$limit;$i++){
            $id=($page-1)*10+1+$i;
            $res[]=array(
                'id'=>$id,
                'title'=>'标题'.$id,
                'content'=>'内容'.$id
            );
        }
        $this->success('',$res);
    }
}
