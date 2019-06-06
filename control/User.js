const {
    db
} = require('../Schema/dbConnect')
const errorHandler = require('../log/logHandler.js')
const UserModel = require('../Schema/UserModel.js')
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
    if (!ctx.session.code) {
        return ctx.body = new resModel('', 400, '注册失败，请重试')
    }
    let codeObj = ctx.session.code;
    //验证码不对||失效
    if (Code !== codeObj.code || codeObj.expire < Date.now()) {
        return ctx.body = new resModel('', 401, '验证码不正确')
    }
    await new Promise((resolve, reject) => {
        UserModel.find({
            username
        }, function (err, docs) {
            if (err) return reject(err)
            //用户已经存在
            if (docs.length !== 0) return resolve(false);

            //用户名不存在
            const _user = new UserModel({
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
        errorHandler(err);
        ctx.body = new resModel('', 400, '注册失败，请重试')
    })

}

/**注册验证码 */
exports.getRegisterCode = async (ctx, next) => {

    let Code = getRandomCode();
    try {
        await nodemailer(ctx.query.username, Code)
    } catch (err) {
        errorHandler(err);
    }
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
            ctx.body = new resModel({
                avatar: ctx.session.avatar
            }, 200, '验证码已发送至您的邮箱')
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
        UserModel.findOne({
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
            ctx.session.avatar = data.avatar;
            ctx.session.isLogin = true;

            if (remember) {
                //7天
                ctx.session.maxAge = 6048e5
            } else {
                ctx.session.maxAge = 1000 * 60 * 15
            }

            ctx.body = new resModel({
                avatar: data.avatar
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
    let codeObj = ctx.session.modifyCode
    //验证码不对||失效
    if (!codeObj || Code != codeObj.code || codeObj.expire < Date.now()) {
        return ctx.body = new resModel('', 401, '验证码不正确')
    }
    await new Promise((resolve, reject) => {
        UserModel.updateOne({
            username
        }, {
            password: CryptoHmac(password)
        }, (err, doc) => {
            if (err) return reject(err);
            //doc=={ n: 1, nModified: 1, ok: 1 }
            delete ctx.session.modifyCode;
            return resolve()
        })
    }).then(() => {
        ctx.body = new resModel('', 200, '密码修改成功')
    }).catch(err => {
        ctx.body = new resModel('', 400, '密码修改失败')
    })

}