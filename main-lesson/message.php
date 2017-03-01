<?php
//Принимаем постовые данные
$whatever=$_POST['whatever'];
$username=$_POST['username'];
$useremail=$_POST['useremail'];
$user_message=$_POST['user_message'];
//Тут указываем на какой ящик посылать письмо
$to = "drudanya@yandex.ru";
//Далее идет тема и само сообщение
// Тема письма
$subject = "Заявка с сайта";
// Сообщение письма
$message = "
Заполненая форма: ".htmlspecialchars($whatever)."<br />
Имя пользователя: ".htmlspecialchars($username)."<br />
Email: ".htmlspecialchars($useremail)."<br />
Сообщение: ".htmlspecialchars($user_message);
// Отправляем письмо при помощи функции mail();
$headers = "From: daniladruzhinin.sl <drudanya@yandex.ru>\r\nContent-type: text/html; charset=UTF-8 \r\n";
mail ($to, $subject, $message, $headers);
// Перенаправляем человека на страницу благодарности и завершаем скрипт
header('Location : thanks.html')
exit();
?>