const Router = require('koa-router');
const User = require('../control/User')

router = new Router({
    prefix: "/user"
})

router.post('/register', User.register)
router.get('/register/Code', User.getRegisterCode)
router.get('/check', User.check)
router.post('/login', User.login)
router.get('/logout', User.logout)
router.put('/modifyPassword', User.modifyPassword)
router.get('/modifyPassword/Code', User.getModifyPasswordCode)

exports.UserRouter = router