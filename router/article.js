const express = require("express")
const router = express.Router()
const Article = require("../schemas/article")
const Comment = require("../schemas/comment")
const verifyUser = require("./middlewares/authorization").verifyUser

// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 게시물 추가
router.post("/", verifyUser, (req, res) => {
    let newArticle = new Article({
        title: req.body.title,
        author: req.session.authorization,
        tag: req.body.tag,
        content: req.body.content,
        views: 0,
    })

    newArticle.save((e) => {
        if (e) {
            console.log("error: ", e)
            res.status(500).send({ message: "Server Error" })
        } else {
            res.status(200).send({ message: "Success" })
        }
    })
})

const paging = (page, totalArticle, limit) => {
    page = parseInt(page)
    limit = parseInt(limit)
    totalArticle = parseInt(totalArticle)

    let pageNum = page || 1
    let postLimit = limit || 20
    const pagination = 10
    const hidePost = page === 1 ? 0 : (page - 1) * postLimit
    const totalPages = Math.ceil((totalArticle - 1) / postLimit)
    const startPage = Math.floor((pageNum - 1) / pagination) * pagination + 1
    let endPage = startPage + pagination - 1

    if (pageNum > totalPages) {
        pageNum = totalPages
    }
    if (endPage > totalPages) {
        endPage = totalPages
    }
    if (totalPages === 0) {
        endPage = 1
    }

    return { startPage, endPage, hidePost, postLimit, totalPages, pageNum }
}

// 전체 게시물 조회
router.get("/", async (req, res) => {
    const { page } = req.query
    const { limit } = req.query
    try {
        // const articles = await Article.find({ ...Article })
        const totalArticle = await Article.countDocuments({})

        let { startPage, endPage, hidePost, postLimit, totalPages, pageNum } =
            paging(page, totalArticle, limit)

        const board = await Article.find({})
            .sort({ createAt: -1 })
            .skip(hidePost)
            .limit(postLimit)

        res.json({
            board,
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

// 게시물 태그별 조회
router.get("/:tag", async (req, res) => {
    const { tag } = req.params
    const { page } = req.query
    const { limit } = req.query
    try {
        // const results = await Article.find({ tag: tag, ...Article })
        const totalArticle = await Article.countDocuments({
            tag: tag,
            ...Article,
        })

        let { startPage, endPage, hidePost, postLimit, totalPages, pageNum } =
            paging(page, totalArticle, limit)

        const board = await Article.find({ tag: tag, ...Article })
            .sort({ createAt: -1 })
            .skip(hidePost)
            .limit(postLimit)

        res.json({
            board,
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

// 특정(_id) 게시물 조회
router.get("/view/:id", async (req, res) => {
    const _id = req.params.id

    try {
        const article = await Article.findOne({ _id, ...Article })

        const next = await Article.find({
            date: { $gt: article.date },
        }).limit(1)
        const prev = await Article.find({
            date: { $lt: article.date },
        })
            .sort({ _id: -1 })
            .limit(1)

        await Article.findByIdAndUpdate(_id, {
            $set: { views: ++article.views },
        }).exec()

        res.json({ article, next, prev }).status(200)
    } catch (e) {
        console.log("error: ", e)
        res.status(404).send({ message: "No Post" })
    }
})

// 게시물 update (_id 기반)
router.patch("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id

    // 수정 권한 조회
    try {
        const article = await Article.findOne({ _id, ...Article })
        if (req.session.authorization != article.author)
            return res.status(401).send({ message: "No Permission" })
    } catch (e) {
        console.log("error: ", e)
        return res.status(500).send({ message: "Server Error" })
    }

    const article = Object.keys(req.body)
    const allowedUpdates = ["title", "content"] // 변경 가능한 것 (제목, 내용)

    const isValid = article.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ message: "Cannot Update" })
    }

    try {
        const editedArticle = await Article.findByIdAndUpdate(_id, req.body, {
            new: true,
        })
        if (!editedArticle) {
            return res.status(404).send({ message: "No Post" })
        }
        res.status(200).send({ message: "Success" })
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

// 게시물 삭제 (_id 기반)
router.delete("/:id", verifyUser, async (req, res) => {
    const _id = req.params.id
    await Comment.deleteMany()
    //await Article.deleteMany()
    console.log("asdfadsf")

    //삭제 권한 조회
    try {
        const article = await Article.findOne({ _id, ...Article })
        if (req.session.authorization != article.author)
            return res.status(401).send({ message: "No Permission" })
    } catch (e) {
        console.log("error: ", e)
        return res.status(500).send({ message: "Server Error" })
    }

    try {
        //연결된 comment들도 삭제 필요?
        //article.js에서 구현하는 건가?
        const deletedCommentCnt = await Comment.deleteMany({ articleId: _id })
        const deletedArticle = await Article.findByIdAndDelete(_id)
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
