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

namespace app\admin\controller\general;

use app\admin\traits\Actions;
use app\common\controller\Backend;
use app\common\library\Tree;
use think\annotation\route\Group;
use app\common\model\Category as CategoryModel;
use think\annotation\route\Route;

/**
 * 分类管理
 */
#[Group("general/category")]
class Category extends Backend
{
    protected $noNeedRight = ['selectpage'];

    private $categorylist = [];

    use Actions{
        index as private _index;
        edit as private _edit;
        add as private _add;
    }

    protected function _initialize()
    {
        parent::_initialize();
        $this->model = new CategoryModel();
        $this->assign('typeList',site_config("dictionary.categorytype"));
    }

    #[Route("*","index")]
    public function index()
    {
        if($this->request->isAjax()){
            $result = ['total' => 1000, 'rows' => $this->getCatelist()];
            return json($result);
        }
        return $this->_index();
    }

    #[Route("POST,GET","add")]
    public function add()
    {
        if(!$this->request->isPost()){
            $catelist=$this->getCatelist();
            foreach ($catelist as $k => $v) {
                $categorydata[$v['id']] = $v;
            }
            $this->assign('parentList',$categorydata);
        }
        return $this->_add();
    }

    #[Route("POST,GET","edit")]
    public function edit()
    {
        if(!$this->request->isPost()){
            $catelist=$this->getCatelist();
            foreach ($catelist as $k => $v) {
                $categorydata[$v['id']] = $v;
            }
            $this->assign('parentList',$categorydata);
        }
        return $this->_edit();
    }

    private function getCatelist()
    {
        $tree = Tree::instance();
        $list=$this->model->order('weigh desc,id desc')->where(function ($query){
            $type = $this->filter("type");
            if($type){
                $query->where('type',$type);
            }
        })->select()->toArray();
        $tree->init($list, 'pid');
        $categorylist = $tree->getTreeList($tree->getTreeArray(0), 'name');
        return $categorylist;
    }
}
