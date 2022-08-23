const mongoose = require('mongoose')
const { Schema } = mongoose

let noticeSchema = new Schema({
    title:
    {
        type: String
    },
    link:
    {
        type: String
    }
},
    {
        versionKey: false,
    }
)

module.exports = mongoose.model("notice", noticeSchema)