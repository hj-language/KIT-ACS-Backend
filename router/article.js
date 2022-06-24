/*
app.post("/article", (req, res) => {
    console.log(req.body);
    let obj = new Article({
        title: req.body.title,
        author: req.body.author,
        date: req.body.date,
        tag: req.body.tag,
        content: req.body.content,
    });
    obj.save((err) => console.log("error: ", err));
    Article.find((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    });
    res.status(200).end();
});
*/