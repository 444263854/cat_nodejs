const {
    db
} = require('../Schema/dbConnect')
const UserSchema = require('../Schema/UserSchema')
const UserDoc = db.model('users', UserSchema)
const resModel = require('../util/resModel')
const CryptoHmac = require('../util/crypto')
const nodemailer = require('../util/nodemailer')
const getRandomCode = require('../util/randomStr')
/**
 * 注册
 */
exports.register = async (ctx, next) => {
    const userData = ctx.request.body,
        name = userData.name,
        username = userData.username,
        password = userData.password,
        Code = userData.validateCode;

    let codeObj = ctx.session.code;
    //验证码不对||失效
    if (Code != codeObj.code || codeObj.expire < Date.now()) {
        return ctx.body = new resModel('', 401, '验证码不正确')
    }
    await new Promise((resolve, reject) => {
        UserDoc.find({
            username
        }, function (err, docs) {
            if (err) return reject(err)
            //用户已经存在
            if (docs.length !== 0) return resolve("");

            //用户名不存在
            const _user = new UserDoc({
                name,
                username,
                password: CryptoHmac(password)
            })

            _user.save((err, doc) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(doc)
                }
            })
        })
    }).then((data) => {
        if (data) {
            ctx.body = new resModel("", 200, "注册成功")
        } else {
            ctx.body = new resModel("", 400, "用户名已经存在")
        }
    }).catch(err => {
        console.error('register--->', err);
        ctx.body = new resModel('', 400, '注册失败，请重试')
    })

}

/**注册验证码 */
exports.getRegisterCode = async (ctx, next) => {

    let Code = getRandomCode();
    await nodemailer(ctx.query.username, Code)
    ctx.session.code = {
        code: Code,
        expire: Date.now() + 1000 * 61
    }
    ctx.body = new resModel('', 200, '验证码已发送至您的邮箱')
}
/**
 * 登录检查
 */
exports.check = async (ctx, next) => {
    if (ctx.session.isNew) {
        ctx.body = false;
    } else {
        if (ctx.session.isLogin = true) {
            ctx.body = {
                avator: '/api' + ctx.session.avator
            };
        } else {
            ctx.body = false;
        }
    }
}
/**
 * 登录
 */
exports.login = async (ctx, next) => {
    const _user = ctx.request.body,
        username = _user.username,
        password = _user.password,
        remember = _user.remember;

    await new Promise((resolve, reject) => {
        UserDoc.findOne({
            username
        }, (err, data) => {
            if (err) {
                return reject(err)
            }
            if (!data) {
                return resolve('用户名或者密码错误')
            }
            if (data.password === CryptoHmac(password)) {
                return resolve(data)
            } else {
                return resolve('用户名或者密码错误')
            }
        })
    }).then((data) => {
        if (typeof data !== 'string') {
            //设置cookie,如果cookies的值被改变，取出来的cookies将会变成undefined
            ctx.session.username = username;
            ctx.session.Uid = data._id;
            ctx.session.avator = data.avator;
            ctx.session.isLogin = true;

            if (remember) {
                //7天
                ctx.session.maxAge = 6048e5
            } else {
                ctx.session.maxAge = ""
            }

            ctx.body = new resModel({
                avator: data.avator
            }, 200, '登录成功')
        } else {
            ctx.body = new resModel("", 400, '用户名或者密码错误')
        }
    }).catch(err => {
        ctx.body = new resModel('', 400, '登录失败')
    })
}
/**
 * 注销
 */
exports.logout = async (ctx, next) => {
    ctx.session = null
    ctx.body = new resModel("", 200, "注销成功")
}

exports.getModifyPasswordCode = async (ctx) => {
    let Code = getRandomCode();
    await nodemailer(ctx.query.username, Code)
    ctx.session.modifyCode = {
        code: Code,
        expire: Date.now() + 1000 * 61
    }
    ctx.body = new resModel('', 200, '验证码已发送至您的邮箱')
}

exports.modifyPassword = async (ctx) => {
    let userData = ctx.request.body,
        username = userData.username,
        password = userData.password,
        Code = userData.validateCode;
    let codeObj = ctx.session.modifyCode;
    //验证码不对||失效
    if (Code != codeObj.code || codeObj.expire < Date.now()) {
        return ctx.body = new resModel('', 401, '验证码不正确')
    }
    await new Promise((resolve, reject) => {
        UserDoc.updateOne({
            username
        }, {
            password: CryptoHmac(password)
        }, (err, doc) => {
            if (err) return reject(err);
            //doc==>{ n: 1, nModified: 1, ok: 1 }
            return resolve()
        })
    }).then(() => {
        ctx.body = new resModel('', 200, '密码修改成功')
    }).catch(err => {
        ctx.body = new resModel('', 400, '密码修改失败')
    })

}