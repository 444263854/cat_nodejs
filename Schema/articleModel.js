const mongoose = require('mongoose')
const {
    db
} = require('./dbConnect');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ArticleSchema = new Schema({
    title: String,
    author: {
        type: ObjectId,
        ref: 'users'
    },
    content: String,
    imgURL: [String],
    category: String,
    articleID: String,
    abstract: String,
    commentCount: Number,
    likedCount: Number,
    collectedCount: Number,
    address: String
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created'
    }
})

module.exports = db.model('articles', ArticleSchema)