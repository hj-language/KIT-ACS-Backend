const mongoose = require('mongoose');
const { Schema } = mongoose;

//auto_increment init
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

let articleSchema = new Schema({
    no: Number,
    title: String,
    author: String,
    date:
    {
        type: Date,
        default: Date.now,
    },
    tag: String,
    content: String,
});

articleSchema.plugin(autoIncrement.plugin, {
    model: 'article',
    field: 'no',
    startAt: 1, //시작
    increment: 1 // 증가
});
module.exports = mongoose.model("article", articleSchema);