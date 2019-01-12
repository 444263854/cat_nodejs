const {
    db
} = require('../Schema/dbConnect')
const articleSchema = require('../Schema/articleSchema')
const articleDoc = db.model('articles', articleSchema)
const fs = require('fs');
const path = require('path')
const getRandomID = require('../util/randomID')
const {
    dirExists
} = require('../util/dirExists')
const resModel = require('../util/resModel')

async function SaveArticle(ctx, next) {
    var body = ctx.request.body,
        abstract = '',
        Re_checkCon = /<.*?>.*?<\/.*?>/gm,
        imgDataUrlList = body.imgList,
        imgPathList = [],
        articleID = getRandomID(8),
        imgPath = '/userArticles/' + ctx.session.Uid + '/article/' + articleID,
        promiseList = [];
    //检查内容是否大于200
    //大于200截取摘要
    var result = Re_checkCon.exec(body.content);
    while (abstract.length < 200 && result) {
        abstract += result[0]
        result = Re_checkCon.exec(body.content);
    }
    await dirExists(path.join(__dirname, '../static', imgPath));
    imgDataUrlList.forEach(imgFile => {
        let data = imgFile.dataUrl.split(",")[1],
            imgName = Date.now() + imgFile.name;
        imgPathList.push(imgPath + '/' + imgName)
        promiseList.push(new Promise((resolve, reject) => {
            fs.writeFile(path.join(__dirname, '../static', imgPath, imgName), data, "base64", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                resolve(true)
            })
        }))
    });
    const _article = new articleDoc({
        author: ctx.session.Uid,
        title: body.title,
        content: body.content,
        abstract: abstract,
        category: body.category,
        imgURL: imgPathList,
        commentCount: 0,
        articleID
    })
    //发生错误删除保存的图片
    await Promise.all(promiseList).then(() => {
        return new Promise((resolve, reject) => {
            _article.save((err) => {
                if (err) {
                    reject(err)
                    console.log(err)
                };
                resolve()
            })
        })
    }).then(() => {
        ctx.body = new resModel('', 200, "发布成功")
    }).catch((err) => {
        console.log(err);
        fs.rmdir(path.join(__dirname, '../static', imgPath), function (err) {
            if (err) {
                console.log(err)
            }
        })
        ctx.body = new resModel('', 500, "发布失败，服务器错误")
    })
}
exports.cat_daily = SaveArticle
exports.find_host = SaveArticle

exports.dailyList = async (ctx, next) => {
    var rq = ctx.request.body,
        page = rq.page,
        category = rq.category,
        needTotal = rq.total,
        total = 0,
        contentList = [],
        promiseList = [];
    if (needTotal) {
        var filterCount = new Promise((resolve, reject) => {
            articleDoc.countDocuments({
                author: ctx.session.Uid,
                category
            }).then(count => {
                total = count
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
        promiseList.push(filterCount);
    }
    var findData = new Promise((resolve, reject) => {
        articleDoc.find({
                author: ctx.session.Uid,
                category
            })
            .sort("-created")
            .skip((page - 1) * 5)
            .limit(5)
            .then(function (docs) {
                docs.forEach(val => {
                    contentList.push({
                        title: val.title,
                        datetime: val.created,
                        abstract: val.abstract,
                        imgURL: val.imgURL[0],
                        articleID: val.articleID,
                        commentCount: val.commentCount
                    })
                })
                resolve()
            }).catch(err => {
                reject(err)
            })
    })
    promiseList.push(findData)

    await Promise.all(promiseList).then(() => {
            ctx.body = new resModel({
                articleList: contentList,
                total: total
            }, 200)
        })
        .catch(err => {
            console.error(err)
            ctx.body = new resModel("", 500, "服务器出错")
        })
}

exports.articleDetail = async (ctx, next) => {
    let articleID = ctx.query.articleID;

    await articleDoc.findOne({
        articleID
    }).then(con => {
        //评论数据
        var data = {
            title: con.title,
            content: con.content,
            time: con.created,
            imgList: con.imgURL,
            commentCount: con.commentCount
        }
        ctx.body = new resModel(data, 200)
    }).catch(err => {
        console.error(err);
        ctx.body = new resModel('', 500, '数据库错误')
    })
}