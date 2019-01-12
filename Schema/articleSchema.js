const {
    Schema
} = require('./dbConnect')
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
    collectedCount: Number
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created'
    }
})

module.exports = ArticleSchema