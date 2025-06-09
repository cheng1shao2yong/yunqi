<?php
declare(strict_types=1);

namespace app\common\service;


use app\common\model\Attachment;

/**
 * 上传文件服务
 */
abstract class UploadService extends BaseService
{
    //上传配置
    protected $config = [
        'cdnurl' => '',
        'maxsize' => 2,
        'mimetype' => 'jpg,png,bmp,jpeg,gif',
        'thumb' => false,
        'compress' => false,
        'watermark'=>false
    ];
    //存储方式
    protected $disks;


    /* @var \think\File $file */
    protected $file;

    protected $category;
    protected $admin_id;
    protected $user_id;

    //保存文件
    abstract protected function putFile():array;
    //生成缩略图
    abstract protected function thumb(string $url,string $fullurl):string;
    //压缩图片
    abstract protected function compress(string $url,string $fullurl);
    //图片加水印
    abstract protected function watermark(string $url,string $fullurl);
    abstract protected function imageFileinfo(string $url,string $fullurl);
    //删除文件
    abstract public static function deleteFile(Attachment $attachment);

    //检查文件
    public function save()
    {
        $sha1 = $this->file->sha1();
        $weigh=Attachment::max('weigh');
        $attachment = Attachment::where(['sha1'=>$sha1,'storage'=>$this->disks])->find();
        if ($attachment) {
            $attachment->weigh=$weigh+1;
            $attachment->category=$this->category;
            $attachment->save();
            return [
                'url'=>$attachment->url,
                'fullurl'=>$attachment->fullurl,
                'thumburl'=>$attachment->thumburl
            ];
        }
        [$url,$fullurl] = $this->putFile();
        $thumburl=$this->getThumbUrl($fullurl);
        $imagetype=null;
        $imagewidth=null;
        $imageheight=null;
        $filesize=$this->file->getSize();
        if($this->isImage()){
            if($this->config['thumb']){
                $thumburl=$this->thumb($url,$fullurl);
            }
            if($this->config['compress']){
                $this->compress($url,$fullurl);
            }
            if($this->config['watermark']){
                $this->watermark($url,$fullurl);
            }
            //重新获取处理后的图片信息
            [$filesize,$imagetype,$imagewidth,$imageheight] = $this->imageFileinfo($url,$fullurl);
        }
        $attachment = new Attachment();
        $time = time();
        $attachment->save([
            'category' => $this->category,
            'admin_id' => $this->admin_id,
            'user_id' => $this->user_id,
            'url' => $url,
            'fullurl' => $fullurl,
            'thumburl' => $thumburl,
            'is_image' => $this->isImage() ? 1 : 0,
            'imagetype'=>$imagetype,
            'imagewidth'=>$imagewidth,
            'imageheight'=>$imageheight,
            'filename'=>$this->file->getOriginalName(),
            'filesize'=>$filesize,
            'storage' => $this->disks,
            'sha1' => $sha1,
            'weigh'=>$weigh,
            'uploadtime'=>$time,
            'createtime'=>$time,
            'updatetime'=>$time
        ]);
        return [
            'url'=>$url,
            'fullurl'=>$fullurl,
            'thumburl'=>$thumburl
        ];
    }

    protected function init()
    {
        if (!$this->file) {
            throw new \Exception(__('上传文件不存在'));
        }
        //验证文件$this->file
        $maxsize = $this->config['maxsize'];
        $mimetype = $this->config['mimetype'];
        $ext = strtolower($this->file->extension());
        $size = $this->file->getSize();
        if ($size > $maxsize * 1024 * 1024) {
            throw new \Exception(__('上传文件大小超过限制'));
        }
        if (!in_array($ext, explode(',', $mimetype))) {
            throw new \Exception(__('上传文件类型不允许'));
        }
    }

    protected function isImage():bool
    {
        $ext = $this->file->extension();
        $ext= strtolower($ext);
        if (in_array($ext, ['jpg', 'png', 'bmp', 'jpeg', 'gif'])) {
             return true;
        }
        return false;
    }

    protected function getThumbUrl(string $fullurl):string
    {
        $domain=request()->domain();
        $ext = $this->file->extension();
        if (in_array($ext, ['jpg', 'png', 'bmp', 'jpeg', 'gif'])) {
            return $fullurl;
        }else if (in_array($ext, ['doc', 'docx'])) {
            return $domain.'/assets/img/fileicon/doc.png';
        }else if (in_array($ext, ['ppt', 'pptx'])) {
            return $domain.'/assets/img/fileicon/ppt.png';
        }else if (in_array($ext, ['xls', 'xlsx'])) {
            return $domain.'/assets/img/fileicon/xls.png';
        }else if (in_array($ext, ['mp3','wav','wma','ogg'])) {
            return $domain.'/assets/img/fileicon/audio.png';
        }else if (in_array($ext, ['mp4', 'avi', 'rmvb','swf', 'flv','rm', 'ram', 'mpeg', 'mpg', 'wmv', 'mov'])) {
            return $domain.'/assets/img/fileicon/video.png';
        }else if (in_array($ext, ['zip', 'rar', '7z', 'gz', 'tar'])) {
            return $domain.'/assets/img/fileicon/zip.png';
        }else if(in_array($ext,['apk','tiff','exe','html','pdf','psd','visio','svg','txt','xml'])){
            return $domain.'/assets/img/fileicon/'.$ext.'.png';
        }else{
            return $domain.'/assets/img/fileicon/wz.png';
        }
    }
}