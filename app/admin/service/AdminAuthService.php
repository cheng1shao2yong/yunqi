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
namespace app\admin\service;

use app\common\library\Tree;
use app\common\model\Admin;
use app\common\model\AuthGroup;
use app\common\model\AuthRule;
use app\common\model\QrcodeScan;
use app\common\model\Third;
use app\common\service\AuthService;
use think\facade\Config;
use think\facade\Session;
use think\facade\Cache;

class AdminAuthService extends AuthService{
    protected $allowFields = ['id', 'username', 'nickname', 'mobile', 'avatar', 'user_id', 'group_id', 'status'];
    protected $userRuleList = [];
    protected $userMenuList = [];
    private $modulealis;
    private $modulename;
    private $controllername;
    private $actionname;

    protected function init()
    {
        parent::init();
        $this->setUserRuleAndMenu();
    }

    public function getUserRuleList()
    {
        return $this->userRuleList;
    }

    public function getUserMenuList()
    {
        return $this->userMenuList;
    }

    public function userinfo(bool $allinfo=false)
    {
        $r=Session::get('admin');
        if(!$r){
            return null;
        }
        if (Config::get('yunqi.login_unique')) {
            $my = Admin::get($this->id);
            if (!$my || $my['token'] != $r['token']) {
                Session::delete("admin");
                Session::save();
                return null;
            }
        }
        if(Config::get('yunqi.loginip_check')){
            if (request()->ip()!=$r['loginip']) {
                Session::delete("admin");
                Session::save();
                return null;
            }
        }
        $r['groupids']=explode(',',$r['groupids']);
        if($allinfo){
            return $r;
        }
        return array_intersect_key($r,array_flip($this->allowFields));
    }

    public function isSuperAdmin():bool
    {
        return in_array(1,$this->groupids);
    }

    public function getChildrenGroupIds(array $groupids=[]):array
    {
        if(count($groupids)==0){
            $groupids=$this->groupids;
        }
        $list=AuthGroup::where('pid','in',$groupids)->column('id');
        $groupids=array_merge($groupids,$list);
        if(count($list)>0){
            $r=$this->getChildrenGroupIds($list);
            $groupids=array_merge($groupids,$r);
        }
        return array_unique($groupids);
    }

    public function getRoute(string $type):string
    {
        switch ($type){
            case 'modulealis':
                return $this->modulealis;
            case 'modulename':
                return $this->modulename;
            case 'controllername':
                return $this->controllername;
            case 'actionname':
                return $this->actionname;
            case 'title':
                $rulelist=$this->getRuleList();
                $actiontitle=['未定义'];
                $rulepid=0;
                foreach ($rulelist as $rule){
                    if($rule['controller']==$this->controllername && !$rule['ismenu']){
                        $action=json_decode($rule['action'],true);
                        $title=json_decode($rule['title'],true);
                        foreach ($action as $key=>$item){
                            if($item==$this->actionname){
                                $actiontitle=[$title[$key]];
                                $rulepid=$rule['pid'];
                            }
                        }
                    }
                }
                if($rulepid){
                    $this->getRuleTitles($rulelist,$rulepid,$actiontitle);
                    return implode('/',array_reverse($actiontitle));
                }
                return '未定义';
                default:
                    return '';
        }
    }

    public function logout()
    {
        $admin = Admin::find(intval($this->id));
        if ($admin) {
            $admin->token = '';
            $admin->save();
        }
        Session::delete("admin");
        return true;
    }

    public function loginByThird(string $__token__):bool
    {
        $scan=QrcodeScan::where(['type'=>'backend-login','foreign_key'=>$__token__])->order('id desc')->find();
        if($scan){
            $third=Third::where(['platform'=>Third::PLATFORM('微信公众号'),'openid'=>$scan->openid])->find();
            if($third){
                $admin=Admin::where(['third_id'=>$third->id])->find();
                if($admin && $admin['status'] == 'normal'){
                    $admin->loginfailure = 0;
                    $admin->logintime = time();
                    $admin->loginip = request()->ip();
                    $admin->token = uuid();
                    $admin->save();
                    Session::set('admin',$admin->toArray());
                    Session::save();
                    return true;
                }
            }
        }
        return false;
    }

    public function login(string $username, string $password)
    {
        $admin = Admin::where(['username' => $username])->find();
        if (!$admin) {
            throw new \Exception('用户名或密码错误！');
        }
        if ($admin['status'] == 'hidden') {
            throw new \Exception('用户已被禁止使用！');
        }
        if (Config::get('yunqi.login_failure_retry') && $admin->loginfailure >= 10 && time() - $admin->updatetime < 86400) {
            throw new \Exception('登陆失败次数过多，请一天后重试！');
        }
        if ($admin->password != md5(md5($password) . $admin->salt)) {
            $admin->loginfailure++;
            $admin->save();
            throw new \Exception('用户名或密码错误！');
        }
        $admin->loginfailure = 0;
        $admin->logintime = time();
        $admin->loginip = request()->ip();
        $admin->token = uuid();
        $admin->save();
        Session::set('admin',$admin->toArray());
        Session::save();
    }

    public function getRuleList()
    {
        $rule = AuthRule::field('id,pid,status,controller,action,title,icon,menutype,ismenu,extend')
            ->order('weigh', 'desc')
            ->cache('admin_rule_list')
            ->select()
            ->toArray();
        foreach ($rule as $k=>$v) {
            if($v['ismenu'] && $v['status']=='hidden'){
                unset($rule[$k]);
                continue;
            }
            $rule[$k]['url'] = $this->getPath($v['controller'], $v['action']);
        }
        return $rule;
    }

