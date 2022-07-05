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
        commentList: req.body.commentList,
    });
    obj.save((err) => console.log("error: ", err));
    Article.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
    res.status(200).end();
});

// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 전체 게시물 조회
router.get("/", async (req, res) => {
    try {
        const results = await Article.find({ ...Article });
        // console.log(results);
        return res.json(results).status(200);

        // res.render({ posts: results })
        // res.status(200).end();
    } catch (e) {
        return res.status(500).send();
    }
});

// 특정(_id) 게시물 조회
router.get("/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const results = await Article.findOne({ _id, ...Article });
        if (!results) {
            return res.status(404).send();
        }
        // console.log(results);
        return res.json(results).status(200);
        // res.render("post", { posts: results });
    } catch (e) {
        return res.status(500).send();
    }
});

// 게시물 update (_id 기반)
router.patch("/:id", async (req, res) => {
    const article = Object.keys(req.body);
    const allowedUpdates = ["title", "content"]; // 변경 가능한 것 (제목, 내용)
    // console.log(article);

    // patch 보낼 때 변경 가능한 거만 보내기
    // {
    // 	"title": "test WR3",
    // 	"content": "UPDATE"
    // }
    const updateValid = article.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!updateValid) {
        return res.status(400).send({ error: "Cannot Update" });
    }

    try {
        const edit = await Article.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!edit) {
            return res.status(404).send();
        }
        res.send(edit);
    } catch (e) {
        res.status(400).send(e);
    }
});

// 게시물 삭제 (_id 기반)
router.delete("/:id", async (req, res) => {
    try {
        const post = await Article.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).send();
        }
        res.send(post);
    } catch (e) {
        res.status(500).send();
    }
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
