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
use app\common\model\Attachment as AttaModel;
use think\annotation\route\Group;
use think\annotation\route\Route;
use think\facade\Cache;
use think\facade\Db;
use app\common\model\Config;

/**
 * 附件管理
 */
#[Group("general/attachment")]
class Attachment extends Backend
{
    protected $noNeedRight=['select'];

    use Actions{
        add as private _add;
        del as private _del;
    }
    public function _initialize()
    {
        parent::_initialize();
        $this->model=new AttaModel();
        $this->assign('categoryList',AttaModel::getCategory());
        $this->assign('disksList',AttaModel::getDisksType());
    }

    #[Route("GET","select")]
    public function select()
    {
        if($this->request->isAjax()){
            $limit=[
                'page'  => $this->request->get('page/d',1),
                'list_rows' => 17
            ];
            $list = $this->model->where(function($query){
                $category=$this->request->param('category');
                $keywords=$this->request->param('keywords');
                $query->where('is_image',1);
                if($category && $category=='unclassed'){
                    $query->where('category="" or category is null');
                }
                if($category && $category!='all' && $category!='unclassed'){
                    $query->where('category',$category);
                }
                if($keywords){
                    $query->where('filename','like',"%{$keywords}%");
                }
            })->order('weigh desc,id desc')->paginate($limit);
            $result = ['total' => $list->total(), 'rows' => $list->items()];
            $this->success('',$result);
        }
        $this->assign('limit', $this->request->get('limit',5));
        return $this->fetch();
    }

    #[Route("POST,GET","add")]
    public function add()
    {
        if($this->request->isPost()){
            $this->success();
        }
        return $this->_add();
    }

    #[Route("POST","setcate")]
    public function setcate()
    {
        $type=$this->request->post('type');
        $key=$this->request->post('key');
        $value=$this->request->post('value');
        $cateconfig=Config::where(['group'=>'dictionary','name'=>'filegroup'])->find();
        $arr=$cateconfig->value;
        if($type=='add' && isset($arr[$key])){
            $this->error('分类已存在');
        }
        $message='';
        if($type=='add') {
            $arr[$key] = $value;
            $message = '添加成功';
        }
        if($type=='edit') {
            $arr[$key] = $value;
            $message = '修改成功';
        }
        if($type=='del') {
            unset($arr[$key]);
            AttaModel::where('category',$key)->update(['category'=>'']);
            $message = '删除成功';
        }
        $cateconfig->value=json_encode($arr,JSON_UNESCAPED_UNICODE);
        $cateconfig->save();
        Cache::delete('site_config_dictionary');
        $this->success($message,$arr);
    }

    #[Route("POST,GET","del")]
    public function del()
    {
        $ids = $this->request->param("ids");
        $list = $this->model->where('id', 'in', $ids)->select();
        $count = 0;
        Db::startTrans();
        try {
            foreach ($list as $item) {
                $classname=config('filesystem.disks')[$item->storage]['class'];
                $classname::deleteFile($item);
                $count += $item->delete();
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($count) {
            $this->success();
        }
        $this->error(__('没有记录被删除'));
    }
}