    /**
     * 根据控制器注解获取到菜单栏的path
     * @param string $controller
     * @param string $action
     * @return string
     */
    public function getPath(mixed $controller,mixed $action):string
    {
        $url='';
        if(!$controller || !$action){
            return build_url('404');
        }
        if(!class_exists($controller) || !method_exists($controller,$action)){
            return build_url('404');
        }
        $class=new \ReflectionClass($controller);
        $attributes=$class->getAttributes();
        foreach ($attributes as $attribute)
        {
            $name=$attribute->getName();
            if($name=='think\annotation\route\Group'){
                $url=$attribute->getArguments()[0].'/';
                break;
            }
        }
        $method=new \ReflectionMethod($controller, $action);
        $attributes=$method->getAttributes();;
        foreach ($attributes as $attribute)
        {
            $name=$attribute->getName();
            if($name=='think\annotation\route\Get' || $name=='think\annotation\route\Post'){
                $url=$url.$attribute->getArguments()[0];
                break;
            }
            if($name=='think\annotation\route\Route'){
                $url=$url.$attribute->getArguments()[1];
                break;
            }
        }
        return build_url($url);
    }

    private function getRuleTitles(array $rulelist,int $ruleid,array &$actiontitle)
    {
        foreach ($rulelist as $rule){
            if($rule['id']==$ruleid){
                $actiontitle[]=$rule['title'];
                if($rule['pid']){
                    $this->getRuleTitles($rulelist,$rule['pid'],$actiontitle);
                }
            }
        }
    }
    /**
     * 为用户权限列表ruleList赋值
     */
    private function setUserRuleAndMenu()
    {
        if($this->id){
           $adminRuleList= Cache::get('admin_rule_list_'.$this->id);
           $adminMenuList= Cache::get('admin_menu_list_'.$this->id);
           if(!$adminRuleList || !$adminMenuList || Config::get('app.app_debug')){
               $rules=array_column($this->getRuleList(),null,'id');
               $groups=AuthGroup::column('auth_rules','id');
               foreach ($groups as $key=>$value){
                   $value=explode(',',$value);
                   $groups[$key]=array_filter(array_map(function($v) use ($rules){
                       if($v=='*'){
                           return '*';
                       }
                       return isset($rules[$v])?$rules[$v]:'';
                   },$value),function ($f){
                       return $f!='';
                   });
               }
               $rulesids=[];
               $menuids=[];
               if($this->isSuperAdmin()){
                   $adminRuleList='*';
                   $adminMenuList='*';
               }else{
                   $adminRuleList=[];
                   $adminMenuList=[];
                   foreach ($this->groupids as $groupid){
                       foreach ($groups[$groupid] as $value){
                           if($value['ismenu']==1){
                               continue;
                           }
                           if(in_array($value['id'],$rulesids)){
                               continue;
                           }
                           $adminRuleList[]=$value;
                           $rulesids[]=$value['id'];
                       }
                       foreach ($groups[$groupid] as $value){
                           if($value['ismenu']==0){
                               continue;
                           }
                           if(in_array($value['id'],$menuids)){
                               continue;
                           }
                           $adminMenuList[]=$value;
                           $menuids[]=$value['id'];
                       }
                   }
               }
               Cache::set('admin_rule_list_'.$this->id,$adminRuleList);
               Cache::set('admin_menu_list_'.$this->id,$adminMenuList);
           }
           $this->userRuleList=$adminRuleList;
           $this->userMenuList=$adminMenuList;
        }
    }

    /**
     * 检测权限
     * @param string $controller
     * @param string $action
     * @return mixed
     */
    public function check(string $controller,string $action):int
    {
        if ($this->userRuleList=='*') {
            return 1;
        }
        foreach ($this->userRuleList as $value){
            if($value['controller']==$controller){
                $actions=json_decode($value['action'],true);
                foreach ($actions as $v){
                    if($v==$action){
                        return 1;
                    }
                }
            }
        }
        return 0;
    }

    /**
     * 获取左侧和顶部菜单栏
     * @return array
     */
    public function getSidebar(mixed $refererUrl=''):array
    {
        $referer = [];
        $ruleList=$this->getRuleList();
        foreach ($ruleList as $k => &$v) {
            unset($v['controller']);
            unset($v['action']);
            if($this->userMenuList!='*' && !in_array($v['id'],array_column($this->userMenuList,'id'))){
                unset($ruleList[$k]);
                continue;
            }
            if (!$v['ismenu']) {
                unset($ruleList[$k]);
                continue;
            }
            $v['title'] = __($v['title']);
            if($v['extend']){
                $v['extend']=json_decode($v['extend'],true);
            }
        }
        $ruleList=array_values($ruleList);
        $selected=$ruleList[0];
        $treeRuleList=Tree::instance()->init($ruleList)->getTreeArray(0);
        $this->getSelectAndReferer($treeRuleList,$refererUrl,$selected,$referer);
        if($selected==$referer){
            $referer=[];
        }
        return [$treeRuleList,$selected,$referer];
    }

    private function getSelectAndReferer($treeRuleList,$refererUrl,&$selected,&$referer)
    {
        foreach ($treeRuleList as $value){
            if(count($value['childlist'])===0 && !$selected['url']){
                $selected=$value;
            }
            if($refererUrl){
                if(parse_url($refererUrl,PHP_URL_PATH)==parse_url($value['url'],PHP_URL_PATH)){
                    $value['url']=$refererUrl;
                    $referer=$value;
                }
            }
            if(count($value['childlist'])>0){
                $this->getSelectAndReferer($value['childlist'],$refererUrl,$selected,$referer);
            }
        }
    }

    public function loginByMobile(string $mobile, string $code)
    {

    }

    public function loginByThirdPlatform(string $platform, string $openid)
    {

    }
}