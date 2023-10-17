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

namespace app\common\controller;

use app\admin\service\AdminAuthService;
use app\common\listener\WriteLog;
use app\common\model\Addons;
use app\common\service\LangService;
use think\exception\HttpResponseException;
use think\facade\Cache;
use think\facade\Config;
use think\facade\Db;
use think\facade\Lang;
use think\facade\View;
use think\facade\Cookie;
use think\Response;

/**
 * 后台控制器基类
 */
class Backend extends BaseController
{
    /**
     * 当前登录用户
     * @var \app\admin\service\AdminAuthService
     */
    protected $auth;

    /**
     * 应用配置参数
     * @var array
     */
    protected $config = [];
    /**
     * 无需登录的方法,同时也就不需要鉴权了
     * @var array
     */
    protected $noNeedLogin = [];

    /**
     * 无需鉴权的方法,但需要登录
     * @var array
     */
    protected $noNeedRight = [];
    /**
     * 模型对象
     * @var \think\Model;
     */
    protected $model;

    /**
     * 初始化方法
     * @return void
     */
    protected function _initialize()
    {
        $modulename=app('http')->getName();
        $modulealis=get_module_alis($modulename);
        $controllername = 'app\\'.$modulename.'\\controller\\'.str_replace('.','\\',$this->request->controller());
        $actionname = $this->request->action();
        $this->auth = AdminAuthService::newInstance(compact('modulealis','modulename','controllername','actionname'));
        $noNeed=$this->getNoNeedLoginOrRight();
        $noNeedLogin = in_array('*',$noNeed['login']) || in_array($actionname,$noNeed['login']);
        if(!$noNeedLogin){
            if ($this->auth->isLogin()) {
                event('write_log','管理员访问-ID:'.$this->auth->id.',昵称:'.$this->auth->nickname);
                $noNeedRight=in_array('*',$noNeed['right']) || in_array($actionname,$noNeed['right']);
                if(!$noNeedRight && !$this->auth->check($controllername,$actionname)){
                    $response = Response::create(__('没有操作权限!'), 'html', 401);
                    event('write_log','没有操作权限');
                    event('write_log',WriteLog::END);
                    throw new HttpResponseException($response);
                }
            }else{
                event('write_log','未登陆跳转');
                event('write_log',WriteLog::END);
                $url=url('/'.$modulealis.'/login',['referer'=>$this->request->url(true)])->build();
                redirect($url)->send();
                exit;
            }
        }else{
            event('write_log','游客访问');
        }
        event('write_log',WriteLog::ADMIN);
        $elementUi=Config::get('yunqi.elementUi');
        if(Cookie::get('layout')){
            $elementUi['layout']=Cookie::get('layout');
        }
        $elementUi['language_list']=Config::get('yunqi.language_list');
        $elementUi['language']=Config::get('yunqi.language');
        if(Cookie::get('think_var')){
            $elementUi['language']=Cookie::get('think_var');
        }
        //加载当前控制器语言包
        LangService::newInstance()->load($elementUi['language']);
        // 配置信息
        $route=[$modulename,$this->getShortControllerName(),$actionname];
        $version=Config::get('app.app_debug')?time():site_config("basic.version");
        $this->config = [
            'version'        => $version,
            'route'          => $route,
            'url'            => request()->url(true),
            'query'          => $this->request->get(),
            'window'         => [
                'id'         => Cookie::get('window-id'),
                'type'       => Cookie::get('window-type')
            ],
            'baseUrl'        => $this->request->domain().'/'.$this->auth->getRoute('modulealis').'/',
            'upload'         => Config::get('yunqi.upload'),
            'elementUi'      => $elementUi,
            'locale'         => LangService::newInstance()->all()
        ];
        //渲染配置信息
        $this->assign('config', $this->config);
        //渲染权限对象
        $this->assign('auth', $this->auth);
    }

