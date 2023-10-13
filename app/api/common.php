<?php
// 这是系统自动生成的公共文件
if (!function_exists('create_out_trade_no')) {
    /**
     * 生成随机订单号
     */
    function create_out_trade_no()
    {
        return date('YmdHis',time()).rand(10000,99999);
    }
}