const express = require('express');
const app = express();

const dbConnect = require('../schemas');
dbConnect();

const port = 3000;
app.use(express.json());

app.get('/', function (req, res) {
    res.send("Server Connected.");
});

app.listen(port, function () {
    console.log(`Server Connected on ${port}.`);
});

const User = require('../schemas/user.js');

app.post('/user', (req, res) => {
    console.log(req.body);
    let obj = new User({
        id: req.body.id,
        password: req.body.password,
        name: req.body.name,
        webmail: req.body.webmail
    });
    obj.save((err) => console.log("error: ", err))
    User.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    })
    res.status(200).end();
})

app.post('/article', (req, res) => {
    console.log(req.body);
    let obj = new User({
        no: req.body.no,
        title: req.body.title,
        author: req.body.author,
        date: req.body.date,
        tag: req.body.tag,
        content: req.body.content,
    });
    obj.save((err) => console.log("error: ", err))
    User.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    })
    res.status(200).end();
})