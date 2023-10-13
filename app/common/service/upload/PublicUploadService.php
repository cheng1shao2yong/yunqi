<?php
declare(strict_types=1);
namespace app\common\service\upload;

use app\common\library\Image;
use app\common\model\Attachment;
use app\common\service\UploadService;
use think\facade\Filesystem;

class PublicUploadService extends UploadService{

    protected $config=[];

    protected $disks='local_public';

    protected function putFile():array
    {
        $url=Filesystem::disk($this->disks)->putFile('',$this->file,'md5');
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
        [$filesize,$imagetype,$imagewidth,$imageheight]=$this->imageFileinfo($url,$fullurl);
        if($imagewidth<=300){
            return $fullurl;
        }
        $filepath=root_path().$url;
        $image = Image::open($filepath);
        $imagewidth=300;
        $ext=$this->file->extension();
        $imageheight=ceil($imageheight*$imagewidth/$imagewidth);//等比例缩放
        $writepath=substr($filepath,0,strrpos($filepath,'.'.$ext)).'_thumb.'.$ext;
        $image->thumb($imagewidth, $imageheight, Image::THUMB_CENTER)->save($writepath);
        $thumburl=substr($fullurl,0,strrpos($fullurl,'.'.$ext)).'_thumb.'.$ext;;
        return $thumburl;
    }

    protected function compress(string $url,string $fullurl)
    {
        $filepath=root_path().$url;
        $size=intval(filesize($filepath)/1024);
        $percent=1;
        if($size>1024*5){
            $percent = 0.4;
        }else if($size>1024*4){
            $percent = 0.5;
        }else if($size>1024*3){
            $percent = 0.6;
        }else if($size>1024*2){
            $percent = 0.7;
        }else if($size>1024*1){
            $percent = 0.8;
        }else if($size>1024*0.8){
            $percent = 0.9;
        }
        if($percent!=1){
            (new \app\common\library\Imgcompress($filepath,$percent))->compressImg($filepath);
        }
    }

    protected function watermark(string $url,string $fullurl)
    {

    }

    protected function imageFileinfo(string $url,string $fullurl): array
    {
        $filepath=root_path().$url;
        $filesize=filesize($filepath);
        $imageinfo=getimagesize($filepath);
        $imagetype=$imageinfo['mime'];
        $imagewidth=$imageinfo[0];
        $imageheight=$imageinfo[1];
        return [$filesize,$imagetype,$imagewidth,$imageheight];
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