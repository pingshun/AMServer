var mysql = require('mysql');
var $conf = require('../../conf/db');
var log = require('log4js').getLogger("commen_db_model");
var dbHelper = require('./dbHelper');
var bootstrapSql = require('../../init/bootstrapSql');

var pool  = mysql.createPool($conf.mysql);

module.exports = {
    create: function(table_name, data, cb) {
        pool.getConnection(function(err, connection) {

            var col_name_string = '';
            var value_string = '';
            var values = [];
            Object.keys(data).forEach(function(key) {
                var val = data[key];
                if (col_name_string === '') {
                    col_name_string += (key);
                    value_string += '?';
                } else {
                    col_name_string += (", " + key);
                    value_string += (",?");
                }
                values.push(val);
            });

            var insert = "INSERT INTO " + table_name + " (" + col_name_string + ") VALUES (" + value_string + ")";

            connection.query(insert, values, function(err, result) {
                if(cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    query: function(table_name, data, cb) {
        pool.getConnection(function(err, connection) {
            var select = "SELECT * FROM " + table_name;
            var where = '';
            var null_para = '';
            var values = [];

            Object.keys(data).forEach(function(key) {
                var value = data[key];
                if (value === 'null' || value === 'undefined') {
                    if (null_para === '') {
                        null_para += ' ' + key + ' IS NULL';
                    } else {
                        null_para += ' AND ' + key + 'IS NULL';
                    }
                } else {
                    var where_str = key;

                    if (value.toString().indexOf(',') > 0) {
                        value = value.split(',');
                    }

                    if (typeof value === 'object') {
                        where_str += " IN (";
                        for (var i = 0; i < value.length; i++) {
                            where_str += "?,";
                        }
                        where_str = where_str.substring(0, where_str.length - 1);
                        where_str += ") ";
                    } else {
                        where_str += " =? ";
                    }

                    if (values.length == 0) {
                        where += where_str;
                    } else {
                        where += ('AND ' + where_str);
                    }

                    if (typeof value === 'object') {
                        values = values.concat(value);
                    } else {
                        values.push(value);
                    }
                }
            });
            var sql = select + ((values.length || null_para !== '') ? ' WHERE ' : '') + where;
            sql += null_para !== '' ? (where !== '' ? ' AND ' + null_para : null_para) : '';
            connection.query(sql, values, function(err, result) {
                if(cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    delete: function(table_name, data, cb) {
        pool.getConnection(function(err, connection) {
            var sql_delete = "DELETE FROM " + table_name;
            var where = ' WHERE ';
            var values = [];
            Object.keys(data).forEach(function(key) {
                var value = data[key];
                if (values.length == 0) {
                    where += (key + ' =? ');
                } else {
                    where += ('and ' + key + ' =? ');
                }
                values.push(value);
            });
            connection.query(sql_delete + (values.length ? where : ''), values, function(err, result) {
                if(cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    update: function(table_name, data, cb) {
        var id = data.id;
        delete data.id;
        if (!id) {
            var msg = "Can not update object [table_name:" + table_name + "], no id found in the update data";
            log.error(msg);
            log.error(data);
            if (cb) {
                var error = {
                    error: 1,
                    message: msg,
                };
                cb(error);
            }
        }

        pool.getConnection(function(err, connection) {
            var update = "UPDATE " + table_name + " SET ";
            var col_name_string = '';
            var values = [];

            Object.keys(data).forEach(function (key) {
                var value = data[key];
                if (col_name_string === '') {
                    col_name_string += (key + " = ?");
                } else {
                    col_name_string += (", " + key + " = ?");
                }
                values.push(value);
            });

            update += col_name_string;
            update += (" WHERE id = ?");
            values.push(id);


            connection.query(update, values, function (err, result) {
                if (cb) {
                    cb(err, result);
                }
                connection.release();
            });
        });
    },
    bootstrap: function (cb) {
        var arrSqlEntities = bootstrapSql.sqls;
        if (arrSqlEntities.length > 0) {
            dbHelper.execTrans(arrSqlEntities, function(error, result) {
                if (error && cb) {
                    log.debug("bootstrap db failed!");
                    cb({
                        error: 1,
                        message: 'bootstrap db 失败',
                    });
                } else {
                    log.debug("bootstrap db successfully!")
                    if (cb) {
                        cb({
                            success: 1,
                            message: 'bootstrap db 成功',
                        });
                    }
                }
            });

        }
    }
}