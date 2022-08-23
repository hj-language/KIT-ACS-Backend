const mongoose = require('mongoose')
const { Schema } = mongoose

let crawlerSchema = new Schema({
    cs:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notice'
    },
    ce:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notice'
    },
    ai: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notice'
    },
    num: { type: Number }
},
    {
        versionKey: false,
    }
)

module.exports = mongoose.model("cralwer", crawlerSchema)