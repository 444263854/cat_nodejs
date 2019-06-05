const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const {
    db
} = require('./dbConnect');

const CommentSchema = new Schema({
    //头像  同户名  文章id 内容
    content: String,
    //关联到用户集合
    author: {
        type: ObjectId,
        ref: 'users'
    },
    article: {
        type: String,
        ref: 'articles'
    }

}, {
    versionKey: false,
    timestamps: {
        createdAt: "created"
    }
})

module.exports = db.model('comments', CommentSchema)