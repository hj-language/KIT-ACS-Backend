const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const User = require("../schemas/user")
const Report = require("../schemas/report")
const Page = require("./article")
const { verifyUser, checkPermission } = require("./middlewares/authorization")

const { paging } = require("./article")

router.post("/", async (req, res) => {
    const { reporter } = req.body
    const { id } = req.body
    const { targetType } = req.body
    const { reason } = req.body

    try {
        if (targetType === "article") {
            let newReport = new Report({
                reporter: reporter,
                articleId: id,
                targetType: targetType,
                reason: reason,
            })
            await newReport.save()
            res.status(200).send({ message: "Article Reported!!" })
        } else if (targetType === "comment") {
            const _articleId = await Article.find({
                commentList: { $in: [id] },
            })
            const articleId = _articleId._id
            let newReport = new Report({
                reporter: reporter,
                articleId: articleId,
                commentId: id,
                targetType: targetType,
                reason: reason,
            })
            await newReport.save()
            res.status(200).send({ message: "Comment Reported!!" })
        } else {
            res.status(404).send({ message: "Not Found" })
        }
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

router.get("/", async (req, res) => {
    const { page } = req.query
    const { limit } = req.query
    try {
        const totalReport = await Article.countDocuments({})
        let { startPage, endPage, hidePost, postLimit, totalPages, pageNum } =
            paging(page, totalReport, limit)

        const reports = await Report.find({})
            .sort({ createAt: -1 })
            .skip(hidePost)
            .limit(postLimit)

        res.json({
            reports,
            pageNum,
            startPage,
            endPage,
            postLimit,
            totalPages,
        }).status(200)
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 게시물 삭제없이 신고 내역을 삭제하기 위함
router.delete("/:id", verifyUser, async (req, res) => {
    const { id } = req.params
    try {
        // 신고 내역 삭제
        await Report.findByIdAndDelete(id)
        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

module.exports = router
