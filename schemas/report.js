const mongoose = require("mongoose")
const { Schema } = mongoose

let reportSchema = new Schema(
    {
        reporter: {
            type: String,
            required: true,
        },
        reportTarget: {
            type: String,
            required: true,
        },
        targetType: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        reportCount: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: "date" },
        versionKey: false,
    }
)

module.exports = mongoose.model("report", reportSchema)
