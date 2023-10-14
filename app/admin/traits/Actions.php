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

namespace app\admin\traits;

use think\annotation\route\Route;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use think\facade\Db;
use app\common\library\Export;

trait Actions
{
    /**
     * 增删改查等操作成功后的回调方法
     * 请勿在回调函数内使用$this->error()方法，使用ThrowException抛出异常
     */
    protected $callback;
    /**
     * 添加插入时额外增加的字段
     * 支持add,edit
     */
    protected $postParams = [];

    /**
     * 回收站显示的字段
     */
    protected $recyclebinColumns=[
        'id'=>'ID'
    ];
    /**
     * 回收站显示的字段类型，支持text,image,images,date,datetime,tag,tags，默认为text
     */
    protected $recyclebinColumnsType=[];
    /**
     * 导入字段
     */
    protected $importFields=[];

    /**
     * 关联查询的字段
     * @var array
     */
    protected $relationField=[];

    /**
     * 查看
     */
    #[Route('GET,JSON','index')]
    public function index()
    {
        if (false === $this->request->isAjax()) {
            return $this->fetch();
        }
        if($this->request->post('selectpage')){
            return $this->selectpage();
        }
        [$where, $order, $limit, $with] = $this->buildparams();
        $list = $this->model
            ->withJoin($with,'left')
            //如果没有使用operate filter过滤的情况下,推荐使用with关联，可以提高查询效率
            //->with($with)
            ->where($where)
            ->order($order)
            ->paginate($limit);
        $result = ['total' => $list->total(), 'rows' => $list->items()];
        return json($result);
    }
    /**
     * 添加
     */
    #[Route('GET,POST','add')]
    public function add()
    {
        if (false === $this->request->isPost()) {
            return $this->fetch();
        }
        $params = array_merge($this->request->post("row/a"),$this->postParams);
        if (empty($params)) {
            $this->error(__('提交的参数不能为空'));
        }
        if(!$this->request->checkToken('__token__',['__token__'=>$this->request->post('__token__')])){
            $this->error(__('token错误，请刷新页面重试'));
        }
        foreach ($params as &$value){
            if(is_array($value)){
                $value=implode(',',$value);
            }
            if($value===''){
                $value=null;
            }
        }
        $result = false;
        Db::startTrans();
        try {
            $result = $this->model->save($params);
            if($this->callback){
                $callback=$this->callback;
                $callback($this->model);
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($result === false) {
            $this->error(__('没有新增任何数据'));
        }
        $this->success();
    }
    /**
     * 编辑
     */
    #[Route('GET,POST','edit')]
    public function edit(mixed $row=null)
    {
        $ids = $this->request->get('ids');
        if(!$row || is_array($row)){
            $row = $this->model->find($ids);
        }
        if (!$row) {
            $this->error(__('没有找到记录'));
        }
        if (false === $this->request->isPost()) {
            $this->assign('row', $row);
            return $this->fetch();
        }
        $params = array_merge($this->request->post("row/a"),$this->postParams);
        if (empty($params)) {
            $this->error(__('提交的参数不能为空'));
        }
        if(!$this->request->checkToken('__token__',['__token__'=>$this->request->post('__token__')])){
            $this->error(__('token错误，请刷新页面重试'));
        }
        foreach ($params as &$value){
            if(is_array($value)){
                $value=implode(',',$value);
            }
            if($value===''){
                $value=null;
            }
        }
        $result = false;
        Db::startTrans();
        try {
            $result = $row->save($params);
            if($this->callback){
                $callback=$this->callback;
                $callback($row);
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if (false === $result) {
            $this->error(__('没有数据被更新'));
        }
        $this->success();
    }
    /**
     * 删除
     */
    #[Route('GET,POST','del')]
    public function del()
    {
        $ids = $this->request->param("ids");
        if (empty($ids)) {
            $this->error(__('参数%s不能为空', ['s'=>'ids']));
        }
        $pk = $this->model->getPk();
        $list = $this->model->where($pk, 'in', $ids)->select();
        $count = 0;
        Db::startTrans();
        try {
            foreach ($list as $item) {
                $count += $item->delete();
            }
            if($this->callback){
                $callback=$this->callback;
                $callback($ids);
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
    /**
     * 批量更新一个字段
     */
    #[Route('POST,GET','multi')]
    public function multi()
    {
        $ids = $this->request->param('ids');
        $field = $this->request->param('field');
        $value = $this->request->param('value');
        if(!$ids){
            $this->error(__('没有需要更新的行'));
        }
        if(!$field){
            $this->error(__('没有需要更新的列'));
        }
        $ids=is_string($ids)?explode(',',$ids):$ids;
        $pk=$this->model->getPk();
        $count = 0;
        Db::startTrans();
        try {
            foreach ($ids as $id) {
                $id=intval($id);
                $r = $this->model->where($pk,$id)->update([$field=>$value]);
                if($r){
                    $count++;
                }
            }
            if($this->callback){
                $callback=$this->callback;
                $callback($ids,$field,$value);
            }
            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($count) {
            $this->success();
        }
        $this->error(__('没有数据被更新'));
    }
    /**
     * 导入
     */
    #[Route('GET,POST','import')]
    protected function import()
    {
        $file = $this->request->request('file');
        if (!$file) {
            $this->error(__('参数%s不能为空', ['s'=>'file']));
        }
        $filePath = root_path() . DS . $file;
        if (!is_file($filePath)) {
            $this->error(__('上传文件不存在'));
        }
        //实例化reader
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        if (!in_array($ext, ['csv', 'xls', 'xlsx'])) {
            $this->error(__('文件格式不正确'));
        }
        if ($ext === 'csv') {
            $file = fopen($filePath, 'r');
            $filePath = tempnam(sys_get_temp_dir(), 'import_csv');
            $fp = fopen($filePath, 'w');
            $n = 0;
            while ($line = fgets($file)) {
                $line = rtrim($line, "\n\r\0");
                $encoding = mb_detect_encoding($line, ['utf-8', 'gbk', 'latin1', 'big5']);
                if ($encoding !== 'utf-8') {
                    $line = mb_convert_encoding($line, 'utf-8', $encoding);
                }
                if ($n == 0 || preg_match('/^".*"$/', $line)) {
                    fwrite($fp, $line . "\n");
                } else {
                    fwrite($fp, '"' . str_replace(['"', ','], ['""', '","'], $line) . "\"\n");
                }
                $n++;
            }
            fclose($file) || fclose($fp);
            $reader = new Csv();
        } elseif ($ext === 'xls') {
            $reader = new Xls();
        } else {
            $reader = new Xlsx();
        }
        $fieldArr = array_flip($this->importFields);
        if(empty($fieldArr)){
            $this->error(__('导入字段不能为空'));
        }
        //加载文件
        $insert = [];
        try {
            if (!$PHPExcel = $reader->load($filePath)) {
                $this->error(__('未知文件格式'));
            }
            $currentSheet = $PHPExcel->getSheet(0);  //读取文件中的第一个工作表
            $allColumn = $currentSheet->getHighestDataColumn(); //取得最大的列号
            $allRow = $currentSheet->getHighestRow(); //取得一共有多少行
            $maxColumnNumber = Coordinate::columnIndexFromString($allColumn);
            $fields = [];
            for ($currentRow = 1; $currentRow <= 1; $currentRow++) {
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $fields[] = $val;
                }
            }
            for ($currentRow = 2; $currentRow <= $allRow; $currentRow++) {
                $values = [];
                for ($currentColumn = 1; $currentColumn <= $maxColumnNumber; $currentColumn++) {
                    $val = $currentSheet->getCellByColumnAndRow($currentColumn, $currentRow)->getValue();
                    $values[] = is_null($val) ? '' : $val;
                }
                $row = [];
                $temp = array_combine($fields, $values);
                foreach ($temp as $k => $v) {
                    if(isset($fieldArr[$k])){
                        $row[$fieldArr[$k]]=$v;
                    }
                }
                if ($row) {
                    $insert[] = $row;
                }
            }
        } catch (Exception $exception) {
            $this->error($exception->getMessage());
        }
        if (!$insert) {
            $this->error(__('No rows were updated'));
        }
        try {
            if($this->callback){
                $callback = $this->callback;
                $insert=$callback($insert);
            }
            $this->model->saveAll($insert);
        } catch (PDOException $exception) {
            $msg = $exception->getMessage();
            $this->error($msg);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
        $this->success();
    }

    /**
     * 回收站
     */
    #[Route('GET,POST,JSON','recyclebin')]
    public function recyclebin($action='list')
    {
        switch ($action){
            case 'list':
                if (false === $this->request->isAjax()) {
                    $search=[];
                    $this->assign('search', implode(',',$search));
                    $this->assign('columns', $this->recyclebinColumns);
                    $this->assign('columnsType', $this->recyclebinColumnsType);
                    return $this->fetch('/common/recyclebin');
                }
                [$where, $order, $limit, $with] = $this->buildparams();
                $list = $this->model
                    ->withJoin($with,'left')
                    ->onlyTrashed()
                    ->where($where)
                    ->order($order)
                    ->paginate($limit);
                $result = ['total' => $list->total(), 'rows' => $list->items()];
                return json($result);
            case 'restore':
                $ids=$this->request->param('ids');
                foreach ($ids as $id){
                    $row=$this->model->onlyTrashed()->find($id);
                    if($row){
                        $row->restore();
                    }
                }
                $this->success();
            case 'destroy':
                $ids=$this->request->param('ids');
                foreach ($ids as $id){
                    $row=$this->model->onlyTrashed()->find($id);
                    if($row){
                        $row->force()->delete();
                    }
                }
                $this->success();
            case 'restoreall':
                $this->model->onlyTrashed()->where('deletetime','<>',null)->update(['deletetime'=>null]);
                $this->success();
            case 'clear':
                Db::execute('delete from '.$this->model->getTable().' where deletetime is not null');
                $this->success();
        }
    }
    /**
     * 下载
     */
    #[Route('GET,JSON','download')]
    public function download()
    {
        if($this->request->isAjax()){
            $postdata=$this->request->post();
            //获取table的列
            $listAction=explode('/',str_replace('.','/',$postdata['listAction']));
            $controller='\\app\\admin\\controller';
            for($i=0;$i<count($listAction)-1;$i++){
                if($i==count($listAction)-2){
                    $listAction[$i]=ucfirst($listAction[$i]);
                }
                $controller.='\\'.$listAction[$i];
            }
            $action=$listAction[count($listAction)-1];
            $obj=new $controller($this->request);
            $result=call_user_func_array([$obj,$action],[]);
            $list=$result->getData()['rows'];
            //格式化
            $fields=[];
            foreach ($postdata['field'] as $v){
                $fields[$v['field']]=$v['title'];
            }
            //导出到excel
            $export=new Export();
            $export->setColumn($fields);
            $export->setData($list,$postdata['searchList']);
            $export->write();
            $file=date('YmdHis',time()).'.xlsx';
            $export->save(root_path().'runtime'.DS,$file);
            $this->success('',$file);
        }else{
            $file=$this->request->get('file');
            $filepath=root_path().'runtime'.DS.$file;
            if(!file_exists($filepath)){
                $this->error('没有找到文件');
            }
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="'.$file);
            header('Cache-Control: max-age=1');
            echo file_get_contents($filepath);
            unlink($filepath);
            exit;
        }
    }
}
