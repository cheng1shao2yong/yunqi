<?php
declare(strict_types=1);
namespace app\common\service\msg;

use app\common\service\MsgService;
use app\common\model\Msg;

class BackendMsg extends MsgService{

    protected $msg_type='backend';

    //消息icon
    private $icon='fa fa-file';
    //消息头部标题
    private $title='通知';
    //消息样式，包括primary,warning,success,error,info
    private $style='primary';

    protected function sendEvent(Msg $msg):bool
    {
        return true;
    }

    public function setMessageStyle(string $title,string $icon,string $style)
    {
        $this->icon=$icon;
        $this->title=$title;
        $this->style=$style;
        return $this;
    }
    /**
     * 发送普通消息
     * @param string $content 消息内容
     * @param int $send_to 接收者admin_id
     * @return void
     */
    public function sendNormalMessage(int $send_to,string $content)
    {
        $arr=[
            'style'=>$this->style,
            'icon'=>$this->icon,
            'title'=>$this->title,
            'content'=>$content
        ];
        $this->sendTo($send_to);
        $this->setContent(json_encode($arr,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
        $this->create();
    }

    /**
     * 发送一条打开新窗口的消息
     * @param string $content 消息内容
     * @param int $send_to 接收者admin_id
     * @param string $url 打开的新窗口的url
     * @return void
     */
    public function sendBlankMessage(int $send_to,string $content,string $url)
    {
        $arr=[
            'style'=>$this->style,
            'icon'=>$this->icon,
            'title'=>$this->title,
            'action'=>'link',
            'url'=>$url,
            'content'=>$content
        ];
        $this->sendTo($send_to);
        $this->setContent(json_encode($arr,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
        $this->create();
    }

    /**
     * 发送一条打开新选项卡消息
     * @param string $content 消息内容
     * @param int $send_to 接收者admin_id
     * @param string $url 打开的新窗口的url
     * @param array|string 当为字符串时为选项卡的url，当为array时为选项卡参数，url为必填，其他的可以省略，包括如：
     * [
     *     //当id等于菜单id时，会激活菜单
     *    'id'=>9,
     *    'title'=>'标题',
     *    'icon'=>'fa fa-envira',
     *    'url'=>'auth/admin'
     * ]
     *
     * @return void
     */
    public function sendAddTabsMessage(int $send_to,string $content,array|string $options=[],)
    {
        if(is_string($options)){
            $options=['url'=>$options];
        }
        $tabs=[
            'id'=>'',
            'title'=>$this->title,
            'icon'=>$this->icon,
        ];
        $options=array_merge($tabs,$options);
        if(!isset($options['url'])){
            throw new \Exception(__('选项卡url不能为空'));
        }
        $arr=[
            'style'=>$this->style,
            'icon'=>$this->icon,
            'title'=>$this->title,
            'action'=>'tab',
            'options'=>$options,
            'content'=>$content
        ];
        $this->sendTo($send_to);
        $this->setContent(json_encode($arr,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
        $this->create();
    }

    /**
     * 发送一条打开弹窗消息
     * @param string $content 消息内容
     * @param int $send_to 接收者admin_id
     * @param string $url 打开的新窗口的url
     * @param array|string 当为字符串时为选项卡的url，当为array时为弹窗参数，url为必填，其他的可以省略，包括如：
     * [
     *    //当id等于菜单id时，会激活菜单
     *   'id'=>9,
     *   'title'=>'fastadmin',
     *   'icon'=>'fa fa-facebook',
     *   'url'=>'general/profile',
     *   'width'=>800,
     *   'height'=>500,
     *   'expand'=>false
     * ]
     *
     * @return void
     */
    public function sendLayerMessage(int $send_to,string $content,array|string $options=[],)
    {
        if(is_string($options)){
            $options=['url'=>$options];
        }
        $layer=[
            'id'=>'',
            'title'=>$this->title,
            'icon'=>$this->icon,
            'width'=>800,
            'height'=>500,
            'expand'=>false
        ];
        $options=array_merge($layer,$options);
        if(!isset($options['url'])){
            throw new \Exception(__('选项卡url不能为空'));
        }
        $arr=[
            'style'=>$this->style,
            'icon'=>$this->icon,
            'title'=>$this->title,
            'action'=>'layer',
            'options'=>$options,
            'content'=>$content
        ];
        $this->sendTo($send_to);
        $this->setContent(json_encode($arr,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
        $this->create();
    }
}