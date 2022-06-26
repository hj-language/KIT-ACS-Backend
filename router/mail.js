const express = require("express");
const mail = require("nodemailer");
const router = express.Router();

router.post("", function(req, res, next){
    let email = req.body.email;

    let transporter = mail.createTransport({
        service: 'naver',
        auth: {
            user: '사용할 호스트 메일 주소',
            pass: '호스트 메일 계정 비밀번호'
        }
    });
    
    let mailOptions = {
        from: '호스트 메일 ID',
        to: email, // 대상 메일 주소 req.body.email
        subject: '[CE-CS]Authorization Test Mail', // 메일 제목
        text: 'testnum' // 메일 내용
    };

    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            console.log(err);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
    // 응답 구현 해야함
    //res.redirect("/");
    res.status(200).end();
})

module.exports = router;