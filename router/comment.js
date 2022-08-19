const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const User = require("../schemas/user")
const Report = require("../schemas/report")
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
                if (!comment) {
                    return res.status(404).send({ message: "Not exist" })
                }
                if (e) {
                    console.log("error: ", e)
                    return res.status(500).send({ message: "Server Error" })
                }

                // comment id가 잘못된 경우 e에서 걸리는지 ?
                // 아니면 e는 아닌 채로 comment가 undefined나 null로 뜨는지 ?
                // 테스트 부탁합니당 ..

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

const addAuthorInfo = async (doc, userId) => {
    const author = await User.findOne({ id: doc.author })
    const authorInfo = { 
        authorName: author.name,
        isMine: (userId == doc.author || userId == "admin")
    }
    const info = Object.assign(authorInfo, doc._doc)
    return info
}

// 전체 댓글 조회
router.get("/:id", async (req, res) => {
    try {
        const comments_ = await Comment.find({ articleId: req.params.id }).populate("recommentList")
        const comments = await Promise.all(
            comments_.map(async (comment) => {
                await comment.recommentList.forEach(async (recomment) => {
                    recomment._doc = await addAuthorInfo(recomment, req.session.authorization)
                })
                return await addAuthorInfo(comment, req.session.authorization)
            })
        )
        res.json(comments).status(200)
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 댓글 update (_id 기반)
router.patch("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id

    // 수정 권한 조회
    if (!await checkPermission(req, res, _id, Comment)) return

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
    if (!await checkPermission(req, res, _id, Comment)) return

    Comment.findById(_id, async (e, comment) => {
        if (!comment) {
            return res.status(404).send({ message: "Not exist" })
        }
        if (e) {
            console.log("error: ", e)
            return res.status(500).send({ message: "Server Error" })
        }

        //is recomment <DELETE OK>
        if (comment.isRecomment) {
            try {
                const commentId_ = comment.articleId

                //Delete Report
                await Report.deleteMany({ commentId: _id })

                //Delete Recomment
                const deletedRecomment = await Comment.findByIdAndDelete(_id)

                //삭제된 comment에 recomment 없어질 때 Delete
                Comment.findById(commentId_, async (e, comment_) => {
                    if (comment_.isDeleted == true) {
                        const recommentCnt = await Comment.where({ articleId: comment_._id }).countDocuments()
                        if (recommentCnt == 0) {
                            await Comment.findByIdAndDelete(comment_.id)
                        }
                    }
                })

                if (!deletedRecomment) {
                    return res.status(404).send({ message: "No Recomment" })
                }
                res.status(200).send({ message: "Success" })
            } catch (e) {
                console.log("error: ", e);
                res.status(500).send({ message: "Server Error" })
            }
        }
        else {
            try {
                //have recomment O <DELETE NOPE>
                const recommentCnt = await Comment.where({ articleId: _id }).countDocuments();
                if (recommentCnt != 0) {
                    await Comment.findByIdAndUpdate(_id,
                        { $set: { content: null } }).exec()
                    await Comment.findByIdAndUpdate(_id,
                        { $set: { isDeleted: true } }).exec()
                    return res.status(200).send({ message: "This Comment have Recomments" })
                }
                //have recomment X <DELETE OK>
                //Delete Report
                await Report.deleteMany({ commentId: _id })

                //Delete Comment
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