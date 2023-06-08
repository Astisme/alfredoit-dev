<?php

$name = $_POST["name"];
$subject = $_POST["subject"];
$mail = $_POST["_replyto"];
$message = $_POST["mail-message"];

require "vendor/autoload.php";
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$mailClient = new PHPMailer(true);
$mailClient->SMTPDebug = SMTP::DEBUG_SERVER;

$mailClient->isSMTP();
$mailClient->SMTPAuth = true;

$mailClient->Host = "smtp.gmail.com";
$mailClient->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mailClient->Port = 587;

$mailClient->Username = "20033498@studenti.uniupo.it";
$mailClient->Password = "Genitore1/Genytore2";

$mailClient->setFrom($mail, $name);
$mailClient->addAddress("alfredoc@duck.com", "alfreo");
$mailClient->Subject = $subject;
$mailClient->Body = $message;

$mailClient->send();

//header("Location: /pages/contacts/index.mdx");
echo "Message sent!";

