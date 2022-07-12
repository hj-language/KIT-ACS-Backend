const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const User = require("../schemas/user");
const bcrypt = require("bcrypt");
const verifyUser = require("./middlewares/authorization").verifyUser;

const saltFactor = require("../secret.js").saltFactor;
// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 마이페이지 접속
router.get("/", verifyUser, async (req, res) => {
    const mypage = await User.findOne({ id: req.session.authorization });
    if (!mypage) {
        return res.status(403).send({ error: "Forbidden" });
    }
    try {
        Article.find({ author: mypage.id }, (err, article) => {
            if (err) console.log(err);
            else {
                const userMypage = {
                    id: mypage.id,
                    name: mypage.name,
                    email: mypage.webmail,
                    myArticle: article,
                };
                return res.status(200).json(userMypage);
            }
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
});

// 비밀번호 수정
// router.patch("/password", verifyUser, (req, res) =>{

router.patch("/password", verifyUser, async (req, res) => {
    User.findOne({ id: req.session.authorization }, async (err, user) => {
        await user.comparePassword(req.body.password, (_, isMatch) => {
            if (!isMatch) {
                return res.json({
                    message: "Wrong Password",
                });
            } else {
                User.findOneAndUpdate(
                    { id: req.session.authorization },
                    {
                        $set: {
                            password: bcrypt.hashSync(
                                req.body.newPassword,
                                saltFactor
                            ),
                        },
                    }
                ).exec();
                return res.status(201).json({
                    message: "OK",
                });
            }
        });
    });
});

module.exports = router;
