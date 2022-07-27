const mongoose = require('mongoose')
const { Schema } = mongoose

let fileSchema = new Schema({
    articleId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'article',
        required: true
    },
    size:
    {
        type: Number,
        required: true
    },
    originName: { type: String },
    newName: { type: String }
},
    {
        //timestamps: { createdAt: 'date' },
        versionKey: false
    }
)

module.exports = mongoose.model("file", fileSchema);