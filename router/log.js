const express = require("express")
const router = express.Router()
const User = require("../schemas/user")

router.post("/in", (req, res) => {
    if (req.session.authorization) {
        req.session.destroy(() => {
            res.status(400).json({ message: "Try again" })
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
            req.session.cookie.expires = new Date(Date.now() + 10 * 30000) // 30초
            res.status(200).send({ message: `Welcome! ${user.name}` })
        })
    })
})

router.delete("/out", (req, res) => {
    if (req.session.authorization) {
        req.session.destroy(() => {
            res.status(200).send({ message: "Goodbye!" })
        })
    } else {
        res.status(404).send({ message: "There is no session" })
    }
})

module.exports = router
