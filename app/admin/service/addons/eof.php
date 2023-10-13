<?php

function getFilesTxt($files){
    $str = '';
    foreach($files as $file){
        if(!$file){
            continue;
        }
        $str.=<<<EOF
        "{$file}",

EOF;
    }
    return $str;
}

function getUnpackTxt($unpack)
{
    $str = '';
    foreach($unpack as $file){
        if(!$file){
            continue;
        }
        $str.=<<<EOF
        "{$file}",

EOF;
    }
    return $str;
}

function getRequireTxt($require)
{
    $str = '';
    foreach($require as $re){
        if(!$re){
            continue;
        }
        $re=str_replace('\\\\','\\',$re);
        $re=str_replace('\\','\\\\',$re);
        $str.=<<<EOF
        "{$re}",

EOF;
    }
    return $str;
}

function getMenuTxt($menulist)
{
    if(count($menulist)==0){
        return '';
    }
    $str='';
    foreach ($menulist as $menu){
        $arr=parseMenu($menu);
        $txt=getArrayTxt($arr);
        $str.=<<<EOF
        {$txt}

EOF;
    }
    return $str;
}

function parseMenu($menu){
    $arr=[
        'controller'=>$menu['controller'],
        'action'=>$menu['action'],
        'title'=>$menu['title'],
        'icon'=>$menu['icon'],
        'ismenu'=>$menu['ismenu'],
        'menutype'=>$menu['menutype'],
        'extend'=>$menu['extend'],
        'weigh'=>$menu['weigh'],
    ];
    if(count($menu['childlist'])>0){
        foreach ($menu['childlist'] as $key=>$value){
            $menu['childlist'][$key]=parseMenu($value);
        }
        $arr['childlist']=$menu['childlist'];
    }
    return $arr;
}

function getConfigTxt($config)
{
    $str = '';
    foreach($config as $fig){
        $arr=[
            'name'=>$fig['name'],
            'title'=>$fig['title'],
            'type'=>$fig['type'],
            'tip'=>$fig['tip'],
            'rules'=>$fig['rules'],
            'extend'=>$fig['extend']
        ];
        $txt=getArrayTxt($arr);
        //去掉末尾的逗号
        $str.=<<<EOF
        {$txt}

EOF;
    }
    return $str;
}

function getArrayTxt($arr)
{
    $str = '[';
    foreach($arr as $key=>$value){
       if(is_array($value)){
           if(is_numeric($key)){
               $str.=getArrayTxt($value);
           }else{
               $str.='\''.$key.'\'=>'.getArrayTxt($value);
           }
       }else{
           if(is_numeric($value)){
               $str.=<<<EOF
'{$key}'=>{$value},
EOF;
           }else{
               $str.=<<<EOF
'{$key}'=>'{$value}',
EOF;
           }
       }
    }
    $str=substr($str,0,strlen($str)-1);
    return $str.'],';
}
