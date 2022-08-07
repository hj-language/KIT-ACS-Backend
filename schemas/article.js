const mongoose = require('mongoose')
const { Schema } = mongoose
const mongoosastic = require('mongoosastic')

let articleSchema = new Schema({
    title:
    {
        type: String,
        required: true,
        es_indexed: true
    },
    author:
    {
        type: String,
        required: true
    },
    tag:
    {
        type: String,
        required: true
    },
    content:
    {
        type: String,
        required: true,
        es_indexed: true
    },
    views:
    {
        type: Number,
        required: true
    },
    commentList:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'comment',
        default: null
    },
    fileList:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'file',
        default: null
    }

},
    {
        timestamps: { createdAt: 'date' },
        versionKey: false
    }
)

articleSchema.plugin(mongoosastic, {
    "host": "localhost",
    "port": 9200
})

module.exports = mongoose.model("article", articleSchema)