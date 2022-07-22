const express = require("express")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors())

const session = require("express-session")
const redisStore = require("connect-redis")(session)
const sessionSecret = require("./secret.js").sessionSecret
const redisHost = require("./secret.js").redisHost
const redis = require('ioredis')
const redisClient = redis.createClient(redisHost)

app.use(
    session({
        secret: sessionSecret, // SID 생성 시 사용되는 비밀키
        resave: false, // 변경 사항이 없으면 세션 저장X
        saveUninitialized: false, // 변경되지 않은 상태의 세션 저장X
        name: "kit_acs",
        cookie: {
            httpOnly: true,
            secure: false,
        },
        store: new redisStore({
            client: redisClient,
        }),
    })
);

const dbConnect = require("./schemas")
dbConnect()

const port = 3000

const routers = require("./router")
app.use("/", routers)

// app.listen(port, "192.168.0.21", function () {
//     console.log(`Server Connected on ${port}.`)
// })

app.listen(port, function () {
    console.log(`Server Connected on ${port}.`)
})