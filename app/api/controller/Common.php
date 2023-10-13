<?php
declare(strict_types=1);

namespace app\api\controller;

use app\common\controller\Api;
use think\annotation\route\Post;
use think\annotation\route\Group;
use app\common\service\upload\PublicUploadService;

#[Group("common")]
class Common extends Api{
    protected $noNeedLogin = ['*'];
    /**
     * 上传文件
     * @param File $file 文件流
     */
    #[Post('upload')]
    public function upload()
    {
        $file = $this->request->file('file');
        try{
            $savename=PublicUploadService::newInstance([
                'config'=>config('site.upload'),
                'user_id'=>$this->auth->id,
                'file'=>$file
            ])->save();
        }catch (\Exception $e){
            $this->error(__('上传文件出错'),[
                'file'=>$e->getFile(),
                'line'=>$e->getLine(),
                'msg'=>$e->getMessage()
            ]);
        }
        $this->success('',$savename);
    }
}