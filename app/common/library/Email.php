<?php

namespace app\common\library;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Email
{
    private static $instance;

    /* @var PHPMailer $mail*/
    private $mail;

    public function __construct()
    {
        $mail=new PHPMailer(true);
        $config=site_config('email');
        $mail->CharSet ="UTF-8";
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_user'];
        $mail->Password = $config['smtp_pass'];
        $mail->SMTPSecure = $config['verify_type'];
        $mail->Port = $config['smtp_port'];
        $mail->setFrom($config['send_user']);
        $mail->addReplyTo($config['send_user']);
        $this->mail=$mail;
    }

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function send(string $to,string $subject,string $body,string $html=null)
    {
        $this->mail->addAddress($to);
        $this->mail->Subject=$subject;
        if($html){
            $this->mail->isHTML();
            $this->mail->Body=$html;
            $this->mail->AltBody=$body;
        }else{
            $this->mail->isHTML(false);
            $this->mail->Body=$body;
        }
        $this->mail->send();
    }
}
