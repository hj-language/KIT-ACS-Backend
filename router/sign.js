const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const verifyEmail = require("../secret.js").verifyEmail;
require("dotenv").config();

var appDir = path.dirname(require.main.filename);

let verifyNumber = function (min, max) {
    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
};

router.post("/del", (req, res) => {
    User.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
    User.collection.deleteMany({ name: "박준수" });
    User.collection.deleteMany({ webmail: "pks5294@kumoh.ac.kr" });
    res.status(200).end();
});

router.post("/", async (req, res) => {
    // console.log(req.body.password);
    try {
        const dupId = await User.findOne({ id: req.body.id });
        const dupName = await User.findOne({ name: req.body.name });
        const dupEmail = await User.findOne({ webmail: req.body.webmail });
        if (dupId) return res.status(403).send("사용중인 아이디입니다.");
        if (dupName) return res.status(403).send("사용중인 닉네임입니다.");
        if (dupEmail)
            return res.status(403).send("이미 가입된 회원정보가 존재합니다.");
        
        let email = req.body.webmail;
        const emailValid = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@kumoh\.ac.kr$/;
        
        if (!emailValid.test(email)) {
            return res.json({
                message: "금오공과대학교 웹메일을 통한 가입만 가능합니다 :)",
            });
        }

        /**
         * 인증방법
         *  1. 인증번호를 통한 이메일 인증?
         *  2. 인증사이트 링크 클릭을 통해 인증?
         */
        
        let transporter = nodemailer.createTransport({
            service: 'naver',
            auth: {
                user: verifyEmail.id,
                pass: verifyEmail.pw
            }
        });
        
        let mailOptions = {
            from: verifyEmail.id,
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

        let user = new User({
            id: req.body.id,
            password: req.body.password,
            name: req.body.name,
            webmail: req.body.webmail,
        });
        user.save((err) => console.log("error: ", err));

        res.status(201).send("사용자 가입 완료");
    } catch (err) {}
});

router.get("/confirmEmail", (req, res) => {});

module.exports = router;
