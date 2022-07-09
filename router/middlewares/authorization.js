module.exports.verifyUser = (req, res, next) => {
    console.log(req.session);
    if (req.session.authorization && req.session.cookie._expires > new Date()) {
        next();
    }
    else {
        console.log("No session");
        res.status(401)
            .json({ message: "Unauthorized" })
    }
}
