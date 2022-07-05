const mongoose = require('mongoose');
const { Schema } = mongoose;


let articleSchema = new Schema({
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

module.exports = mongoose.model("article", articleSchema);