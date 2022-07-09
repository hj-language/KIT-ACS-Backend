const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const verifyUser = require("./middlewares/authorization").verifyUser;

// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 게시물 추가
router.post("/", verifyUser, (req, res) => {
    let obj = new Article({
        title: req.body.title,
        author: req.session.authorization,
        tag: req.body.tag,
        content: req.body.content,
        views: 0,
        commentList: req.body.commentList,
    });
    obj.save((err) => {
        if (err) {
            console.log("error: ", err);
            return res.status(500)
                .json({ message: "Server Error" })
                .end();
        } else {
            res.status(200)
                .json({ message: "Success" })
                .end();
        }
    });
    
});

// 전체 게시물 조회
router.get("/", async (req, res) => {
    try {
        // Article.find((err, user) => {
        //     if (err) console.log(err);
        //     else console.log(user);
        // });

        const results = await Article.find({ ...Article });
        return res.json(results).status(200);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
});

// 특정(_id) 게시물 조회
// 이전글 다음글도 가져오는걸 여기서 구해야 하나,,,?
router.get("/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const results = await Article.findOne({ _id, ...Article });
        // console.log(results);

        const nextPost = await Article.find({
            date: { $gt: results.date },
        }).limit(1);
        const prevPost = await Article.find({
            date: { $lt: results.date },
        })
            .sort({ _id: -1 })
            .limit(1);

        // console.log("next : ", nextPost);
        // console.log("prev : ", prevPost);

        await Article.findByIdAndUpdate(_id, {
            $set: { views: ++results.views },
        }).exec();

        return res.json({ results, nextPost, prevPost }).status(200);
        // res.render("post", { posts: results });
    } catch (e) {
        return res.status(404).send("No post");
    }
});

// 게시물 update (_id 기반)
router.patch("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id;

    // 수정 권한 조회
    try {
        const results = await Article.findOne({ _id, ...Article });
        console.log(results);
        if (req.session.authorization != results.author)
            return res.status(401).send({ error: "No permission" });
    } catch (e) {
        console.log(e)
        return res.status(500).send();
    }
        
    const article = Object.keys(req.body);
    const allowedUpdates = ["title", "content"]; // 변경 가능한 것 (제목, 내용)

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
        const edit = await Article.findByIdAndUpdate(_id, req.body, {
            new: true,
        });
        if (!edit) {
            return res.status(404).send();
        }
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

// 게시물 삭제 (_id 기반)
router.delete("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id;

    // 삭제 권한 조회
    const results = await Article.findOne({ _id, ...Article });
    if (req.session.authorization != results.author)
        return res.status(401).send({ error: "No permission" });

    try {
        const post = await Article.findByIdAndDelete(_id);
        if (!post) {
            return res.status(404).send();
        }
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
