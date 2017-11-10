var express = require('express');
var Q = require('q');
var userModel = require('../model/user');
var amEncrypt = require('../utils/amEncrypt');
var dbOperator = require('../utils/db/dbOperator');
var log = require('log4js').getLogger("api");
var router = express.Router();

var amUtil = require('../utils/amUtil')

var car = require('../model/car');
var serviceItem = require('../model/serviceItem');
var serviceRecord = require('../model/serviceRecord');
var item2Record = require('../model/item2Record');


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


router.get('/am_db_bootstrap',function(req,res,next) {
    var result = dbOperator.bootstrap(function(error, result) {
        res.send(result);
    });
});


//请求配置
router.post('/login', function(req,res,next){
    userModel.getByName(req.body.user, function (err, result) {
        var res_data;
        if (err) {
            log.error(err);
            res_data = {
                error: 1,
                message: '未知错误',
            };
            res.send(res_data);
        } else {
            if (result.length > 0 && amEncrypt.decrypt(result[0].password) === amEncrypt.decrypt(req.body.password)) {
                res_data = {
                    id: result[0].id,
                    username: result[0].name,
                    gender: result[0].gender,
                    email: result[0].email,
                    token: result[0].token,
                };
                req.session.user = res_data;
            } else {
                res_data = {
                    error: 1,
                    message: '用户不存在或密码错误!',
                };
            }
        }
        log.debug(res_data);
        res.send(res_data);
    });
});




router.post('/get_cars', ensureToken, ensureAuthorized, function(req, res, next) {

    car.getsByFields({user_id: req.user_id}, function (error, cars) {
        if (error) {
            console.error(error);
            res.send('error');
        } else {

            var ps = [];
            for (var i = 0; i < cars.length; i++) {
                (function (i) {

                    var deferred_item = Q.defer();
                    var deferred_record = Q.defer();

                    serviceItem.getsByFields({'car_id': cars[i]['id']}, function (err, items) {
                        if (!err) {
                            var ps_item = [];
                            for (var index_item = 0; index_item < items.length; index_item++) {
                                ps_item.push((function (index) {
                                    var deferred_refresh = Q.defer();
                                    serviceItem.refreshLastService(items[index], function (item) {
                                        deferred_refresh.resolve();
                                    });
                                    return deferred_refresh.promise;
                                })(index_item));
                            }
                            Q.all(ps_item).then(function () {
                                cars[i]['service_items'] = items;
                                deferred_item.resolve();
                            });
                        } else {
                            deferred_item.resolve();
                        }
                    });

                    serviceRecord.getsByFields({'car_id': cars[i]['id']}, function (err, records) {
                        if (!err) {
                            var ps_record = [];
                            for (var j = 0; j < records.length; j++) {
                                ps_record.push((function (j) {
                                    var deferred = Q.defer();
                                    item2Record.getsByFields({'record_id': records[j]['id']}, function (err, data) {
                                        if (!err) {
                                            records[j]['service_items'] = data;
                                        }
                                        deferred.resolve();
                                    });
                                    return deferred.promise;
                                })(j));
                            }
                            Q.all(ps_record).then(function () {
                                cars[i]['service_records'] = records;
                                deferred_record.resolve();
                            })
                        } else {
                            deferred_record.resolve();
                        }

                    });

                    ps.push(deferred_item.promise);
                    ps.push(deferred_record.promise);

                })(i);
            }

            Q.all(ps).then(function(){
                res.send(cars);
            }, function(){
                res.send('未知错误');
            });

        }
    });

});

