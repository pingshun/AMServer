var util = require('util');
var email = require('emailjs');

var amConst = require('./amConstants');
var log = require('log4js').getLogger("util");

module.exports = AmUtil;

function AmUtil() {}

AmUtil.inherits = function(child, base) {
    util.inherits(child, base);
    for (var property in base) {
        child[property] = base[property];
    }
}

AmUtil.generateGuid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

AmUtil.sendEmail = function (to, subject, content, html_data, cb) {
    var server  = email.server.connect({
        user:    amConst.constants.MAIL_USER1,
        password:amConst.constants.MAIL_USER2,
        host:    amConst.constants.MAIL_HOST,
        port:    465,
        ssl:     true,
    });

    //开始发送邮件
    server.send({
        text:    content,
        from:    amConst.constants.MAIL_SENDER,
        to:      to,
        subject: subject,
        attachment:
            [
                {data: html_data, alternative:true},
            ]
    }, function(err, message) {
        //回调函数
        if (cb) {
            cb(err, message);
        }
    });
}