const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

router.post("/in", (req, res) => {
    if (req.session.authorization) {
        // 이미 세션이 존재한다면
        req.session.destroy(() => {
            // 세션 삭제 후 다시 시도하게 함
            res.status(400).json({ message: "Try again" });
        });
        return;
    }

    User.findOne({ id: req.body.id }, (err, user) => {
        console.log(user);
        if (!user || !user.verify) {
            return res
                .json({
                    message: "Invalid ID",
                })
                .status(400);
        }
        user.comparePassword(req.body.password, (_, isMatch) => {
            if (!isMatch) {
                return res
                    .json({
                        message: "Wrong ID or Password",
                    })
                    .status(400);
            }
            req.session.authorization = user.id;
            (req.session.cookie.expires = new Date(Date.now() + 10 * 30000)), // 30초
                res.status(200).json({ message: `Welcome! ${user.name}` });
        });
    });
});

router.delete("/out", (req, res) => {
    console.log(req.session);
    if (req.session.authorization) {
        req.session.destroy(() => {
            res.status(200).json({ message: "Goodbye!" });
        });
    } else {
        res.status(400).json({ message: "There is no session" });
    }
});

module.exports = router;
