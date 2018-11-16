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
    date: {
        type: Date,
        default: new Date()
    },
    content: String,
    imgURL: [String],
    category: String,
    articleID: String
}, {
    versionKey: false
})

module.exports = ArticleSchema