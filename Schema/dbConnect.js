const mongoose = require('mongoose')
const config = require("config")

mongoose.set('useFindAndModify', false);

const db = mongoose.createConnection(config.get('db'), {
    useNewUrlParser: true
})

mongoose.Promise = global.Promise

db.on('error', (err) => {
    console.error('连接数据库失败');
})
db.on('open', () => {
    console.log('连接数据库成功');
})


exports.db = db;