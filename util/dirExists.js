const fs = require("fs")
const path = require("path")
/**
 * 检查文件夹是否存在
 * @param {String} dir 
 */
function getStat(dir) {
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err, stats) => {
            if (err) {
                resolve(false)
            } else {
                resolve(stats)
            }
        })
    });
}

function mkdir(dir) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, err => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

async function dirExists(dir) {
    let isExists = await getStat(dir);
    if (isExists && isExists.isDirectory()) {

        return true
    } else if (isExists) {
        //不是文件夹，是文件
        return false
    }

    let tempDir = path.parse(dir).dir; //上级目录
    //上级目录存在，那么创建本级目录，上级目录也不存在，那么循环递归
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if (status) {
        mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
}
module.exports = {
    getStat,
    mkdir,
    dirExists
}