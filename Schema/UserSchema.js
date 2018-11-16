const {
    Schema
} = require('./dbConnect')


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

module.exports = UserSchema