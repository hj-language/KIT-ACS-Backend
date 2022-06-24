const express = require("express");
const app = express();

const dbConnect = require("./schemas");
dbConnect();

const port = 3000;
app.use(express.json());

const routers = require("./router");
app.use('/', routers);

app.listen(port, function () {
    console.log(`Server Connected on ${port}.`);
});

/*
app.post("/user", (req, res) => {
    let obj = new User({
        id: req.body.id,
        password: req.body.password,
        name: req.body.name,
        webmail: req.body.webmail,
    });
    obj.save((err) => console.log("error: ", err));
    User.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
    console.log(req.body);
    res.status(200).end();
});
*/