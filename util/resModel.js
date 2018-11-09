module.exports = function (content = '', status = 200, msg = '') {
    this.status = status;
    this.content = content;
    this.msg = msg;
}