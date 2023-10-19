<?php
declare (strict_types = 1);

namespace app\common\library;

use Exception;
use think\facade\Config;

/**
 * 重写ThinkPHP分模板引擎
 */
class Template extends \think\Template
{
    private $includeFile = [];

    public function fetch(string $template, array $vars = []): void
    {
        if(strpos($template,'@')!==false){
            $modelname= substr($template,0,strpos($template,'@'));
            $this->config['view_path'] = root_path().'app'.DS.$modelname.DS.'view'.DS;
            $this->config['cache_path'] = root_path().'runtime'.DS.'temp'.DS;
            $template= substr($template,strpos($template,'@')+1);
            if(str_starts_with($template,'/')){
                $template= substr($template,1);
            }
        }else{
            $modelname= app('http')->getName();
            $this->config['view_path'] = root_path().'app'.DS.$modelname.DS.'view'.DS;
            $this->config['cache_path'] = root_path().'runtime'.DS.$modelname.DS.'temp'.DS;
        }
        if ($vars) {
            $this->data = array_merge($this->data, $vars);
        }
        if ($this->isCache($this->config['cache_id'])) {
            // 读取渲染缓存
            echo $this->cache->get($this->config['cache_id']);
            return;
        }

        $template = $this->parseTemplateFile($template);
        if ($template) {
            $cacheFile = $this->config['cache_path'] . $this->config['cache_prefix'] . md5($this->config['layout_on'] . $this->config['layout_name'] . $template) . '.' . ltrim($this->config['cache_suffix'], '.');
            if (!$this->checkCache($cacheFile)) {
                // 缓存无效 重新模板编译
                $content = file_get_contents($template);
                //处理vue包含标签
                $preg='/\{include\s+vue=[\'"](.*)[\'"]\s+\/\}/';
                $vuetemp='';
                preg_replace_callback($preg,function ($match) use (&$vuetemp){
                    $vuetemp=$match[1];
                },$content);
                if($vuetemp){
                    $this->fetch($vuetemp,$vars);
                    return;
                }else{
                    $this->compiler($content, $cacheFile);
                }
            }

            // 页面缓存
            ob_start();
            ob_implicit_flush(false);

            // 读取编译存储
            $this->storage->read($cacheFile, $this->data);

            // 获取并清空缓存
            $content = ob_get_clean();

            if (!empty($this->config['cache_id']) && $this->config['display_cache'] && null !== $this->cache) {
                // 缓存页面输出
                $this->cache->set($this->config['cache_id'], $content, $this->config['cache_time']);
            }

            echo $content;
        }
    }

    /**
     * 编译模板文件内容
     * @access private
     * @param  string $content 模板内容
     * @param  string $cacheFile 缓存文件名
     * @return void
     */
    private function compiler(string &$content, string $cacheFile): void
    {
        // 判断是否启用布局
        if ($this->config['layout_on']) {
            if (str_contains($content, '{__NOLAYOUT__}')) {
                // 可以单独定义不使用布局
                $content = str_replace('{__NOLAYOUT__}', '', $content);
            } else {
                // 读取布局模板
                $layoutFile = $this->parseTemplateFile($this->config['layout_name']);
                if ($layoutFile) {
                    $layoutContent=file_get_contents($layoutFile);
                    if($this->config['layout_name']=='layout'.DS.'vue'){
                        [$content, $jsfile, $cssfile] = $this->parseVue($content,$cacheFile);
                        $layoutContent = str_replace('{__CSS__}', $cssfile, $layoutContent);
                        $layoutContent = str_replace('{__JS__}', $jsfile, $layoutContent);
                    }
                    // 替换布局的主体内容
                    $content = str_replace($this->config['layout_item'], $content,$layoutContent);
                }
            }
        } else {
            $content = str_replace('{__NOLAYOUT__}', '', $content);
        }
        $this->compilerFileToPhp($content, $cacheFile);
        $this->includeFile = [];
    }

    private function parseVue(string $content,string $cacheFile): array
    {
        //删除注释
        $content=preg_replace('/<!--(.*)-->/Uis','',$content);
        $content=trim($content);
        if(!str_starts_with($content,'<template>')){
           throw new Exception(__('模板文件格式不正确'));
        }
        $preg='/<template>(.*)<\/template>/s';
        preg_match($preg,$content,$match);
        $template=$match[1];
        $content=trim(substr($content,strlen($match[0])));
        if(!str_starts_with($content,'<script>')){
            throw new Exception(__('模板文件格式不正确'));
        }
        $preg='/<script>(.*)<\/script>/s';
        preg_match($preg,$content,$match);
        $script=$match[1];
        $jsfile=$this->parseJS($script,$cacheFile);
        $content=trim(substr($content,strlen($match[0])));
        if(!str_starts_with($content,'<style>')){
            throw new Exception(__('模板文件格式不正确'));
        }
        $preg='/<style>(.*)<\/style>/s';
        preg_match($preg,$content,$match);
        $style=$match[1];
        $style=$this->parseCSS($style);
        return [$template,$jsfile,$style];
    }

