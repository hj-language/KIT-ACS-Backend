const mongoose = require('mongoose');
const { Schema } = mongoose;

let userSchema = new Schema({
    id: String,
    password: String,
    name: String,
    webmail: String
});

module.exports = mongoose.model("user", userSchema);