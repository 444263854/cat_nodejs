const nodemailer = require('nodemailer');
const errorHandler = require('../log/logHandler.js')
let transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 25,
    secure: false,
    auth: {
        user: 'zhang263854@163.com',
        pass: 'zzyy680106'
    }

})

module.exports = async function (email, Code) {

    let mailOptions = {
        from: '公益猫<zhang263854@163.com>',
        to: email,
        subject: '账号激活验证码',
        html: `<p>您账号的激活码为:</p>
        <p style='font-size:28px;text-align:center'><b>${Code}</b></p>`
    }
    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                errorHandler(err);
                return reject(err);
            };
            console.log(info);
            return resolve()
        })
    })
}