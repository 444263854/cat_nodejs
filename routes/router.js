exports.isLogin = async function isLogin(ctx, next) {
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

const {
    UserRouter
} = require('./user.js');
const {
    ArticleRouter
} = require('./article.js');
const {
    CommentRouter
} = require('./comment.js');

module.exports = [
    UserRouter,
    ArticleRouter,
    CommentRouter
]