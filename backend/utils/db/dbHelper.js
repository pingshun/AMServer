var mysql = require('mysql');
var async = require("async");
var $conf = require('../../conf/db');
var log = require('log4js').getLogger("db_helper");

module.exports = {
    execTrans: execTrans,
    getSqlPrarmEntity: getSqlParamEntity,

}

var pool = mysql.createPool($conf.mysql);

function getSqlParamEntity(sql, params) {
    return {
        sql: sql,
        params: params
    };
}

function execTrans(sqlparamsEntities, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return callback(err, null);
        }
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err, null);
            }
            log.debug("begin execTransaction, count: " + sqlparamsEntities.length);
            var funcAry = [];
            sqlparamsEntities.forEach(function (sql_param) {
                var temp = function (cb) {
                    var sql = sql_param.sql;
                    var param = sql_param.params;
                    connection.query(sql_param, param, function (tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function () {
                                log.error("transaction failed" + sql_param + "，ERROR：" + tErr);
                                throw tErr;
                            });
                        } else {
                            return cb(null, 'ok');
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function (err, result) {
                if (err) {
                    connection.rollback(function (err) {
                        log.error("transaction error: " + err);
                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function (err, info) {
                        log.info("transaction info: " + JSON.stringify(info));
                        if (err) {
                            log.error("transaction failed: " + err);
                            connection.rollback(function (err) {
                                log.error("transaction error: " + err);
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, info);
                        }
                    })
                }
            })
        });
    });
}