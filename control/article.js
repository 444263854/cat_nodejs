const {
    db
} = require('../Schema/dbConnect')
const articleSchema = require('../Schema/articleSchema')
const articleDoc = db.model('articles', articleSchema)


exports.cat_daily = async (ctx, next) => {
    var body = ctx.request.body,
        imgUrlList = body.imgList;
    const _article = new articleDoc({
        author: ctx.session.username,
        title: body.title,
        content: body.content,
        date: Date.now(),
        imgURL: []
    })

    ctx.status = 200
}

exports.find_host = async (ctx, next) => {
    var body = ctx.request.body;
    ctx.status = 200
}