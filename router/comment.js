const express = require("express")
const router = express.Router()
const Comment = require("../schemas/comment")
const Article = require("../schemas/article")
const verifyUser = require("./middlewares/authorization").verifyUser


//댓글 추가
router.post("/:id", async (req, res) => {
    const articleId = req.params.id

    let newComment = new Comment({
        articleId: articleId,
        author: req.body.author,
        content: req.body.content
    })

    newComment.save((e) => {
        if (e) {
            console.log("error: ", e)
            res.status(500).send({ message: "Server Error" })
        } else {
            res.status(200).send({ message: "Success" })
        }
    })

    /*
    let article = await Article.findOne({ articleId, ...Article }).exec()
    let commentList = article.commentList.push(newComment._id)
    let searchDoc = { _id: ObjectID( _id )};
    await Article.findByIdAndReplace(articleId,
        {  } },
        { upsert: true }).exec();
    */
    await Article.findByIdAndUpdate(articleId,
        { $push: { commentList: newComment._id } }).exec();
});

// 전체 댓글 조회
router.get("/:id", async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.id })
        res.json(comments).status(200)
        console.log(comments)
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 댓글 update (_id 기반)
router.patch("/:id", async (req, res) => {
    const _id = req.params.id
    /*
    // 수정 권한 조회
    try {
        const comment = await Comment.findOne({ _id, ...Comment })
        if (req.session.authorization != comment.author)
            return res.status(401).send({ message: "No Permission" })
    } catch (e) {
        console.log("error: ", e);
        return res.status(500).send({ message: "Server Error" })
    }
    */

    const comment = Object.keys(req.body)
    const allowedUpdates = ["content"]

    const isValid = comment.every((update) =>

        allowedUpdates.includes(update)
    )

    if (!isValid) {
        return res.status(400).send({ message: "Cannot Update" })
    }

    try {
        req.body.changed = true
        const editedComment = await Comment.findByIdAndUpdate(_id, req.body)

        if (!editedComment) {
            return res.status(404).send({ message: "No Comment" })
        }
        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 게시물 삭제 (_id 기반)
router.delete("/:id", async (req, res) => {
    const _id = req.params.id

    /*
    // 삭제 권한 조회
    try {
        const comment = await Comment.findOne({ _id, ...Comment })
        if (req.session.authorization != comment.author)
            return res.status(401).send({ message: "No Permission" })
    } catch (e) {
        console.log("error: ", e)
        return res.status(500).send({ message: "Server Error" })
    }
    */

    try {
        const deletedComment = await Comment.findByIdAndDelete(_id)
        if (!deletedComment) {
            return res.status(404).send({ message: "No Comment" })
        }
        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.log("error: ", e);
        res.status(500).send({ message: "Server Error" })
    }
})
module.exports = router