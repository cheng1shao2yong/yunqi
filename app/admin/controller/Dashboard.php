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

use app\common\model\Admin;
use app\common\model\User;
use app\common\model\Category;
use app\common\model\Attachment;
use app\common\library\Date;
use app\common\controller\Backend;
use think\annotation\route\Route;
use think\facade\Db;

/**
 * 控制台
 */
class Dashboard extends Backend
{
    public function _initialize()
    {
        parent::_initialize();
    }
    /**
     * 查看
     */
    #[Route('GET','dashboard/index')]
    public function index()
    {
        if($this->request->isAjax()){
            //模拟数据面板
            $panel=[
                rand(100,1000),
                rand(100,1000),
                rand(100,1000),
                rand(100,1000),
            ];
            //模拟折线图
            $line=[
                'date'=>[],
                'data'=>[]
            ];
            $time=time();
            for($i=0;$i<7;$i++){
                $line['date'][]=date('Y-m-d',$time-(7-$i)*24*3600);
                $line['data'][]=rand(100,1000);
            }
            //模拟表格
            $names=['张三','李四','老王','老成','黑娃'];
            $table=[];
            $total=rand(100,999);
            foreach ($names as $key=>$name){
                $table[]=[
                    'sort'=>$key+1,'name'=>$name,'total'=>$total,'money'=>$total*rand(10,20)
                ];
                $total-=rand(10,99);
            }
            //模拟柱状图
            $bar=[
                'date'=>['周一','周二','周三','周四','周五','周六','周日'],
                'name'=>['张三','李四','老王'],
                'data'=>[
                    [],
                    [],
                    []
                ]
            ];
            for($i=0;$i<3;$i++){
                foreach ($bar['date'] as $name){
                    $bar['data'][$i][]=rand(100,999);
                }
            }
            //模拟饼状图
            $pie=[
                ['name'=>'张三','value'=>rand(100,999)],
                ['name'=>'李四','value'=>rand(100,999)],
                ['name'=>'老王','value'=>rand(100,999)],
                ['name'=>'黑娃','value'=>rand(100,999)],
            ];
            //模拟订单
            $count=rand(100,999);
            $today=rand(1000,9999);
            $yestoday=rand(1000,9999);
            $order=[
                'count'=>$count,
                'total'=>1000,
                'today'=>$today.'.'.rand(10,99),
                'yestoday'=>$yestoday.'.'.rand(10,99),
                'percentage'=>[
                    round($count/10),
                    $yestoday>$today?round($today/$yestoday*100):100,
                ]
            ];
            $this->success('',compact('panel','line','table','bar','pie','order'));
        }
        return $this->fetch();
    }
}
