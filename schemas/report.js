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
