<?php

declare(strict_types=1);

namespace app\common\service;

abstract class BaseService{

    private static $service=[];

    private static $obj=[];

    public static function newInstance(array $arr=[])
    {
        $classname=get_called_class();
        if(!isset(self::$service[$classname])){
            $service = new static();
            if(count($arr)>0){
                $service->setParam($arr);
            }
            self::$service[$classname]=$service;
            self::$obj[$classname]=[];
            $service->init();
        }
        return self::$service[$classname];
    }

    public function destroy()
    {
        $classname=get_called_class();
        unset(self::$service[$classname]);
    }

    private function setParam(array $arr)
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
        $class=get_called_class();
        self::$obj[$class][$classname]=$objval;
    }

    protected function getObj(string $classname,string $message='')
    {
        $class=get_called_class();
        if(!isset(self::$obj[$class][$classname])){
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