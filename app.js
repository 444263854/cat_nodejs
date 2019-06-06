const Koa = require('koa')
const static = require('koa-static')
const logger = require('koa-logger')
const KoaBody = require('koa-body')
const session = require('koa-session')
const path = require("path")

const app = new Koa();
const routers = require('./routes/router')

app.keys = ['zhangyong']

const CONFIG = {
    key: 'SESSIONID', //cookies 的键名
    maxAge: 1000 * 60 * 30,
    httpOnly: true,
    rolling: true, //maxage 过期了，cookies重置过期时间
    renew: true // 快要过期了重置session
}

app.use(logger())
    .use(static(path.join(__dirname, "/static"), {
        maxage: 1000 * 60 * 60 * 24 * 30,
    }))
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
        "Access-Control-Allow-Origin": 'http://localhost:8080',
        //只允许客户端自定义content-type头部，其它自定义头部不允许
        'Access-Control-Allow-Headers': "Content-Type",
        'Access-Control-Allow-Methods': "PUT, DELETE, OPTIONS",
        //预请求缓存(单位：s)
        'Access-Control-Max-Age': 600,
        //跨域XHR允许携带cookies
        'Access-Control-Allow-Credentials': true,
    })
    await next();
})

for (let i = 0; i < routers.length; i++) {
    const router = routers[i];
    app.use(router.routes())
        .use(router.allowedMethods());
}

app.listen(4000);