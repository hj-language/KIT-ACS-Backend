const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const User = require("../schemas/user")
const Report = require("../schemas/report")
const { verifyUser, checkPermission } = require("./middlewares/authorization")

router.get("/", async (req, res) => {
    try {
        // const totalReport = await Report.countDocuments({})
        const reports = await Report.find({}).sort()
        res.json({ reports }).status(200)
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

router.post("/", async (req, res) => {
    const { reporter } = req.body
    const { reportTarget } = req.body
    const { targetType } = req.body
    const { reason } = req.body

    // 같은 게시물이 여러 번 신고가 들어올 경우에는 어떤 방식으로 처리 할 것인가???
    try {
        let newReport = new Report({
            reporter: reporter,
            reportTarget: reportTarget,
            targetType: targetType,
            reason: reason,
        })
        await newReport.save()
        res.status(200).send({ message: "Reported!!" })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

router.delete("/:id", verifyUser, async (req, res) => {
    const { id } = req.params
    //삭제 권한 조회
    if (!(await checkPermission(req, res, id, Article))) return
    if (!(await checkPermission(req, res, id, Comment))) return

    // 삭제 시

    // 댓글의 경우 -> 해당 댓글만 삭제?
    // 게시물의 경우 -> 게시물, 댓글, 대댓글 전부 삭제?
    try {
        const deletedArticle = await Article.findByIdAndDelete(id)
        if (!deletedArticle) {
            return res.status(404).send({ message: "No Post" })
        }
        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

module.exports = router
