<?php
declare (strict_types = 1);

namespace app\admin\controller\demo;

use app\common\controller\Backend;
use app\admin\traits\Actions;
use think\annotation\route\Group;
use think\annotation\route\Route;
use app\common\model\Demo as DemoModel;

#[Group("demo/table")]
class Table extends Backend
{
    use Actions{
        index as private _index;
        del as private _del;
        multi as private _multi;
        import as private _import;
        download as private _download;
        recyclebin as private _recyclebin;
    }

    protected function _initialize()
    {
        parent::_initialize();
        $this->model = new DemoModel();
        $this->assign('education',DemoModel::EDUCATION);
    }

    //查看
    #[Route("GET,JSON","index")]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            return $this->fetch();
        }
        [$where, $order, $limit, $with] = $this->buildparams();
        $list = $this->model
            ->withJoin($with,'left')
            ->where($where)
            ->order($order)
            ->paginate($limit);
        $result = [
            'summary' => '自定义统计信息',
            'total' => $list->total(),
            'rows' => $list->items()
        ];
        return json($result);
    }

    //删除
    #[Route("GET,POST","del")]
    public function del()
    {
        //通过定义callback回调函数来执行删除后的操作
        $this->callback=function ($ids){};
        return $this->_del();
    }

    //更新
    #[Route("GET,POST","multi")]
    public function multi()
    {
        //通过定义callback回调函数来执行更新后的操作
        $this->callback=function ($ids,$field,$value){};
        return $this->_multi();
    }

    //导入
    #[Route("GET,POST","import")]
    public function import()
    {
        //通过定义callback回调函数来处理导入的数据
        $this->callback=function ($inserData){
            return $inserData;
        };
        return $this->_import();
    }

    //回收站
    #[Route("GET,POST,JSON","recyclebin")]
    public function recyclebin($action)
    {
        $this->recyclebinColumns=[
            "id"=>"ID",
            "title"=>"单行文本",
        ];
        $this->recyclebinColumnsType=[
            "id"=>"text",
            "title"=>"text",
        ];
        return $this->_recyclebin($action);
    }

    //下载
    #[Route("GET,POST","download")]
    public function download()
    {
        //通过定义callback回调函数来处理下载的数据
        $this->callback=function ($downloadData){
            return $downloadData;
        };
        return $this->_download();
    }
}
