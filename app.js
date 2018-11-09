const Koa = require('koa')
const static = require('koa-static')
const logger = require('koa-logger')
const KoaBody = require('koa-body')
const session = require('koa-session')

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
    .use(static('./static'))
    .use(session(CONFIG, app))
    .use(KoaBody({
        multipart: true,
        // formidable: {
        //     uploadDir: path.join(__dirname, '/upload'),
        //     keepExtensions: true,
        //     onFileBegin(name, file) {
        //         let filePath = file.path.split('.')[0]
        //         file.path = filePath + file.name
        //     }
        // }
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
app.listen(3000);