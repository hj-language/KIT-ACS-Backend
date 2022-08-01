const mongoose = require("mongoose")
const { Schema } = mongoose

let reportSchema = new Schema(
    {
        reporter: {
            type: String,
            required: true,
        },
        articleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "article",
            required: true,
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment",
            default: null,
        },
        targetType: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: { createdAt: "date" },
        versionKey: false,
    }
)

module.exports = mongoose.model("report", reportSchema)
