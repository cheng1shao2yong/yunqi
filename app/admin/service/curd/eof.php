<?php

use think\facade\Db;
use app\admin\service\curd\CurdService;

function getAction($key, $value)
{
    if($key=='del' || $key=='multi' || $key=='import' || $key=='download' || $key=='recyclebin'){
        $return='return "'.$value.'";';
    }else{
        $return='return $this->fetch();';
    }
    $action=<<<EOF

    //{$value}
    #[Route("GET","{$key}")]
    public function {$key}()
    {
        {$return}
    }
    
EOF;
    return $action;
}

function getFields($rows,$table,$form,$isTree,$treeTitle)
{
    foreach ($rows as &$value){
        $value=is_string($value)?trim($value):$value;
    }
    if($rows['visible']=='none' && !$rows['edit']){
        return '';
    }
    $arr=[
        'field'=>$rows['field'],
        'title'=>$rows['title']
    ];
    if($table){
        if($rows['visible']===false && $rows['visible']==='none'){
            $arr['visible']=$rows['visible'];
        }
        if(!empty($rows['sortable'])){
            $arr['sortable']=true;
        }
        if($rows['operate']){
            $operate=parseJson($rows['operate']);
            if($operate!='='){
                $arr['operate']=$operate;
            }
            if(is_array($operate) && isset($operate['value'])){
                if(str_starts_with($operate['value'],'[') && str_ends_with($operate['value'],']')){
                    $arr['operate']['value']=json_decode($operate['value'],true);
                }
                //通过正则表达式判断$operate['value']是否为整数
                if(preg_match('/^\d+$/',$operate['value'])){
                    $arr['operate']['value']=intval($operate['value']);
                }
            }
        }else{
            $arr['operate']=false;
        }
    }
    if($form){
        if($rows['edit']){
            $arr['edit']=parseJson($rows['edit']);
            if(is_array($arr['edit']) && isset($arr['edit']['value'])){
                if(str_starts_with($arr['edit']['value'],'[') && str_ends_with($arr['edit']['value'],']')){
                    $arr['edit']['value']=json_decode($arr['edit']['value'],true);
                }
                //通过正则表达式判断$operate['value']是否为整数
                if(is_string($arr['edit']['value']) && preg_match('/^\d+$/',$arr['edit']['value'])){
                    $arr['edit']['value']=intval($arr['edit']['value']);
                }
            }
        }
        if($rows['rules']){
            $arr['rules']=parseJson($rows['rules']);
        }
    }
    if($rows['searchList']){
        $arr['searchList']=parseJson($rows['searchList']);
    }
    $json=json_encode($arr,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    $json=substr($json,0,-1).getFormatter($rows,$isTree,$treeTitle).'},';
    $str=<<<EOF
            {$json}

EOF;
    return $str;
}

function getTableslot($rows)
{
    if($rows['formatter']!='slot'){
        return '';
    }
    $field=$rows['field'];
    $title=$rows['title'];
    $str=<<<EOF
            <template #formatter="{field,rows}">
                <div v-if="field=='{$field}'">
                    <span>{$title}插槽内容</span>
                </div>
            </template>

EOF;
    return $str;
}

function getFormslot($rows,$istree=false,$treetitle='')
{
    $edit=parseJson($rows['edit']);
    $isslot=false;
    if(is_string($edit) && $edit=='slot'){
        $isslot=true;
    }
    if(is_array($edit) && $edit['form']=='slot'){
        $isslot=true;
    }
    if(!$isslot){
        return '';
    }
    $field=$rows['field'];
    $title=$rows['title'];
    if($field=='pid' && $istree){
        $str=<<<EOF
        <template #{$field}="{rows}">
            <el-form-item label="{:__('{$title}')}:" prop="{$field}">
                <el-select placeholder="{:__('请选择父级')}" v-model="rows.pid" :clearable="true" style="width: 100%">
                    <el-option key="all" label="无" value="0"></el-option>
                    {foreach name="parentList" item="vo"}
                    <el-option key="{\$vo.id}" label="{:str_replace('&amp;','&',\$vo.{$treetitle})}" value="{\$vo.id}"></el-option>
                    {/foreach}
                </el-select>
            </el-form-item>
        </template>

EOF;
    }else{
        $str=<<<EOF
        <template #{$field}="{rows}">
            <el-form-item label="{:__('{$title}')}:" prop="{$field}">
                <span>插槽内容</span>
            </el-form-item>
        </template>

EOF;
    }
    return $str;
}

function parseJson($str)
{
    $str=trim($str);
    if(str_starts_with($str,'{') && str_ends_with($str,'}')){
        $jsonarr=json_decode($str,true);
        //如果是非关联数组
        if(array_keys($jsonarr) === range(0, count($jsonarr) - 1)){
            $r=[];
            for($i=count($jsonarr);$i>0;$i--){
                $r[$i-1]=$jsonarr[$i-1];
            }
            return $r;
        }
        return $jsonarr;
    }
    return $str;
}

function getRelation($field,$relation)
{
    $table=$relation['table'];
    $config = Db::getConfig();
    $default=$config['default'];
    $prefix=$config['connections'][$default]['prefix'];
    $table=str_replace($prefix,'',$table);
    $tableModelName=str_replace(' ','',ucwords(str_replace('_',' ',$table)));
    $selectfields=implode(',',array_unique([$relation['relationField'],$relation['showField'],$relation['filterField']]));
    if($relation['ralationType']=='one'){
        $action=<<<EOF

    public function {$table}()
    {
        return \$this->hasOne({$tableModelName}::class,'{$relation['relationField']}','{$field}')->field('{$selectfields}');
    }
     
EOF;
        return $action;
    }
    if($relation['ralationType']=='many'){
        $action=<<<EOF

    public function {$table}()
    {
        return \$this->hasMany({$tableModelName}::class,'{$relation['relationField']}','{$field}')->field('{$selectfields}');
    }
     
EOF;
        return $action;
    }
}

function getRecyclebinField($field){
    if(empty($field)){
        return '';
    }
    $str='';
    foreach ($field as $value){
        $str.=<<<EOF
    "{$value['field']}"=>"{$value['title']}",
        
EOF;
    }
    return $str;
}

function getRecyclebinType($field){
    if(empty($field)){
        return '';
    }
    $str='';
    foreach ($field as $value){
        $str.=<<<EOF
    "{$value['field']}"=>"{$value['type']}",
        
EOF;
    }
    return $str;
}

function getFormatter($rows,$isTree,$treeTitle)
{
    if($rows['visible']==='relation'){
        $relation=json_decode($rows['relation'],true);
        $table=str_replace(CurdService::$prefix,'',$relation['table']);
        $arrfieldtype="''";
        if($rows['formatter']=='tags' || $rows['formatter']=='images'){
            $arrfieldtype="[]";
        }
        $str=<<<EOF
,"formatter":function (data,row){
                let {$rows['formatter']}=Yunqi.formatter.{$rows['formatter']};
                {$rows['formatter']}.value=row.{$table}?row.{$table}.{$relation['showField']}:{$arrfieldtype};
                return {$rows['formatter']};
            }
EOF;
        return $str;
    }else{
        if($isTree && $rows['field']==$treeTitle){
            $str=<<<EOF
,"formatter":function(data){
                let html=Yunqi.formatter.html;
                html.value=data.replace(/&nbsp;/g,'&nbsp;&nbsp;');
                return html;
            }
EOF;
            return $str;
        }
        if($rows['formatter']=='text'){
            return '';
        }
        $formatter=',"formatter":Yunqi.formatter.'.$rows['formatter'];
        return $formatter;
    }
}