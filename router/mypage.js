const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const User = require("../schemas/user")
const bcrypt = require("bcrypt")
const verifyUser = require("./middlewares/authorization").verifyUser
const saltFactor = require("../secret.js").saltFactor

// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 마이페이지 접속
router.get("/", verifyUser, async (req, res) => {
    const user = await User.findOne({ id: req.session.authorization })
    if (!user) {
        return res.status(403).send({ message: "Forbidden" })
    }

    try {
        Article.find({ author: user.id }, (e, article) => {
            if (e) {
                console.log("error: ", e)
                res.status(500).send({ message: "Server Error" })
            } else {
                const userMypage = {
                    id: user.id,
                    name: user.name,
                    email: user.webmail,
                    article: article,
                }
                res.status(200).json(userMypage)
            }
        })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 비밀번호 수정
router.patch("/password", verifyUser, async (req, res) => {
    User.findOne({ id: req.session.authorization }, async (e, user) => {
        if (e) {
            console.log("error: ", e)
            return res.status(500).send({ message: "Server Error" })
        }
        await user.comparePassword(req.body.password, (_, isMatch) => {
            if (!isMatch) {
                return res.status(400).send({ message: "Wrong Password" })
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
                ).exec()
                return res.status(200).send({ message: "OK" })
            }
        })
    })
})

module.exports = router
