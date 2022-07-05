const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const verifyUser = require("./middlewares/authorization").verifyUser;

router.post("/", (req, res) => {
    console.log(req.body);
    let obj = new Article({
        title: req.body.title,
        author: req.body.author,
        date: req.body.date,
        tag: req.body.tag,
        content: req.body.content,
        views: req.body.views,
        commentList: req.body.commentList
    });
    obj.save((err) => console.log("error: ", err));
    Article.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
    res.status(200).end();
});

/*

router.get("/test-getSession", (req, res) => {
    const id = req.query.id;
    if (req.session.authorization) {
        req.session.destroy(() => {
            res.status(400)
            .json({ message: 'Try again'})
            .end();
        })
    } else {
        req.session.authorization = id;
        req.session.cookie.expires = new Date(Date.now() + 30000), // 30초
        console.log(req.session);
        req.session.save(err => console.log(err));
        res.status(200)
        .json({ message: `Welcome! ${id}` })
        .end();
    }
})

router.get("/test-confirmSession", verifyUser, (req, res) =>{
    res.send({message: "success"});
})

router.get("/test-deleteSession", (req, res) => {
    if (req.session.authorization) {
        req.session.destroy(() => {
            res.status(200)
            .json({ message: 'Goodbye!'})
            .end();
        })
    }
    else {
        res.status(400).json({message: "There is no session"}).end();
    }
})

*/

module.exports = router;