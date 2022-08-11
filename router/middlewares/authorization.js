const verifyUser = (req, res, next) => {
    if (req.session.authorization && req.session.cookie._expires > new Date()) {
        next()
    }
    else {
        res.status(401).send({ message: "Unauthorized" })
    }
}

const checkPermission = async (req, res, refId, model) => { // model is Article or Comment
    if (req.session.authorization === "admin") return true
    try {
        const doc = await model.findById(refId)
        if (req.session.authorization != doc.author) {
            res.status(401).send({ message: "No Permission" })
            return false
        }
    } catch (e) {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
        return false
    }
    return true
}

const checkAdmin = (req, res, next) => {
    if (req.session.authorization !== "admin") {
        res.status(401).send({ message: "No Permission" })
    } else {
        next();
    }
}

module.exports = { verifyUser, checkPermission, checkAdmin }