const articleModel = require('../Schema/articleModel')
const commentModel = require('../Schema/commentModel')
const errorHandler = require('../log/logHandler')
const fs = require('fs');
const resModel = require('../util/resModel')
const path = require('path')

async function postCommentRouter(ctx, next) {
    let comment = ctx.request.body.comment,
        articleID = ctx.query.articleID;
    const _comment = new commentModel({
        content: comment,
        article: articleID,
        author: ctx.session.Uid
    })

    await _comment.save().then(async (data) => {

            await articleModel.findOneAndUpdate({
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
                    errorHandler(err);
                })
        })
        .catch(err => {
            errorHandler(err);
            ctx.body = new resModel('', 500, '服务器错误')
        })

}
async function getCommentRouter(ctx, next) {
    let query = ctx.query;
    try {
        await getComment(query).then((dataArr) => {
            ctx.body = new resModel(dataArr, 200, 'success')
        });
    } catch (error) {
        console.log("TCL: exports.getCommentRouter -> error", error)
        ctx.status = 500;
    }
}


async function getComment(query) {
    const {
        articleID,
        page,
        count
    } = query;
    try {
        let docs = await commentModel.aggregate([{
                $match: {
                    article: articleID
                }
            },
            {
                $sort: {
                    'created': -1
                }
            },
            {
                $skip: page * count
            },
            {
                $limit: +count
            },
            {
                $lookup: {
                    from: 'users',
                    pipeline: [{
                        $project: {
                            _id: 0,
                            avatar: "$avatar",
                            username: "$username"
                        },
                    }],
                    as: 'author'
                }
            },
            {
                $unwind: "$author"
            }
        ])

        // let docs = await commentModel.find({
        //         article: articleID
        //     })
        //     .sort('-created')
        //     .skip(page * count)
        //     .limit(+count) //把string类型转换为==>number
        //     .populate({
        //         path: 'author',
        //         select: 'avatar username'
        //     })

        let dataArr = [];
        docs.forEach(val => {
            dataArr.push({
                avatar: val.author.avatar,
                username: val.author.username,
                time: val.created,
                content: val.content
            })
        });
        return dataArr;

    } catch (error) {
        errorHandler(error);
        throw new Error(error)
    }
}

module.exports = {
    getComment,
    getCommentRouter,
    postCommentRouter
}