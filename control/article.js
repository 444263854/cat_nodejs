const errorHandler = require('../log/logHandler.js')
const articleModel = require('../Schema/articleModel')
const fs = require('fs');
const path = require('path')
const getRandomID = require('../util/randomID')
const {
    dirExists
} = require('../util/dirExists')
const resModel = require('../util/resModel')

exports.SaveArticle = async function SaveArticle(ctx, next) {
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
                    reject(err)
                }
                resolve(true)
            })
        }))
    });
    const _article = new articleModel({
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
                };
                resolve()
            })
        })
    }).then(() => {
        ctx.body = new resModel('', 200, "发布成功")
    }).catch((err) => {
        errorHandler(err);
        fs.rmdir(path.join(__dirname, '../static', imgPath), function (err) {
            if (err) {
                errorHandler(err)
            }
        })
        ctx.body = new resModel('', 500, "发布失败，服务器错误")
    })
}


exports.dailyList = async (ctx, next) => {
    var rq = ctx.request.body,
        page = Math.max(0, rq.page),
        category = rq.category,
        total = 0,
        contentList = [];

    var countDocs = new Promise((resolve, reject) => {
        articleModel.countDocuments({
            author: ctx.session.Uid,
            category
        }, function (err, count) {
            if (err) {
                reject(err)
            }
            total = count;
            resolve()
        })
    })

    var findData = new Promise((resolve, reject) => {
        articleModel.find({
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
            })
    })
    await Promise.all([countDocs, findData]).then(() => {
            ctx.body = new resModel({
                articleList: contentList,
                total: total
            }, 200)
        })
        .catch(err => {
            errorHandler(err)
            ctx.body = new resModel("", 500, "服务器出错")
        })
}

exports.articleDetail = async (ctx, next) => {
    let articleID = ctx.params.id;

    await articleModel.findOne({
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
        errorHandler(err);
        ctx.body = new resModel('', 500, '服务器错误')
    })
}