<?php
declare(strict_types=1);
namespace app\api\middleware;

class AllowCrossDomain{
    public function handle($request, \Closure $next)
    {
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Token");
        header('Access-Control-Allow-Methods: GET, POST, PUT,DELETE,OPTIONS,PATCH');
        return $next($request);
    }
}