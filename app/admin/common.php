<?php
declare (strict_types = 1);

// 这是系统自动生成的公共文件

if (!function_exists('build_var_json')) {

    /**
     * 将模板中通过assign的变量转换成json
     *
     * @return string
     */
    function build_var_json(array $arr):string
    {
        $keys=array_keys($arr['vars']);
        $r=[];
        foreach ($keys as $key){
            if($key=='config' || $key=='auth' || $key=='upload'){
                continue;
            }
            $r[$key]=$arr[$key];
        }
        return json_encode($r);
    }
}

if (!function_exists('format_bytes')) {
    /**
     * 将字节转换为可读文本
     * @param int    $size      大小
     * @param string $delimiter 分隔符
     * @param int    $precision 小数位数
     * @return string
     */
    function format_bytes($size, $delimiter = '', $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
        for ($i = 0; $size >= 1024 && $i < 6; $i++) {
            $size /= 1024;
        }
        return round($size, $precision) . $delimiter . $units[$i];
    }
}