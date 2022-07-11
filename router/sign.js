const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const nodemailer = require("nodemailer");
const verifyEmail = require("../secret.js").verifyEmail;
const crypto = require("crypto");
require("dotenv").config();

//const path = require("path");
// var appDir = path.dirname(require.main.filename);

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
    User.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
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
         *
         *  인증사이트 링크 클릭을 통해 인증
         */

        const toHash = `${req.body.id}${req.body.name}${req.body.webmail}`;
        const code = crypto.createHash("sha256").update(toHash).digest("hex");

        let transporter = nodemailer.createTransport({
            service: "naver",
            auth: {
                user: verifyEmail.id,
                pass: verifyEmail.pw,
            },
        });

        let mailOptions = {
            from: verifyEmail.id,
            to: email, // 대상 메일 주소 req.body.email
            subject: "[ACS]Authorization Test Mail", // 메일 제목
            html: `
            <div style="border: black 2px solid; border-radius: 1rem; margin-right: 1rem; padding: 1rem; text-align: center; max-width: 500px;">
                <div style="font-size: 2rem">이메일 인증</div></br>
                <div style="font-size: 1.2rem">
                    아래 버튼을 눌러 인증을 완료해주세요.
                </div>
                </br>
                <div style="margin: 0.2rem;">
                    <a 
                        style="background-color: lightblue; border-radius: 10px; padding: 0.5rem;"
                        href='http://localhost:3000/sign/confirmEmail?code=${code}&email=${email}'>이메일 인증하기</a>
                </div>
            </div>
            `,
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log("Email sent: " + info.response);
            }
            transporter.close();
        });

        let user = new User({
            id: req.body.id,
            password: req.body.password,
            name: req.body.name,
            webmail: req.body.webmail,
            verify: false,
        });
        user.save((err) => console.log("error: ", err));

        res.status(201).send("사용자 가입 완료");
    } catch (err) {}
});

// 아이디 중복 확인
router.get("/dupId", (req, res) => {

})

// 이메일 중복 확인
router.get("/dupEmail", (req, res) => {

})

// 이메일 인증
router.get("/confirmEmail", (req, res) => {
    userConfirm = User.findOne({ webmail: req.query.email }, (err, user) => {
        const _id = user._id;

        const toHash = `${user.id}${user.name}${user.webmail}`;
        const verify = crypto.createHash("sha256").update(toHash).digest("hex");

        if (verify === req.query.code) {
            User.findByIdAndUpdate(_id, { $set: { verify: true } }).exec();
            return res.status(200).send("인증이 완료되었습니다.");
        } else {
            return res.status(403);
        }
    });
});

module.exports = router;
