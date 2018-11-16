const Koa = require('koa')
const static = require('koa-static')
const logger = require('koa-logger')
const KoaBody = require('koa-body')
const session = require('koa-session')
const path = require("path")

const app = new Koa();
const router = require('./routes/router')

app.keys = ['zhangyong']

const CONFIG = {
    key: 'SESSIONID',
    maxAge: 1000 * 60 * 30,
    rolling: true,
    httpOnly: false
}

app.use(logger())
    .use(static(path.join(__dirname, "/static")))
    .use(session(CONFIG, app))
    .use(KoaBody({
        multipart: true,
        jsonLimit: '9mb',
        formidable: {
            maxFieldsSize: 1040000,
        }
    }))
app.use(async (ctx, next) => {
    ctx.set({
        "Access-Control-Allow-Origin": '*',
        //只允许客户端自定义content-type头部，其它自定义头部不允许
        'Access-Control-Allow-Headers': "content-type"
    })
    await next();
})

app.use(router.routes())
    .use(router.allowedMethods());
app.listen(4000);