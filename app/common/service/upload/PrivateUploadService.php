<?php
declare(strict_types=1);
namespace app\common\service\upload;

use app\common\library\Imgcompress;
use app\common\model\Attachment;
use app\common\service\UploadService;
use think\facade\Filesystem;

class PrivateUploadService extends UploadService{

    protected $config=[];

    protected $disks='local_private';

    private $imagetype=null;
    private $imagesize=null;
    private $imagewidth=null;
    private $imageheight=null;

    protected function putFile():array
    {
        $url=Filesystem::disk($this->disks)->putFile(date('Ymd'),$this->file,'md5');
        if($this->isImage()) {
            $filepath = $this->file->getRealPath();
            $imageinfo = getimagesize($filepath);
            $this->imagesize = filesize($filepath);
            $this->imagewidth = $imageinfo[0];
            $this->imageheight = $imageinfo[1];
            $this->imagetype = $imageinfo['mime'];
        }
        $alismodel=get_module_alis('admin');
        $sha1=$this->file->sha1();
        $fullurl=request()->domain().'/'.$alismodel.'/ajax/readfile?sha1='.$sha1;
        return ['storage/'.$url,$fullurl];
    }

    public static function deleteFile(Attachment $attachment)
    {
        $filepath=root_path().$attachment->url;
        if(file_exists($filepath)){
            unlink($filepath);
        }
    }

    protected function imageFileinfo($url,$fullurl): array
    {
        return [$this->imagesize,$this->imagetype,$this->imagewidth,$this->imageheight];
    }

    protected function thumb(string $url,string $fullurl): string
    {
        return request()->domain().'/assets/img/fileicon/image.png';
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

    protected function watermark(string $url,string $fullurl)
    {

    }
}