    /**
     * 获取table中filter的值
     * @param string $filterstr
     * @return array|mixed|string
     */
    protected function filter(string $filterstr='')
    {
        $filterarr = $this->request->post("filter/a", []);
        if(!$filterstr){
            return $filterarr;
        }
        foreach ($filterarr as $value){
            if($value['field']==$filterstr){
                return $value['value'];
            }
        }
        return '';
    }

    protected function fetch(string $template = '', array $vars = [], bool $isVue=true)
    {
        $controllername = $this->getShortControllerName();
        $actionname=$this->request->action();
        if(empty($template)){
            $template = $controllername.DS.$actionname;
        }
        if($isVue){
            View::layout('layout'.DS.'vue');
        }
        return View::fetch($template,$vars);
    }

    /**
     * 构造下拉分页
     * @return array
     */
    protected function selectpage(array $where=[])
    {
        $sort=$this->model->getPk()??'id';
        $order='desc';
        $limit=[
            'page'  => $this->request->post('page/d',1),
            'list_rows' => $this->request->post('limit/d',7)
        ];
        $keyField=$this->request->post('keyField');
        $labelField=$this->request->post('labelField');
        $keyValue=$this->request->post('keyValue');
        $labelValue=$this->request->post('labelValue');
        if($keyValue && is_string($keyValue)){
            $where[]=[$keyField,'in',explode(',',$keyValue)];
        }
        if($keyValue && is_array($keyValue)){
            $where[]=[$keyField,'in',$keyValue];
        }
        if($labelValue){
            $where[]=[$labelField,'like','%'.$labelValue.'%'];
        }
        $where = function ($query) use ($where) {
            foreach ($where as $v) {
                if(count($v)==1){
                    $query->where($v[0]);
                }
                if(count($v)==2){
                    $query->where($v[0],$v[1]);
                }
                if(count($v)==3){
                    $query->where($v[0],$v[1],$v[2]);
                }
            }
        };
        $list = $this->model
            ->field($keyField.','.$labelField)
            ->where($where)
            ->order($sort, $order)
            ->paginate($limit);
        $rows=$list->items();
        foreach ($rows as &$row){
            $row[$keyField]=(string)$row[$keyField];
        }
        $result = ['total' => $list->total(), 'rows' => $rows];
        return json($result);
    }

    /**
     * 生成查询所需要的条件,排序方式
     * @param array   $where  二维数组，默认的查询条件
     * @param string  $alias   主表别名
     * @return array
     */
    protected function buildparams(array $where=[]):array
    {
        $limit=[
            'page'  => $this->request->post('page/d',1),
            'list_rows' => $this->request->post('limit/d',10)
        ];
        $filter = $this->request->post("filter/a", []);
        $with=is_null($this->relationField)?[]:(is_array($this->relationField)?$this->relationField:explode(',',$this->relationField));
        $search=$this->getBuildSearch();
        if($search){
            $where[]=$search;
        }
        foreach ($filter as  $filterone) {
            $wh=$this->getBuildWhere($this->model->getTable(),$filterone);
            if($wh){
                $where[]=$wh;
            }
            if(strpos($filterone['field'],'.')!==false){
                $with=$this->getBuildWith($filterone,$with);
            }
        }
        /* @var \think\db\Query $query */
        $where = function ($query) use ($where) {
            foreach ($where as $v) {
                if(count($v)==1){
                    $query->where($v[0]);
                }
                if(count($v)==2){
                    $query->where($v[0],$v[1]);
                }
                if(count($v)==3){
                    $query->where($v[0],$v[1],$v[2]);
                }
            }
        };
        $order=$this->getBuildSort();
        return [$where,$order,$limit,$with];
    }

    private function getBuildSort()
    {
        $sort=$this->request->post('sort','id');
        $order=$this->request->post('order','desc');
        $sort=explode(',',$sort);
        $order=explode(',',$order);
        $orderSort=[];
        foreach ($sort as $key=>$value){
            $orderSort[]=$value.' '.$order[$key];
        }
        $orderSort=implode(',',$orderSort);
        return $orderSort;
    }

