const express = require("express");
const router = express.Router();
const Article = require("../schemas/article");
const User = require("../schemas/user");
const verifyUser = require("./middlewares/authorization").verifyUser;

// Status Code
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 500 Internal Server Error

// 마이페이지 접속
router.get("/", verifyUser, (req, res) => {
    
});

// 비밀번호 수정
router.patch("/password", verifyUser, (req, res) => {
    
});

module.exports = router;