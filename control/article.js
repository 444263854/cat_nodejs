const {
    db
} = require('../Schema/dbConnect')
const articleSchema = require('../Schema/articleSchema')
const userSchema = require('../Schema/UserSchema')
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
        imgDataUrlList = body.imgList,
        imgPathList = [],
        articleID = getRandomID(8),
        imgPath = '/userArticles/' + ctx.session.Uid + '/article/' + articleID,
        promiseList = [];
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
        category: body.category,
        date: new Date(),
        imgURL: imgPathList,
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
        fs.rmdir(imgPath, function (err) {
            if (err) {
                console.log(err)
            }
        })
        ctx.body = new resModel('', 500, "发布失败，服务器错误")
    })
}
exports.cat_daily = SaveArticle
exports.find_host = SaveArticle

exports.MyDaily = async (ctx, next) => {
    var page = ctx.request.body.page;
    await new Promise((resolve, reject) => {
            articleDoc.find({
                    author: ctx.session.Uid
                })
                .skip((page - 1) * 5)
                .limit(5)
                .then(function (data) {
                    resolve(data)
                }).catch(err => {
                    console.error(err)
                })
        })
        .then((docs) => {
            var res = [];
            docs.forEach(val => {
                res.push({
                    title: val.title,
                    datetime: val.date,
                    content: val.content,
                    imgURL: val.imgURL[0],
                    articleID: val.articleID
                })
            })
            ctx.body = new resModel(res, 200)
        })
}