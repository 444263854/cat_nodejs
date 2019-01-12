const {
    db
} = require('../Schema/dbConnect')
const userSchema = require('../Schema/UserSchema')
const articleSchema = require('../Schema/articleSchema')
const commentSchema = require('../Schema/commentSchema')
const commentDoc = db.model('comments', commentSchema)
const articleDoc = db.model('articles', articleSchema)
const fs = require('fs');
const resModel = require('../util/resModel')
const path = require('path')

exports.postComment = async (ctx, next) => {
    let comment = ctx.request.body.comment,
        articleID = ctx.query.articleID;
    const _comment = new commentDoc({
        content: comment,
        article: articleID,
        author: ctx.session.Uid
    })

    await _comment.save().then(async (data) => {

            await articleDoc.findOneAndUpdate({
                    articleID
                }, {
                    $inc: {
                        commentCount: 1
                    }
                })
                .select('commentCount')
                .then((data) => {
                    //findOneAndUpdate 得到的data是修改之前的数据
                    //先find，后update
                    ctx.body = new resModel({
                        commentCount: data.commentCount + 1
                    }, 200, 'success');
                }).catch(err => {
                    console.error(err);
                })

        })
        .catch(err => {
            console.error(err);
            ctx.body = new resModel('', 500, '服务器错误')
        })

}
exports.getComment = async (ctx, next) => {
    let query = ctx.query,
        articleID = query.articleID,
        page = query.page,
        count = query.count;

    await commentDoc.find({
            article: articleID
        })
        .sort('-created')
        .skip(page * count)
        .limit(+count) //把string类型转换为==>number
        .populate('author', 'avatar username')
        .then(docs => {
            let dataArr = [];
            docs.forEach(val => {
                dataArr.push({
                    avatar: val.author.avatar,
                    username: val.author.username,
                    time: val.created,
                    content: val.content
                })
            })
            ctx.body = new resModel(dataArr, 200, 'success')
        })
        .catch(err => {
            console.error(err);
            ctx.body = new resModel(err, 500, '服务器错误')
        })
}