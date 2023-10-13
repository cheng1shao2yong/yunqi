<?php
declare (strict_types = 1);

namespace app\admin\controller\demo;

use app\common\controller\Backend;
use app\admin\traits\Actions;
use think\annotation\route\Group;
use think\annotation\route\Route;
use app\common\model\Demo as DemoModel;

#[Group("demo/form")]
class Form extends Backend
{
    use Actions{
        add as private _add;
        edit as private _edit;
    }

    protected function _initialize()
    {
        parent::_initialize();
        $this->model = new DemoModel();
        $this->assign('education',DemoModel::EDUCATION);
    }

    //添加，如果省略这个方法，会调用trait的add方法
    #[Route("GET,POST","add")]
    public function add()
    {
        if($this->request->isPost()){
            $education=$this->request->post('row.education');
            //可以通过DemoModel::EDUCATION('值')来读取键
            if($education==DemoModel::EDUCATION('小学')){
                //可以通过$this->postParams来修改值
                $this->postParams['education']=DemoModel::EDUCATION('高中');
                //也可以通过$this->postParams来追加值
                $this->postParams['append']='追加的值';
            }
            //可以通过回调函数来操作添加完成后的操作，该操作在事务中，所以也能回滚添加操作
            $this->callback=function ($rows){
                if($rows->user_id==1){
                    $this->error('用户老成已经被添加过了');
                }
            };
        }
        return $this->_add();
    }

    //修改，因为没有什么操作，所以下面这个方法可以省略，系统会调用trait的edit方法
    #[Route("GET,POST","edit")]
    public function edit()
    {
        return $this->_edit();
    }

    //自定义name
    #[Route("POST","setname")]
    public function setname()
    {
        $test1 = $this->request->post('row.test1');
        $test2 = $this->request->post('test2');
        $this->success('留意POST的参数==='.$test1.'==='.$test2);
    }

    //追加表单项
    #[Route("POST","appendname")]
    public function appendname()
    {
        $test1 = $this->request->post('row.test1');
        $test2 = $this->request->post('row.test2');
        $test3 = $this->request->post('row.test3');
        $this->success($test1.'==='.$test2.'==='.$test3);
    }
}
