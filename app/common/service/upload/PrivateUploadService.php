<?php
declare(strict_types=1);
namespace app\common\service\upload;

use app\common\model\Attachment;
use app\common\service\UploadService;
use think\facade\Filesystem;
use app\common\library\Image;

class PrivateUploadService extends UploadService{

    protected $config=[];

    protected $disks='local_private';

    protected function init(){
        $this->config=config('yunqi.upload');
        parent::init();
    }

    protected function putFile():array
    {
        $url=Filesystem::disk($this->disks)->putFile('',$this->file,'md5');
        $alismodel=get_module_alis();
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

    protected function thumb(string $url,string $fullurl): string
    {
        return $this->getThumbUrl();
    }

    protected function compress(string $url,string $fullurl)
    {

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
}