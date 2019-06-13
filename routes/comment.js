const Router = require('koa-router');
const Comment = require('../control/comment')
const {
    isLogin
} = require('./router.js');


router = new Router({
    prefix: "/comment"
})

router.post('/', isLogin, Comment.postCommentRouter)
router.get('/', isLogin, Comment.getCommentRouter)

exports.CommentRouter = router