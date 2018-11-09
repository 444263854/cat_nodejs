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
        default: Date.now()
    },
    content: String,
    imgURL: [String]
}, {
    versionKey: false
})

module.exports = ArticleSchema