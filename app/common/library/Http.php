<?php
declare(strict_types=1);

namespace app\common\library;

/**
 * Http 请求类
 */
class Http
{

    /**
     * 发送一个POST请求
     * @param string $url     请求URL
     * @param array  $params  请求参数
     * @param array  $options 扩展参数
     * @return mixed|string
     */
    public static function post($url, $params = [], $options = [])
    {
        $response = self::sendRequest($url, $params, 'POST', $options);
        return $response;
    }

    /**
     * 发送一个GET请求
     * @param string $url     请求URL
     * @param array  $params  请求参数
     * @param array  $options 扩展参数
     * @return mixed|string
     */
    public static function get($url, $params = [], $options = [])
    {
        $response = self::sendRequest($url, $params, 'GET', $options);
        return $response;
    }

    /**
     * CURL下载文件
     * @param string $url     请求的链接
     * @param string $savepath 保存文件的路径
     * @param mixed  $params  传递的参数
     * @param mixed  $options CURL的参数
     * @return array
     */
    public static function download($fileurl,$savepath,$options=[]){
        $response=new Response();
        if(!is_dir(dirname($savepath))){
            mkdir(dirname($savepath),0755,true);
        }
        $new_file = fopen($savepath, "w") or throw new \Exception("Unable to open file!");
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $fileurl);
        curl_setopt($ch, CURLOPT_FILE, $new_file);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt_array($ch, (array)$options);
        $ret=curl_exec($ch);
        $err = curl_error($ch);
        if (false === $ret || !empty($err)) {
            $errno = curl_errno($ch);
            $response->set('errorCode',$errno);
            $response->set('errorMsg',$err);
        }else{
            $response->set('contentType',curl_getinfo($ch,CURLINFO_CONTENT_TYPE));
            $statusCode=curl_getinfo($ch,CURLINFO_HTTP_CODE);
            $response->set('statusCode',$statusCode);
            if($statusCode!=200) {
                $response->set('errorMsg','下载失败');
            }
        }
        curl_close($ch);
        fclose($new_file);
        return $response;
    }

    /**
     * CURL发送Request请求,含POST和REQUEST
     * @param string $url     请求的链接
     * @param mixed  $params  传递的参数
     * @param string $method  请求的方法
     * @param mixed  $options CURL的参数
     * @return array
     */
    public static function sendRequest($url, $params = [], $method = 'POST', $options = [])
    {
        $response=new Response();
        $method = strtoupper($method);
        $protocol = substr($url, 0, 5);
        $query_string = is_array($params) ? http_build_query($params) : $params;
        $ch = curl_init();
        $defaults = [];
        if ('GET' == $method) {
            $geturl = $query_string ? $url . (stripos($url, "?") !== false ? "&" : "?") . $query_string : $url;
            $defaults[CURLOPT_URL] = $geturl;
        } else {
            $defaults[CURLOPT_URL] = $url;
            if ($method == 'POST') {
                $defaults[CURLOPT_POST] = 1;
            } else {
                $defaults[CURLOPT_CUSTOMREQUEST] = $method;
            }
            $defaults[CURLOPT_POSTFIELDS] = $params;
        }
        $defaults[CURLOPT_HEADER] = false;
        $defaults[CURLOPT_USERAGENT] = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.98 Safari/537.36";
        $defaults[CURLOPT_FOLLOWLOCATION] = true;
        $defaults[CURLOPT_RETURNTRANSFER] = true;
        $defaults[CURLOPT_CONNECTTIMEOUT] = 3;
        $defaults[CURLOPT_TIMEOUT] = 3;
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:'));
        if ('https' == $protocol) {
            $defaults[CURLOPT_SSL_VERIFYPEER] = false;
            $defaults[CURLOPT_SSL_VERIFYHOST] = false;
        }
        curl_setopt_array($ch, (array)$options + $defaults);
        $ret = curl_exec($ch);
        $err = curl_error($ch);
        if (false === $ret || !empty($err)) {
            $errno = curl_errno($ch);
            $response->set('errorCode',$errno);
            $response->set('errorMsg',$err);
        }else{
            $response->set('contentType',curl_getinfo($ch,CURLINFO_CONTENT_TYPE));
            $statusCode=curl_getinfo($ch,CURLINFO_HTTP_CODE);
            $response->set('statusCode',$statusCode);
            if($statusCode==200) {
                $response->set('content', $ret);
            }else{
                $response->set('errorMsg',$ret);
            }
        }
        curl_close($ch);
        return $response;
    }
}

class Response
{
    private $errorCode;
    private $errorMsg;
    private $statusCode;
    private $content;
    private $contentType;
    private $header;
    private $cookie;

    public function __get($name)
    {
        if($name=='content' && str_starts_with($this->contentType,'application/json')){
            return json_decode($this->content,true);
        }
        return $this->$name;
    }

    public function set($name,$value)
    {
        $this->$name=$value;
    }

    public function isSuccess()
    {
        return $this->errorCode===null && $this->statusCode==200;
    }
}