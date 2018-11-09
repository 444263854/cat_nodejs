/**
 * 定义路由
 */
const Router = require('koa-router')
const router = new Router()
const User = require('../control/User')
const Article = require('../control/article')

async function isLogin(ctx, next) {
    if (ctx.session.isNew) {
        ctx.status = 401;
    } else {
        if (ctx.session.isLogin = true) {
            next()
        } else {
            ctx.status = 401;
        }
    }
    next()
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

module.exports = router