<?php
declare(strict_types=1);
namespace app\common\service;

use app\common\model\Msg;

/**
 * 消息服务
 */
abstract class MsgService extends BaseService{

    protected $msg_type;

    protected $content;

    protected $send_to;

    protected string $error;

    //发送消息事件
    abstract protected function sendEvent(Msg $msg):bool;

    public function setContent(string $content):MsgService
    {
        $this->content=$content;
        return $this;
    }
    public function sendTo(mixed $send_to):MsgService
    {
        $this->send_to=$send_to;
        return $this;
    }

    protected function init()
    {
        if($this->msg_type === null){
            throw new \Exception(__('消息类型不能为空'));
        }
    }
    //生成消息
    public function create(string $content='',mixed $send_to='')
    {
        if($content){
            $this->content=$content;
        }
        if($send_to){
            $this->send_to=$send_to;
        }
        if($this->content === null){
            throw new \Exception(__('消息内容不能为空'));
        }
        if($this->send_to === null){
            throw new \Exception(__('消息接收者不能为空'));
        }
        $classname=get_called_class();
        $send_to=$this->send_to;
        if(!is_array($this->send_to)){
            $send_to=[$send_to];
        }
        $insert=[];
        foreach ($send_to as $v){
            $insert[]=[
                'msg_type'=>$this->msg_type,
                'handle'=>$classname,
                'send_to'=>$v,
                'content'=>$this->content,
                'status'=>0
            ];
        }
        (new Msg())->saveAll($insert);
    }
    //发送消息
    public function send(Msg $msg)
    {
        if($this->sendEvent($msg)){
            $msg->status=1;
            $msg->save();
        }else{
            $msg->status=-1;
            $msg->error=$this->getError();
            $msg->save();
        }
    }
    //读取消息，支持数字id或数组id
    public function read(mixed $msg_id)
    {
        if(is_array($msg_id)){
            Msg::where('id','in',$msg_id)->update(['status'=>2]);
        }else{
            Msg::where('id',$msg_id)->update(['status'=>2]);
        }
    }
    //读取全部消息
    public function readall(mixed $send_to)
    {
        Msg::where(['msg_type'=>$this->msg_type,'send_to'=>$send_to])->update(['status'=>2]);
    }

    /**
     * 获取消息列表，isread为null时获取全部消息，isread为true时获取已读消息，为false时获取未读消息
     * @param int $page
     * @param int $limit
     */
    public function list(mixed $send_to,int $page=1,int $limit=10,mixed $isread=null):array
    {
        $where=function ($query) use ($send_to,$isread){
            $query->where('msg_type','=',$this->msg_type);
            $query->where('send_to','=',$send_to);
            if($isread===null){
                $query->where('status','in',[1,2]);
            }
            if($isread===true){
                $query->where('status','=',2);
            }
            if($isread===false){
                $query->where('status','=',1);
            }
        };
        $list=Msg::where($where)->order('id desc')->limit(($page-1)*$limit,$limit)->select()->toArray();
        $r=[];
        foreach ($list as $v){
            $obj=[
                'id'=>$v['id'],
                'createtime'=>$v['createtime'],
            ];
            if(str_starts_with($v['content'],'{') && str_ends_with($v['content'],'}')){
                $obj=array_merge($obj,json_decode($v['content'],true));
            }else{
                $obj['content']=$v['content'];
            }
            $r[]=$obj;
        }
        return $r;
    }

    public function getError()
    {
        return $this->error;
    }
}