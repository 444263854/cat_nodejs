const Router = require('koa-router');
const Comment = require('../control/comment')
const {
    isLogin
} = require('./router.js');


router = new Router({
    prefix: "/comment"
})

router.post('', isLogin, Comment.postComment)
router.get('', isLogin, Comment.getComment)

exports.CommentRouter = router