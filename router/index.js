const express = require("express")
const router = express.Router()

const Login = require("./log")
router.use("/log", Login)

const Sign = require("./sign")
router.use("/sign", Sign)

const Article = require("./article")
router.use("/article", Article)

const Comment = require("./comment")
router.use("/comment", Comment)

const Mypage = require("./mypage")
router.use("/mypage", Mypage)

const Report = require("./report")
router.use("/report", Report)

const Crawler = require("./crawler")
router.use("/crawler", Crawler)

module.exports = router
