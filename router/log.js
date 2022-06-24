const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

router.post("/in", (req, res) => {
    let userName = "";

    User.findOne({ id: req.body.id }, (err, user) => {
        if (!user) {
            return res.json({
                message: "Invalid ID",
            });
        }
        user.comparePassword(req.body.password, (_, isMatch) => {
            if (!isMatch) {
                return res.json({
                    message: "Wrong ID or Password",
                });
            }
            userName = user.name;
            res.status(200)
                .json({ message: `Welcome! ${userName}` })
                .end();
        });
    });
});

module.exports = router;