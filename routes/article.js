const Router = require('koa-router');
const Article = require('../control/article')
const {
    isLogin
} = require('./router.js')

const router = new Router({
    prefix: '/article'
})

router.post('/saveArticle', isLogin, Article.SaveArticle)
router.post('/List', isLogin, Article.dailyList)
router.get('/:id', isLogin, Article.articleDetail)

exports.ArticleRouter = router