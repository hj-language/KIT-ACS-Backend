const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
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

        // let randomNumber = verifyNumber(111111, 999999);
        // let emailTemplete;
        // ejs.renderFile(
        //     appDir + "/templates/mailContent.ejs",
        //     { auth: randomNumber },
        //     (err, data) => {
        //         if (err) console.log(err);
        //         emailTemplete = data;
        //     }
        // );

        // const transport = nodemailer.createTransport({
        //     service: "naver",
        //     host: "smtp.naver.com",
        //     auth: {
        //         user: process.env.NODEMAILER_USER,
        //         pass: process.env.NODEMAILER_PASS,
        //     },
        //     port: 587,
        //     tls: {
        //         rejectUnauthorized: false,
        //     },
        // });

        // let mailOption = {
        //     // 네이버로 하면 from을 @naver.com으로 설정해야 함; gmail로 바꿀까...
        //     // from: `[KIT-CE-CS test]`,
        //     from: `${process.env.NODEMAILER_USER}`,
        //     to: req.body.webmail,
        //     subject: "회원가입 test",
        //     html: emailTemplete,
        // };

        // transport.sendMail(mailOption, function (error, _) {
        //     if (error) console.log(error);
        //     // console.log("전송 완료 : ", info.response);
        //     transport.close();
        // });

        // 이메일 완료가 되면...
        // 이후에..

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