router.post('/add_car', ensureToken, ensureAuthorized, function (req, res, next) {
    var data = req.body;
    data['user_id'] = req.user_id;

    car.createNew(data, function (error, result) {
        if (error) {
            res.send({
                error: 1,
                message: "Failed to add Car!",
            });
            return;
        } else {
            log.debug("Add Car successfully[id: " + result.insertId + "]");
            data.service_items = [];
            serviceItem.getsByFields({car_id: 'null'}, function (error, items) {
                if (error) {
                    log.error(error);
                    res.send(data);
                } else {
                    var ps = [];
                    for (var i = 0; i < items.length; i++) {
                        ps.push((function (i) {
                            var deferred = Q.defer();
                            items[i]['car_id'] = result.insertId;
                            delete items[i].id;
                            serviceItem.createNew(items[i], function (error, insert_res) {
                                if (error) {
                                    log.error(error);
                                } else {
                                    items[i]['id'] = insert_res.insertId;
                                    items[i]['last_service_mileage'] = 0;
                                    items[i]['last_service_time'] = data.bought_date;
                                    data.service_items.push(items[i]);
                                }
                                deferred.resolve();
                            });

                            return deferred.promise;
                        })(i));
                    }

                    Q.all(ps).then(function() {
                        data.id = result.insertId;
                        res.send(data);
                        /*serviceItem.getsByFields({'car_id': data.id}, function (error, items) {
                            if (error) {
                                res.send(data);
                            } else {
                                data.service_items = items;
                                res.send(data);
                            }
                        });*/

                    }, function () {
                        res.send(data);
                    });
                }
            });

        }
    });

});

router.post('/am_db_operator', ensureToken, ensureAuthorized, function(req,res,next) {

    var data = req.body;

    var user_id = req.user_id;
    var op_type = data.db_op_type;
    var table_name = data.db_op_table_name;
    var id = data.id;
    delete data.db_op_type;
    delete data.db_op_table_name;

    if (!op_type || !table_name) {
        res.send({
            error: 1,
            message: "'op_type' or 'table' is not found!",
        });
        return;
    }

    if (Object.keys(data).length < 1 && op_type !== 'query') {
        res.send({
            error: 1,
            message: "no operator content is found!",
        });
        return;
    }

    if (op_type === 'create') {
        if (table_name === 'car') {
            data['user_id'] = user_id;
        }
        dbOperator.create(table_name, data, function(error, result) {
            if (error) {
                log.error(error);
                res.send({
                    error: 1,
                    message: "db operator error!",
                });
            } else {
                log.debug("Add data successfully[id: " + result.insertId + ", table_name: " + table_name + "]");
                res.send({
                    insertId: result.insertId,
                });
            }
        });
    } else if (op_type === 'query') {
        if (table_name === 'car') {
            data['user_id'] = user_id;
        }
        dbOperator.query(table_name, data, function(error, result) {
            if (error) {
                log.error(error);
                res.send({
                    error: 1,
                    message: "db operator error!",
                });
            } else {
                res.send(result);
            }
        });
    } else if (op_type === 'delete') {
        dbOperator.delete(table_name, data, function(error, result) {
            if (error) {
                log.error(error);
                res.send({
                    error: 1,
                    message: "db operator error!",
                });
            } else {
                log.debug(result);
                res.send(result);
            }
        });
    } else if (op_type === 'update') {
        dbOperator.update(table_name, data, function(error, result) {
            if (error) {
                log.error(error);
                res.send({
                    error: 1,
                    message: "db operator error!",
                });
            } else {
                log.debug(result);
                res.send(result);
            }
        });
    }

});


router.post('/get_all', ensureToken, ensureAuthorized, function(req, res, next) {

});


function ensureToken(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send({
            error: 1,
            message: 'no token found!!',
        });
    }
}


function ensureAuthorized(req, res, next) {
    userModel.getByToken(req.token, function (err, result) {
        if (err) {
            log.error(err);
            res.send({
                error: 1,
                message: 'server error!!',
            });
        } else {
            if (result.length == 1) {
                req.user_id = result[0].id;
                next();
            } else {
                res.send({
                    error: 1,
                    message: 'invalid token!!',
                });
            }
        }
    });
}


// 检查用户登录状态
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','用户已经登录');
    return res.redirect('/');
  }
  next();
}

module.exports = router;
