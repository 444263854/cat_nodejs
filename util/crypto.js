const crypto = require('crypto')

module.exports = function (psd, key = 'zhangyong') {
    const hmac = crypto.createHmac('sha256', key)
    try {
        hmac.update(psd)
    } catch (error) {
        console.log(error)
    }
    return hmac.digest('hex')
}