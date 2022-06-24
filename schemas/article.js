const mongoose = require('mongoose');
const { Schema } = mongoose;

//auto_increment init
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

let articleSchema = new Schema({
    no:
    {
        type: Number,
        default: 0
    },
    title: String,
    author: String,
    date:
    {
        type: Date,
        default: Date.now
    },
    tag: String,
    content: String
});

articleSchema.plugin(autoIncrement.plugin, {
    model: 'article',
    field: 'article_no',
    startAt: 1, //시작
    increment: 1 // 증가
});
module.exports = mongoose.model("article", articleSchema);