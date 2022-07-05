const mongoose = require('mongoose');
const { Schema } = mongoose;

//auto_increment init
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

let articleSchema = new Schema({
    no:
    {
        type: Number
    },
    title:
    {
        type: String,
        required: true
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
        required: true
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
    }

},
    {
        timestamps: { createdAt: 'date' },
        versionKey: false
    }
);

articleSchema.plugin(autoIncrement.plugin, {
    model: 'article',
    field: 'no',
    startAt: 1, //시작
    increment: 1 // 증가
});
module.exports = mongoose.model("article", articleSchema);