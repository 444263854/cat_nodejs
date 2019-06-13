const fs = require('fs')
const path = require('path')

module.exports = async function errorHandler(message) {
    try {
        let DateString = '[' + new Date().toLocaleString() + ']: \n';
        var buffer = Buffer.from(DateString + message.toString() + '\n');
        fs.open(path.join(__dirname, './errorlog.txt'), 'a+', function (err, fd) {
            if (err) {
                throw new Error(err);
            }
            fs.write(fd, buffer, function (err, written, buffer) {
                if (err) {
                    throw new Error(err);
                }
            })
        })
    } catch (e) {
        console.log(e);
    }
}