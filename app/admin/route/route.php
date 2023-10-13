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

use think\facade\Route;

//后台首页
Route::get('/',function(){
    $alis=get_module_alis('admin');
    if(isset($_GET['del_install']) && $_GET['del_install']==1){
        $install=root_path().'/public/install';
        if(is_dir($install)){
            rmdirs($install);
        }
    }
    return redirect('/'.$alis.'/index');
});