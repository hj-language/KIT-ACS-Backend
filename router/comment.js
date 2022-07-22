const express = require("express")
const router = express.Router()
const Comment = require("../schemas/comment")
const Article = require("../schemas/article")
const verifyUser = require("./middlewares/authorization").verifyUser


//댓글 추가
router.post("/:id", async (req, res) => {
    const refId = req.params.id


    let newComment = new Comment({
        articleId: refId,
        author: req.body.author,
        content: req.body.content
    })

    Article.findById(refId, (e, Doc) => {
        //Docuument = Comment or Recomment
        if (!Doc) {
            //Documment = Recomment
            if (article.recommentList == null) {
                return res.status(404).send({ message: "This is Recomment" })
            }
            //Document = Comment
            else {
                newComment.save((e) => {
                    if (e) {
                        console.log("error: ", e)
                        res.status(500).send({ message: "Server Error" })
                    } else {
                        res.status(200).send({ message: "Success" })
                    }
                })

                await Comment.findByIdAndUpdate(refId,
                    { $push: { recommentList: newComment._id } }).exec()
            }
        }
        //Document = Article
        else {
            newComment.save((e) => {
                if (e) {
                    console.log("error: ", e)
                    res.status(500).send({ message: "Server Error" })
                } else {
                    res.status(200).send({ message: "Success" })
                }
            })

            newComment.recommentList = []
            await Article.findByIdAndUpdate(refId,
                { $push: { commentList: newComment._id } }).exec()
        }
    })

})

// 전체 댓글 조회
router.get("/:id", async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.id }).populate("recommentList")
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