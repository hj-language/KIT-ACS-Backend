const express = require("express")
const router = express.Router()
const Article = require("../schemas/comment")
const verifyUser = require("./middlewares/authorization").verifyUser

router.post("/", (req, res) => {
    console.log(req.body)
    let obj = new Article({
        articleId: req.body.articleId,
        author: req.body.author,
        date: req.body.date,
        content: req.body.content,
        changed: req.body.changed,
        recommentList: req.body.recommentList
    })
    obj.save((err) => console.log("error: ", err))
    Article.find((err, user) => {
        if (err) console.log(err)
        else console.log(user)
    });
    res.status(200).end()
});

module.exports = router