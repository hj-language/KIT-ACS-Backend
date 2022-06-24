const mongoose = require("mongoose");
const { Schema } = mongoose;

const bcrypt = require("bcrypt");
const saltFactor = 10;

let userSchema = new Schema({
    id: String,
    password: String,
    name: String,
    webmail: String,
});
// 스키마 수정 필요 할수도..? webmail verify 여부

/**
 * 비밀번호 해시
 */
userSchema.pre("save", function (next) {
    let user = this;

    if (!user.isModified("password")) return next();
    bcrypt.genSalt(saltFactor, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/**
 *
 * @param {*} pw 들어온 비밀번호
 * @param {*} next
 */
userSchema.methods.comparePassword = function (pw, next) {
    bcrypt.compare(pw, this.password, (err, isMatch) => {
        if (err) return next(err);
        next(null, isMatch);
    });
};

module.exports = mongoose.model("user", userSchema);
