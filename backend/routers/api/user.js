var express = require('express');
var Q = require('q');
var log = require('log4js').getLogger("user");
var router = express.Router();

var userModel = require('./../../model/user');

var dbOperator = require('./../../utils/db/dbOperator');
var amUtil = require('./../../utils/amUtil');
var amConst = require('./../../utils/amConstants');


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


router.post('/register', function(req,res,next){
    userModel.getByName(req.body.user, function (err, result) {
        if (err) {
            log.error(err.message);
            res.send({
                error: 1,
                message: '未知错误',
            });
        } else {
            if (result && result.length > 0) {
                res.send({
                    error: 1,
                    message: '用户名已经存在!',
                });
            } else {
                userModel.create(req.body.user, req.body.password, req.body.email, function (err, result) {
                    if (err) {
                        log.error(err.message);
                        res.send({
                            error: 1,
                            message: '创建用户失败!',
                        });
                    } else {
                        res.send({
                            success: 1,
                            token: result.token,
                        });
                    }
                });
            }
        }
    });
});

router.post('/forgot_pw', function(req,res,next){
    userModel.getByName(req.body.user, function (err, result) {
        if (err) {
            log.error(err.message);
            res.send({
                error: 1,
                message: '未知错误',
            });
        } else {
            if (result && result.length > 0) {
                if (result[0]['email'] === req.body.email) {
                    var user = result[0];
                    // send email
                    var reset_pw_data = {
                        id: user.id,
                        reset_pw_req_id: amUtil.generateGuid(),
                        reset_pw_req_time: new Date().getTime(),
                    };
                    dbOperator.update('am_user', reset_pw_data, function(error, result) {
                        if (error) {
                            log.error(error);
                            res.send({
                                error: 1,
                                message: "请求失败!",
                            });
                        } else {
                            var link = "http://am.emontech.cn/reset_pw?user=" + user.name
                                + "&id=" + reset_pw_data.reset_pw_req_id
                                + "&timestamp=" + reset_pw_data.reset_pw_req_time;
                            var content = "请复制以下链接到浏览器以完成密码修改:<br/>" + link;
                            var subject = amConst.constants.APP_CNNAME + "密码重置链接";
                            var html = "<html>"
                                    + "Hi:<br/>"
                                    + "您于刚刚申请重置 " + amConst.constants.APP_CNNAME + " 的账户密码(如您未曾有过此操作，请忽略该邮件),<br/>"
                                    + "请点击此链接进行更改(本链接将在15分钟之后失效):<br/>"
                                    + '<a href="' + link + '">密码重置</a><br/>'
                                    + "如不能直接打开链接，请复制以下链接到浏览器以完成密码修改:<br/>"
                                    + link + "<br/>"
                                    + "<br/><br/>感谢您使用养车专家！"
                                    + "</html>";
                            amUtil.sendEmail('gpshun@163.com', subject, content, html, function (err, message) {
                                if (err) {
                                    log.error(err);
                                    res.send({
                                        error: 1,
                                        message: '发送邮件失败,请确认邮件地址正确！',
                                    });
                                } else {
                                    res.send({
                                        error: 0,
                                        message: '密码重置链接已经发送至您的邮箱,请尽快登录邮箱完成密码修改！',
                                    });
                                }
                            });

                        }
                    });

                } else {
                    res.send({
                        error: 1,
                        message: '用户名跟邮箱不匹配！',
                    });
                }
            } else {
                res.send({
                    error: 1,
                    message: '该用户名尚未注册！',
                });
            }
        }
    });
});

router.post('/reset_pw_req', function(req,res,next){
    log.info(req.body.user + '  ' + req.body.id);
    userModel.getByName(req.body.user, function (err, result) {
        if (err) {
            log.error(err.message);
            res.send({
                error: 1,
                message: '未知错误',
            });
        } else {
            log.info(result);
            if (result && result.length > 0) {
                var user = result[0];
                var now = new Date().getTime();
                log.info(now);
                if (user.reset_pw_req_id !== req.body.req_id || now - user.reset_pw_req_time > 15 * 60 * 1000) {
                    //链接失效
                    res.send({
                        error: 1,
                        message: '密码重置链接错误或者已经过期',
                    });
                } else {
                    res.send({
                        error: 0,
                    });
                }
            } else {
                res.send({
                    error: 1,
                    message: '重置链接错误',
                });
            }
        }
    });
});

router.post('/reset_pw', function(req,res,next){
    userModel.getByName(req.body.user, function (err, result) {
        if (err) {
            log.error(err.message);
            res.send({
                error: 1,
                message: '未知错误',
            });
        } else {
            if (result && result.length > 0) {
                var user = result[0];
                var now = new Date().getTime();
                if (user.reset_pw_req_id !== req.body.req_id || now - user.reset_pw_req_time > 60 * 60 * 1000) {
                    //链接失效
                    res.send({
                        error: 1,
                        message: '密码重置链接错误或者已经过期',
                    });
                } else {
                    var reset_pw_data = {
                        id: user.id,
                        reset_pw_req_id: null,
                        reset_pw_req_time: null,
                        password: req.body.password,
                    };
                    dbOperator.update('am_user', reset_pw_data, function(error, result) {
                        if (error) {
                            log.error(error);
                            res.send({
                                error: 1,
                                message: "修改密码失败!",
                            });
                        } else {
                            res.send({
                                error: 0,
                            });
                        }
                    });
                }
            } else {
                res.send({
                    error: 1,
                    message: '重置链接错误',
                });
            }
        }
    });
});

module.exports = router;
