const verifyUser = (req, res, next) => {
    if (req.session.authorization && req.session.cookie._expires > new Date()) {
        next()
    }
    else {
        res.status(401).send({ message: "Unauthorized" })
    }
}

const checkPermission = async (refId, userId, model) => { // model is Article or Comment
    try {
        const doc = await model.findOne({ refId, ...model })
        if (userId != doc.author) {
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

module.exports = { verifyUser, checkPermission }