    private function parseCSS(string $style):string
    {
        $preg='/@import\s+url\([\'"](.*)[\'"]\);/';
        $css=[];
        $style=preg_replace_callback($preg,function ($match) use (&$css){
            $url=$match[1];
            $css[]=$url;
            return '';
        },$style);
        $str='';
        foreach ($css as $item){
            $str.=<<<EOF
<link rel="stylesheet" href="{$item}"/>

EOF;
        }
        $style=trim($style);
        if($style) {
            $str .= <<<EOF
<style>
{$style}
</style>
EOF;
        }
        return $str;
    }

    //生成js文件
    private function parseJS(string $script,string $cacheFile):string
    {
        $domain=request()->domain();
        $preg='/import\s+(.*)\s+from\s+["\'](.*)["\'];/';
        $script=preg_replace_callback($preg,function ($match) use ($domain){
            $import=$match[1];
            $path=$match[2];
            $path=str_replace('@',$domain.'/assets/js/',$path);
            return 'import '.$import.' from "'.$path.'";';
        },$script);
        $cacheFile=str_replace('.php','-js.php',$cacheFile);
        $this->compilerFileToPhp($script,$cacheFile);
        //获取$cacheFile文件名
        $cacheFile=substr($cacheFile,strrpos($cacheFile,DS)+1);
        $cacheFile=str_replace('-js.php','',$cacheFile);
        return $cacheFile;
    }

    private function compilerFileToPhp(string $content,$cacheFile)
    {
        $this->parse($content);
        if ($this->config['strip_space']) {
            /* 去除html空格与换行 */
            $find    = ['~>\s+<~', '~>(\s+\n|\r)~'];
            $replace = ['><', '>'];
            $content = preg_replace($find, $replace, $content);
        }
        // 优化生成的php代码
        $content = preg_replace('/\?>\s*<\?php\s(?!echo\b|\bend)/s', '', $content);
        // 模板过滤输出
        $replace = $this->config['tpl_replace_string'];
        $content = str_replace(array_keys($replace), array_values($replace), $content);
        // 添加安全代码及模板引用记录
        $content = '<?php /*' . serialize($this->includeFile) . '*/ ?>' . "\n" . $content;
        // 编译存储
        $this->storage->write($cacheFile, $content);
        return $cacheFile;
    }
    /**
     * 解析模板文件名
     * @access private
     * @param  string $template 文件名
     * @return string
     */
    private function parseTemplateFile(string $template): string
    {
        if ('' == pathinfo($template, PATHINFO_EXTENSION)) {
            $template = str_replace(['/', ':'], $this->config['view_depr'], $template);
            $template = $this->config['view_path'] . $template . '.' . ltrim($this->config['view_suffix'], '.');
        }
        if (is_file($template)) {
            // 记录模板文件的更新时间
            $this->includeFile[$template] = filemtime($template);

            return $template;
        }

        throw new Exception('template not exists:' . $template);
    }

    /**
     * 检查编译缓存是否有效，如果无效则需要重新编译
     * @access private
     * @param  string $cacheFile 缓存文件名
     * @return bool
     */
    private function checkCache(string $cacheFile): bool
    {
        if (!$this->config['tpl_cache'] || !is_file($cacheFile) || !$handle = @fopen($cacheFile, "r")) {
            return false;
        }

        // 读取第一行
        $line = fgets($handle);

        if (false === $line) {
            return false;
        }

        preg_match('/\/\*(.+?)\*\//', $line, $matches);

        if (!isset($matches[1])) {
            return false;
        }

        $includeFile = unserialize($matches[1]);

        if (!is_array($includeFile)) {
            return false;
        }

        // 检查模板文件是否有更新
        foreach ($includeFile as $path => $time) {
            if (is_file($path) && filemtime($path) > $time) {
                // 模板文件如果有更新则缓存需要更新
                return false;
            }
        }

        // 检查编译存储是否有效
        return $this->storage->check($cacheFile, $this->config['cache_time']);
    }

}
