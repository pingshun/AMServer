var log 		= require('log4js').getLogger("db_model");
var dbOperator      = require('../utils/db/dbOperator');

module.exports = TableBase;

function TableBase() {}

TableBase._table_name = '';

TableBase.preCreate = function(args) {};
TableBase.createNew = function(args, cb) {
    this.preCreate(args);
    dbOperator.create(this._table_name, args, function(error, result) {
        if(cb) {
            cb(error, result);
        }
    });
};

TableBase.getById = function (id, cb) {
    dbOperator.query(this._table_name, {'id': id}, function(error, result) {
        if(cb) {
            cb(error, ((result && result.length > 0) ? result[0] : null ));
        }
    });
}

TableBase.getsAll = function (cb) {
    dbOperator.query(this._table_name, {}, function(error, result) {
        if(cb) {
            cb(error, result);
        }
    });
}

TableBase.getsByFields = function (fields, cb) {
    dbOperator.query(this._table_name, fields, function(error, result) {
        if(cb) {
            cb(error, result);
        }
    });
}