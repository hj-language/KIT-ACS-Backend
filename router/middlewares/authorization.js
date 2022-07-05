module.exports.verifyUser = (req, res, next) => {
    if (req.session.authorization) {
        console.log(req.session);
        next();
    }
    else {
        console.log("No session");
        res.status(400)
            .json({ message: "You don't have a session" })
            .end();
    }
}