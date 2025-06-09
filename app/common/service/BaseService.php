<?php

declare(strict_types=1);

namespace app\common\service;

abstract class BaseService{

    protected static $service=[];

    protected static $obj=[];

    protected $safekey;

    /**
     * @param array $arr 参数
     * @param string $key 为创建线程安全对象的唯一识别key
     * @return mixed|static
     */
    public static function newInstance(array $arr=[],mixed $safekey=null)
    {
        $classname=$safekey??get_called_class();
        if(!isset(self::$service[$classname])){
            $service = new static();
            $service->safekey=$safekey;
            if(count($arr)>0){
                $service->setParam($arr);
            }
            self::$service[$classname]=$service;
            self::$obj[$classname]=[];
            try{
                $service->init();
            }catch (\Exception $e){
                $service->destroy();
                throw $e;
            }
        }
        return self::$service[$classname];
    }

    public function destroy()
    {
        $classname=$this->safekey??get_called_class();
        unset(self::$service[$classname]);
        unset(self::$obj[$classname]);
    }

    public function setParam(array $arr)
    {
        $class = new \ReflectionClass($this);
        $property=$class->getProperties();
        foreach($property as $value) {
             $key=$value->name;
             foreach ($arr as $pk=>$pv) {
                 if ($pk == $key) {
                     $attribute=$class->getProperty($key);
                     $attribute->setAccessible(true);
                     $attribute->setValue($this,$pv);
                 }
             }
        }
        return $this;
    }

    protected function setObj(string $classname,object $objval)
    {
        $class=$this->safekey??get_called_class();
        self::$obj[$class][$classname]=$objval;
    }

    protected function getObj(string $classname,bool $allowNull=false,string $message='')
    {
        $class=$this->safekey??get_called_class();
        if(!isset(self::$obj[$class][$classname])){
            if($allowNull){
                return null;
            }
            if($message){
                throw new \Exception($message);
            }else{
                throw new \Exception('系统异常，缺少对象'.$classname);
            }
        }
        return self::$obj[$class][$classname];
    }

    abstract protected function init();
}