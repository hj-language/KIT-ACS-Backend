const mongoose = require('mongoose');
const databaseURL = require('../secret.js').databaseURL;

module.exports = () => {
    mongoose.connect(databaseURL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected.'))
    .catch((e) => console.log(e));

    let db = mongoose.connection;
    db.on('error', ()=> console.log("FAILD!"));
    db.once('open', ()=> console.log("SUCCESS!"));
}