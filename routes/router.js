/**
 * 定义路由
 */
const Router = require('koa-router')
const router = new Router()
const User = require('../control/User')
const Article = require('../control/article')
const Comment = require('../control/comment')

async function isLogin(ctx, next) {
    if (ctx.session.isNew) {
        ctx.status = 401;
    } else {
        if (ctx.session.isLogin = true) {
            await next()
        } else {
            ctx.status = 401;
        }
    }
}

router.post('/user/register', User.register)
router.get('/user/register/Code', User.getRegisterCode)
router.get('/user/check', User.check)
router.post('/user/login', User.login)
router.get('/user/logout', User.logout)
router.put('/user/modifyPassword', User.modifyPassword)
router.get('/user/modifyPassword/Code', User.getModifyPasswordCode)

router.post('/article/cat_daily', isLogin, Article.cat_daily)
router.post('/article/find_host', isLogin, Article.find_host)
router.post('/article/List', isLogin, Article.dailyList)
router.get('/article/detail', isLogin, Article.articleDetail)


router.post('/comment', isLogin, Comment.postComment)

router.get('/comment', isLogin, Comment.getComment)
module.exports = router