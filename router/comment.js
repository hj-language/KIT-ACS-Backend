const express = require("express")
const router = express.Router()
const Comment = require("../schemas/comment")
const Article = require("../schemas/article")
const verifyUser = require("./middlewares/authorization").verifyUser


//댓글 추가
router.post("/:id", verifyUser, (req, res) => {
    const refId = req.params.id

    let newComment = new Comment({
        articleId: refId,
        author: req.session.authorization,
        content: req.body.content
    })

    Article.findById(refId, async (e, article) => {
        if (e) {
            console.log("error: ", e)
            return res.status(500).send({ message: "Server Error" })
        }

        //Document = Comment or Recomment
        if (!article) {
            Comment.findById(refId, async (e, comment) => {
                //Documment = Recomment
                if (comment.isRecomment) {
                    return res.status(404).send({ message: "This is Recomment" })
                }
                //Document = Comment
                else {
                    newComment.save((e) => {
                        if (e) {
                            console.log("error: ", e)
                            return res.status(500).send({ message: "Server Error" })
                        } else {
                            newComment.isRecomment = true
                            await Comment.findByIdAndUpdate(refId,
                                { $push: { recommentList: newComment._id } }).exec()

                            res.status(200).send({ message: "Success" })
                        }
                    })
                }
            })
        }
        //Document = Article
        else {
            newComment.save((e) => {
                if (e) {
                    console.log("error: ", e)
                    return res.status(500).send({ message: "Server Error" })
                } else {
                    await Article.findByIdAndUpdate(refId,
                        { $push: { commentList: newComment._id } }).exec()
                    res.status(200).send({ message: "Success" })
                }
            })


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

// 댓글 삭제 (_id 기반)
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