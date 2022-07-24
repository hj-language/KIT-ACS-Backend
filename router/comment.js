const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const { verifyUser, checkPermission } = require("./middlewares/authorization");

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
            Comment.findById(refId, (e, comment) => {
                if (e) {
                    console.log("error: ", e)
                    return res.status(500).send({ message: "Server Error" })
                }

                //Documment = Recomment
                if (comment.isRecomment) {
                    return res.status(404).send({ message: "This is Recomment" })
                }
                //Document = Comment
                else {
                    newComment.isRecomment = true
                    newComment.save(async (e) => {
                        if (e) {
                            console.log("error: ", e)
                            return res.status(500).send({ message: "Server Error" })
                        }
                        await Comment.findByIdAndUpdate(refId,
                            { $push: { recommentList: newComment._id } }).exec()
                        res.status(200).send({ message: "Success" })
                    })
                }
            })
        }
        //Document = Article
        else {
            newComment.save(async (e) => {
                if (e) {
                    console.log("error: ", e)
                    return res.status(500).send({ message: "Server Error" })
                }
                await Article.findByIdAndUpdate(refId,
                    { $push: { commentList: newComment._id } }).exec()
                res.status(200).send({ message: "Success" })
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
router.patch("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id

    // 수정 권한 조회
    if (!checkPermission(_id, req.session.authorization, Comment)) return

    const comment = Object.keys(req.body)
    const allowedUpdates = ["content"]

    const isValid = comment.every((update) =>
        allowedUpdates.includes(update)
    )
    if (!isValid) {
        return res.status(400).send({ message: "Cannot Update" })
    }

    try {
        req.body.isChanged = true
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
router.delete("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id

    // 삭제 권한 조회
    if (!checkPermission(_id, req.session.authorization, Comment)) return

    Comment.findById(_id, async (e, comment) => {
        if (e) {
            console.log("error: ", e)
            return res.status(500).send({ message: "Server Error" })
        }

        //is recomment
        if (comment.isRecomment) {
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
        }
        else {
            try {
                //have recomment O
                const recommentCnt = await Comment.where({ articleId: _id }).countDocuments();
                console.log(recommentCnt)
                if (recommentCnt != 0) {
                    await Comment.findByIdAndUpdate(_id,
                        { $set: { content: null } }).exec()
                    await Comment.findByIdAndUpdate(_id,
                        { $set: { isDeleted: true } }).exec()
                    return res.status(200).send({ message: "This Comment have Recomments" })
                }
                //have recomment X
                const deletedComment = await Comment.findByIdAndDelete(_id)
                if (!deletedComment) {
                    return res.status(404).send({ message: "No Comment" })
                }
                res.status(200).send({ message: "Success" })
            } catch (e) {
                console.log("error: ", e);
                res.status(500).send({ message: "Server Error" })
            }
        }
    })
})

module.exports = router