<?php
declare(strict_types=1);
namespace app\common\service\upload;

use app\common\library\Image;
use app\common\model\Attachment;
use app\common\service\UploadService;
use think\facade\Filesystem;
use app\common\library\Imgcompress;

class PublicUploadService extends UploadService{

    protected $config=[];

    protected $disks='local_public';

    private $imagetype=null;
    private $imagesize=null;
    private $imagewidth=null;
    private $imageheight=null;

    protected function putFile():array
    {
        $url=Filesystem::disk($this->disks)->putFile('',$this->file,function (){
            $fileName = date('Ymd'). DIRECTORY_SEPARATOR .md5(microtime(true) . rand(10000,99999));
            return $fileName;
        });
        if($this->isImage()) {
            $filepath = $this->file->getRealPath();
            $imageinfo = getimagesize($filepath);
            $this->imagesize = filesize($filepath);
            $this->imagewidth = $imageinfo[0];
            $this->imageheight = $imageinfo[1];
            $this->imagetype = $imageinfo['mime'];
        }
        $fullurl=request()->domain().'/upload/'.$url;
        return ['public/upload/'.$url,$fullurl];
    }

    /*
     * 生成缩略图
     * @param string $url 原图片的物理路径
     * @param string $fullurl 原图片的网络路径
     */
    protected function thumb(string $url,string $fullurl): string
    {
        if($this->imagewidth<=200 && $this->imageheight<=200){
            return $fullurl;
        }
        //计算缩放比例，保证缩略图的宽高都不超过200px
        $percent=min(200/$this->imagewidth,200/$this->imageheight);
        $filepath=root_path().$url;
        $ext=$this->file->extension();
        $writepath=substr($filepath,0,strrpos($filepath,'.'.$ext)).'_thumb.'.$ext;
        (new Imgcompress($filepath,$percent))->compressImg($writepath);
        $thumburl=substr($fullurl,0,strrpos($fullurl,'.'.$ext)).'_thumb.'.$ext;
        return $thumburl;
    }

    protected function compress(string $url,string $fullurl)
    {
        $filepath=root_path().$url;
        $percent=1;
        if($this->imagesize>1024*1024*5){
            $percent = 0.4;
        }else if($this->imagesize>1024*1024*4){
            $percent = 0.5;
        }else if($this->imagesize>1024*1024*3){
            $percent = 0.6;
        }else if($this->imagesize>1024*1024*2){
            $percent = 0.7;
        }else if($this->imagesize>1024*1024*1){
            $percent = 0.8;
        }else if($this->imagesize>1024*1024*0.8){
            $percent = 0.9;
        }
        if($percent!=1){
            $this->imagewidth=intval($this->imagewidth*$percent);
            $this->imageheight=intval($this->imageheight*$percent);
            (new Imgcompress($filepath,$percent))->compressImg($filepath);
            $this->imagesize=filesize($filepath);
        }
    }

    protected function imageFileinfo($url,$fullurl): array
    {
        return [$this->imagesize,$this->imagetype,$this->imagewidth,$this->imageheight];
    }

    protected function watermark(string $url,string $fullurl)
    {

    }

    public static function deleteFile(Attachment $attachment)
    {
        $filepath=root_path().$attachment->url;
        if(file_exists($filepath)){
            unlink($filepath);
        }
        if($attachment->is_image){
            $exten=strtolower(pathinfo($filepath,PATHINFO_EXTENSION));
            $thumbpath=str_replace('.'.$exten,'_thumb.'.$exten,$filepath);
            if(file_exists($thumbpath)){
                unlink($thumbpath);
            }
        }
    }
}