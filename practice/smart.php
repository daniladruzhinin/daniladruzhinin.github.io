<?php 

$whatever = $_POST['whatever'];
$username = $_POST['username'];
$email = $_POST['email'];
$user_message = $_POST['user_message'];

require_once('phpmailer/PHPMailerAutoload.php');
$mail = new PHPMailer;
$mail->CharSet = 'utf-8';

//$mail->SMTPDebug = 3;                               // Enable verbose debug output

$mail->isSMTP();                                      // Set mailer to use SMTP
$mail->Host = 'smtp.mail.ru';  // Specify main and backup SMTP servers
$mail->SMTPAuth = true;                               // Enable SMTP authentication
$mail->Username = 'valievsavva@mail.ru';                 // SMTP username
$mail->Password = 'здесь пароль от почты, которая на строке выше';                           // SMTP password
$mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
$mail->Port = 465;                                    // TCP port to connect to

$mail->setFrom('valievsavva@mail.ru', 'smart-agency-page');

//$mail->From = $email;
//$mail->FromName =  $username;
$mail->addAddress('valiev1301saveliy@gmail.com', 'Savva');     // Add a recipient
//$mail->addAddress('ellen@example.com');               // Name is optional
//$mail->addReplyTo('info@example.com', 'Information');
//$mail->addCC('cc@example.com');
//$mail->addBCC('bcc@example.com');
//$mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
//$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
$mail->isHTML(true);                                  // Set email format to HTML

$mail->Subject = $whatever;
$mail->Body = "<b>Имя:</b> {$_POST['username']} <br> <b>Email:</b> {$_POST['email']} <br> <b>Сообщение:</b> {$_POST['user_message']}";
// ///////////////////////////////////////////////////$mail->Body    = $user_message;
$mail->AltBody = 'Это сообщение в формате plain text';

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
	header('location: thanks.html');
}

?>