    private function getBuildSearch()
    {
        $search=$this->request->post('search');
        $searchValue=$this->request->post('searchValue');
        if($search && $searchValue){
            $searcharr = is_array($search) ? $search : explode(',', $search);
            return [implode("|", $searcharr), "LIKE", "%{$searchValue}%"];
        }
        return false;
    }
    private function getBuildWith(array $filterone,array $with)
    {
        if(strpos($filterone['field'],'.')!==false){
            $sv=explode('.',$filterone['field']);
            if(in_array($sv[0],$with)){
                $filterone['field']=$sv[1];
                $where=$this->getBuildWhere('',$filterone);
                if($where){
                    $key=array_search($sv[0],$with);
                    unset($with[$key]);
                    $with[$sv[0]]=function ($query) use ($where){
                        if(count($where)==1){
                            $query->where($where[0]);
                        }
                        if(count($where)==2){
                            $query->where($where[0],$where[1]);
                        }
                        if(count($where)==3){
                            $query->where($where[0],$where[1],$where[2]);
                        }
                    };
                }
                return $with;
            }
        }
        return $with;
    }
    private function getBuildWhere(string $table,array $filterone)
    {
        $where='';
        $sym=$filterone['op'];
        if(!$sym){
            return $where;
        }
        $sym=strtoupper($sym);
        if(strpos($filterone['field'],'.')!==false){
            return $where;
        }
        $field=$table?$table.'.'.$filterone['field']: $filterone['field'];
        $value=$filterone['value'];
        switch ($sym) {
            case '=':
            case '<>':
            case '!=':
            case '>':
            case '>=':
            case '<':
            case '<=':
            case '> TIME':
            case '>= TIME':
            case '< TIME':
            case '<= TIME':
                $where = [$field, $sym, $value];
                break;
            case 'LIKE':
            case 'NOT LIKE':
                $where = [$field, $sym, "%{$value}%"];
                break;
            case 'FIND_IN_SET':
            case 'NOT FIND_IN_SET':
                $where = [$sym."({$value},{$field})"];
                break;
            case 'IN':
            case 'NOT IN':
                if(!is_array($value)){
                    $this->error(__('IN与NOT IN参数必须是数组'));
                }
                $where = [$field, $sym, $value];
                break;
            case 'BETWEEN':
            case 'NOT BETWEEN':
            case 'BETWEEN TIME':
            case 'NOT BETWEEN TIME':
                if(!is_array($value)){
                    $this->error(__('BETWEEN与NOT BETWEEN参数必须是数组'));
                }
                if(count($value)!=2){
                    $this->error(__('BETWEEN与NOT BETWEEN参数必须为数组且有两个值'));
                }
                if($value[0]==='' && $value[1]===''){
                    return false;
                }
                //当出现一边为空时改变操作符
                if ($value[0] === '') {
                    if($sym == 'BETWEEN'){
                        $sym ='<=';
                    }
                    if($sym == 'NOT BETWEEN'){
                        $sym ='>';
                    }
                    $value = $value[1];
                } elseif ($value[1] === '') {
                    if($sym == 'BETWEEN'){
                        $sym ='>=';
                    }
                    if($sym == 'NOT BETWEEN'){
                        $sym ='<';
                    }
                    $value = $value[0];
                }
                $where = [$field, $sym, $value];
                break;
            case 'IS NULL':
            case 'IS NOT NULL':
                $where = [$field.' '.$sym];
                break;
            default:
                break;
        }
        return $where;
    }

    private function getShortControllerName():string
    {
        $controllername=$this->auth->getRoute('controllername');
        $shortController=str_replace('.','/',substr($controllername,strpos($controllername,'\\controller\\')+12));
        $shortController=str_replace('\\','/',$shortController);
        $shortController=strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $shortController));
        return $shortController;
    }

    private function getNoNeedLoginOrRight()
    {
        $login=$this->noNeedLogin;
        $login=is_string($login)?[$login]:$login;
        $right=$this->noNeedRight;
        $right=is_string($right)?[$right]:$right;
        return compact('login','right');
    }
}
