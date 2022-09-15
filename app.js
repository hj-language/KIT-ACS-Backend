const express = require("express")
const cors = require("cors")
const app = express()
app.use(express.json())
// app.use(cors({
//     origin: "http://localhost:3000",
//     credential: "true"
// }))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
    res.header("Access-Control-Allow-Credentials", true)
    next()
})

const helmet = require("helmet")
app.use(helmet())

const session = require("express-session")
const redisStore = require("connect-redis")(session)
const sessionSecret = require("./secret.js").sessionSecret
const redisHost = require("./secret.js").redisHost
const redis = require("ioredis")
const redisClient = redis.createClient(redisHost)

app.use(
    session({
        secret: sessionSecret, // SID 생성 시 사용되는 비밀키
        resave: false, // 변경 사항이 없으면 세션 저장X
        saveUninitialized: false, // 변경되지 않은 상태의 세션 저장X
        name: "kit_acs",
        cookie: {
            sameSite: false,
            httpOnly: false,
            secure: false,
        },
        store: new redisStore({
            client: redisClient,
        }),
    })
)

const dbConnect = require("./schemas")
dbConnect()

const port = 3001

const routers = require("./router")
app.use("/", routers)

const { crawler_add, crawler_delete } = require("./router/crawler")

app.listen(port, function () {
    console.log(`Server Connected on ${port}.`)

    setInterval(async () => {
        await crawler_delete()
        await crawler_add()
        console.log("crawler ")
    }, 1000 * 60 * 30)
})
