const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const db = mongoose.createConnection('mongodb://localhost:27017/cat', {
    useNewUrlParser: true
})

mongoose.Promise = global.Promise

db.on('error', (err) => {
    console.error('连接数据库失败');
})
db.on('open', () => {
    console.log('连接数据库成功');
})

module.exports = {
    db,
    Schema
}