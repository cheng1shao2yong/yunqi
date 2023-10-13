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

use think\exception\HttpResponseException;
use think\facade\Route;
use think\Response;
use app\common\model\Addons;
use app\common\model\AddonsPay;
use Yansongda\Pay\Pay;

//支付配置，仅收费插件需要配置
$config=[
    'wechat' => [
        'default' => [
            'mch_id' => site_config("addons.open_addons_mchid"),
            'mch_secret_key' => site_config("addons.open_addons_mchkey"),
            'mch_secret_cert' => root_path().'app/addons/cert/apiclient_key.pem',
            'mch_public_cert_path' => root_path().'app/addons/cert/apiclient_cert.pem',
            'notify_url' =>request()->domain().'/addons/notify',
            'mp_app_id' => site_config("addons.open_addons_mpappid"),
            'mini_app_id' => '',
            'app_id' => '',
            'mode' => Pay::MODE_NORMAL
        ]
    ]
];

$open_addons_status=site_config("addons.open_addons_status");
if(!$open_addons_status){
    $response = Response::create('网址:'.request()->host().'，所安装的系统未开放扩展', 'html', 401);
    throw new HttpResponseException($response);
}

//插件列表
Route::get('/list',function (){
    $page = input('page/d', 1);
    $limit = input('limit/d', 10);
    $type = input('type/s', '');
    $plain = input('plain/s', 'all');
    $keywords = input('keywords/s', '');
    $where = [];
    if ($type){
        $where[] = ['type', '=', $type];
    }
    $where[] = ['open', '=', 1];
    if ($plain == 'free') {
        $where[] = ['price', '=', 0];
    }
    if ($plain == 'not-free') {
        $where[] = ['price', '>', 0];
    }
    if ($keywords) {
        $where[] = ['name|pack', 'like', '%' . $keywords . '%'];
    }
    $fields = 'pack,key,type,name,description,author,document,price,version';
    $result = Addons::list($page, $limit, $fields, $where);
    return json($result);
});

//下载插件
Route::get('/download',function (){
    $key = input('key/s');
    $addon = Addons::where(['key' => $key, 'open' => 1])->find();
    if (!$addon) {
        $response = Response::create('插件不存在', 'html', 403);
        throw new HttpResponseException($response);
    }
    if ($addon->price > 0) {
        $transaction_id = input('transaction_id/s');
        $pay = AddonsPay::where(['transaction_id' => $transaction_id, 'pay_status' => 1, 'pack' => $addon['pack']])->find();
        if (!$pay) {
            $response = Response::create('插件未购买', 'html', 403);
            throw new HttpResponseException($response);
        }
        if ($pay->expire_time < time()) {
            $response = Response::create('交易单号已过期', 'html', 403);
            throw new HttpResponseException($response);
        }
        if($pay->pack!=$addon->pack){
            $response = Response::create('交易单号与插件不匹配', 'html', 403);
            throw new HttpResponseException($response);
        }
        $pay->times++;
        $pay->save();
    }
    $path = root_path() . 'addons' . DS . $addon['type'] . DS . $addon['pack'] . DS . $addon['version'] . '.zip';
    if (!is_file($path)) {
        $response = Response::create('插件包不存在', 'html', 403);
        throw new HttpResponseException($response);
    }
    return download($path, $addon['key'] . '.zip');
});

//获取支付二维码
Route::get('/paycode',function () use ($config){
    $key = input('key/s');
    $out_trade_no = input('out_trade_no/s');
    $addon = Addons::where(['key' => $key, 'open' => 1])->find();
    if (!$addon) {
        $response = Response::create('插件不存在', 'html', 403);
        throw new HttpResponseException($response);
    }
    if ($addon->price <= 0) {
        $response = Response::create('插件免费', 'html', 403);
        throw new HttpResponseException($response);
    }
    if (!class_exists('\\Yansongda\\Pay\\Pay')) {
        $response = Response::create('未安装支付扩展', 'html', 403);
        throw new HttpResponseException($response);
    }
    Pay::config($config);
    $order = [
        'out_trade_no' => $out_trade_no,
        'description' => '下单购买【'.$addon['name'].'】'.Addons::TYPE[$addon['type']],
        "attach"=>$key,
        'amount' => [
            'total' => $addon->price * 100
        ],
    ];
    $result = Pay::wechat()->scan($order);
    if(isset($result['code_url'])){
        return $result['code_url'];
    }else{
        $response = Response::create($result['message'], 'html', 403);
        throw new HttpResponseException($response);
    }
});

//检测是否支付
Route::get('/checkpay',function (){
    $key = input('key/s');
    $out_trade_no = input('out_trade_no/s');
    $pay = AddonsPay::where(['out_trade_no' => $out_trade_no, 'key' => $key, 'pay_status'=>1])->find();
    if($pay && (time()-$pay->createtime>60*60)){
        //一个小时内查询有效
        return json($pay);
    }
    return '';
});

//检测交易单号
Route::get('/checktransactionid',function (){
    $pack = input('pack/s');
    $transaction_id = input('transaction_id/s');
    $pay = AddonsPay::where(['transaction_id' => $transaction_id,'pack'=>$pack,'pay_status' => 1])->find();
    $expire_time=0;
    if($pay){
        $expire_time=$pay->expire_time-time();
    }
    $result=[
        'expire_time'=>$expire_time,
        'status'=>$pay?1:0
    ];
    return json($result);
});

//支付回调
Route::post('/notify',function () use ($config){
    Pay::config($config);
    $result = Pay::wechat()->callback();
    if($result) {
        $data = $result->all();
        $attach = $data['resource']['ciphertext']['attach'];
        $out_trade_no = $data['resource']['ciphertext']['out_trade_no'];
        $amount = $data['resource']['ciphertext']['amount']['total'];
        $transaction_id = $data['resource']['ciphertext']['transaction_id'];
        $addon = Addons::where(['key' => $attach, 'open' => 1])->find();
        if (!$addon) {
            $response = Response::create('未找到扩展', 'html', 403);
            throw new HttpResponseException($response);
        }
        if ($addon->price * 100 != $amount) {
            $response = Response::create('金额不对', 'html', 403);
            throw new HttpResponseException($response);
        }
        $addonspay = AddonsPay::where(['transaction_id' => $transaction_id, 'pay_status' => 1])->find();
        if ($addonspay) {
            return '支付完成';
        }
        (new AddonsPay())->save([
            'key' => $attach,
            'pack' => $addon['pack'],
            'transaction_id' => $transaction_id,
            'out_trade_no' => $out_trade_no,
            'pay_amount' => $amount,
            'pay_status' => 1,
            'times' => 0,
            'pay_time' => date('Y-m-d H:i:s'),
            'expire_time' => time() + 3600 * 24 * 30
        ]);
        return '支付完成';
    }
    return '支付失败';
});