const express = require("express")
const router = express.Router()
const User = require("../schemas/user")

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

router.delete("/out", async (req, res) => {
    if (req.session.authorization) {
        // req.session.destroy(() => {
        //     res.status(200).send({ message: "Goodbye!" })
        // })
        console.log(0);
        req.session.destroy(() => {
            console.log(1);
            req.session;
            console.log(2);
        });
        console.log(3);
        res.clearCookie('kit_acs', { domain: "kitacs.com", path: "/" });
        console.log(4);
        res.status(200).redirect('/');
        console.log(5);
    } else {
        console.log(6);
        res.status(404).send({ message: "There is no session" })
    }
})

module.exports = router