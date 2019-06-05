const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {
    db
} = require('./dbConnect');

const UserSchema = new Schema({
    username: String,
    password: String,
    name: String,
    avatar: {
        type: String,
        default: '/avatar/default.png'
    }
}, {
    versionKey: false
})

module.exports = db.model('users', UserSchema)