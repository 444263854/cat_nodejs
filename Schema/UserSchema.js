const {
    Schema
} = require('./dbConnect')


const UserSchema = new Schema({
    username: String,
    password: String,
    name: String,
    avator: {
        type: String,
        default: '/static/avator/default.png'
    }
}, {
    versionKey: false
})

module.exports = UserSchema