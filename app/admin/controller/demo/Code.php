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

namespace app\admin\controller\demo;

use app\common\controller\Backend;
use think\annotation\route\Group;
use think\annotation\route\Route;

#[Group("demo/code")]
class Code extends Backend
{

    #[Route("GET","show")]
    public function show()
    {
        $name=$this->request->get('name');
        $controllerFile=root_path().'app'.DS.'admin'.DS.'controller'.DS.'demo'.DS.$name.'.php';
        $controller=file_get_contents($controllerFile);
        $viewFile=root_path().'app'.DS.'admin'.DS.'view'.DS.'demo'.DS.strtolower($name).DS.'index.html';
        $view=file_get_contents($viewFile);
        $modelFile=root_path().'app'.DS.'common'.DS.'model'.DS.'Demo.php';
        $model=file_get_contents($modelFile);
        $jsFile=root_path().'public'.DS.'assets'.DS.'js'.DS.'admin'.DS.'demo'.DS.strtolower($name).'.js';
        $js=file_get_contents($jsFile);
        $this->assign('controller',$controller);
        $this->assign('view',$view);
        $this->assign('js',$js);
        $this->assign('model',$model);
        return $this->fetch();
    }
}