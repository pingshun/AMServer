var mysql = require('mysql');
var $conf = require('../conf/db');
var log = require('log4js').getLogger("am_backup_model");
var dbHelper = require('../backend/utils/db/dbHelper');

var pool  = mysql.createPool($conf.mysql);

module.exports = {
    create: function (user_id, backup, cb) {
        pool.getConnection(function(err, connection) {
            connection.query("INSERT INTO am_backup (user_id, backup_string) VALUES (?,?)", [user_id, backup], function(err, result) {
                if(cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    getByUserID: function (user_id, cb) {
        pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM am_backup WHERE user_id =?", [user_id], function(err, result) {
                if (cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    executeSQL: function (sql, params, cb) {
        pool.getConnection(function(err, connection) {
            connection.query(sql, params, function(err, result) {
                if (cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    batchUpdate: function (backup_data, user_id, cb) {

        this.getByUserID(user_id, function (err, result) {
            if (err) {
                log.error(err);
                if (cb) {
                    var res_data = {
                        error: 1,
                        message: '查询已存在备份数据出错',
                    };
                    cb(res_data);
                }
            } else {
                var arrSqlEntities = [];
                for (var i = 0; i < backup_data.length; i++) {

                    var guid = backup_data[i].guid;
                    var exist_id = '';
                    var exist_data = '';
                    for (var j = 0; j < result.length; j++) {
                        if (guid === result[j].guid) {
                            exist_id = result[j].id;
                            exist_data = result[j].backup_string;
                            break;
                        }
                    }
                    var time = new Date().getTime();
                    var string_data = JSON.stringify(backup_data[i]);

                    if (exist_id) {
                        if (exist_data !== string_data) {
                            // update
                            arrSqlEntities.push(dbHelper.getSqlPrarmEntity(
                                'UPDATE am_backup SET backup_string =?, update_time =? WHERE id =?',
                                [string_data, time, exist_id]
                            ));
                        }
                    } else {
                        // insert
                        arrSqlEntities.push(dbHelper.getSqlPrarmEntity(
                            'INSERT INTO am_backup (user_id, guid, car_name, backup_string, update_time) VALUES (?,?,?,?,?)',
                            [user_id, backup_data[i].guid, backup_data[i].name, string_data, time]
                        ));
                    }
                }
                if (arrSqlEntities.length > 0) {
                    dbHelper.execTrans(arrSqlEntities, function(error, result) {
                        if (error && cb) {
                            cb({
                                error: 1,
                                message: '批量更新备份失败',
                            });
                        } else {
                            if (cb) {
                                cb({
                                    success: 1,
                                    message: '数据备份成功',
                                });
                            }
                        }
                    });

                } else {
                    if (cb) {
                        cb({
                            success: 1,
                            message: '数据不需要更新',
                        });
                    }
                }
            }
        });
    }
};