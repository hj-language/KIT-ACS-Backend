const express = require("express")
const router = express.Router()
const User = require("../schemas/user")

router.get("/in", (req, res) => {
    req.session.authorization = "hyejin"
    req.session.cookie.expires = new Date(Date.now() + 10 * 30000) // 30초
    res.status(200).send(
        `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="http://localhost:3000/article" method="post" enctype="multipart/form-data">
        <input type="file" name="attach" multiple>
        <button type="submit">Submit</button>
    </form>
</body>
</html>
        `
    )
})

router.post("/in", (req, res) => {
    if (req.session.authorization) {
        req.session.destroy((e) => {
            if (e) {
                console.log("error: ", e)
                res.status(500).send({ message: "Server Error" })
            }
            else {
                res.status(400).json({ message: "Try again" })
            }
        })
        return
    }

    User.findOne({ id: req.body.id }, (e, user) => {
        if (e) {
            console.log("error: ", e)
            res.status(500).send({ message: "Server Error" })
        }

        if (!user || !user.verify) {
            return res.status(400).send({ message: "Invalid ID" })
        }

        user.comparePassword(req.body.password, (_, isMatch) => {
            if (!isMatch) {
                return res.status(400).send({ message: "Wrong ID or Password" })
            }
            req.session.authorization = user.id
            req.session.cookie.expires = new Date(Date.now() + 10 * 1000 * 60) // 10분
            res.json({
                class: user.class,
                message: `Welcome! ${user.name}`
            }).status(200)
        })
    })
})

router.delete("/out", (req, res) => {
    if (req.session.authorization) {
        // req.session.destroy(() => {
        //     res.status(200).send({ message: "Goodbye!" })
        // })
        req.session.destroy(() => {
            res.clearCookie('kit_acs', { domain: "kitacs.com", path: "/" });
            res.redirect('/');
        });
    } else {
        res.status(404).send({ message: "There is no session" })
    }
})

module.exports = router