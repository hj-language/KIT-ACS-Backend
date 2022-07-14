const mongoose = require('mongoose')
const { Schema } = mongoose

/*
//auto_increment init
var autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(mongoose.connection)
*/

let commentSchema = new Schema({
    articleId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'article',
        required: true
    },
    author:
    {
        type: String,
        required: true
    },
    content:
    {
        type: String,
        required: true
    },
    changed:
    {
        type: Boolean,
        default: false,
    },
    recommentList:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'comment',
        default: null
    }
},
    {
        timestamps: { createdAt: 'date' },
        versionKey: false
    }
)

/*
commentSchema.plugin(autoIncrement.plugin, {
    model: 'comment',
    field: 'no',
    startAt: 1, //시작
    increment: 1 // 증가
})*/

module.exports = mongoose.model("comment", commentSchema)