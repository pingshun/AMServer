var tableBase = require('./tableBase');
var util = require('./../utils/amUtil');

module.exports = ServiceRecord;

function ServiceRecord() {
    tableBase.call(ServiceRecord);
};

util.inherits(ServiceRecord, tableBase);

ServiceRecord._table_name = 'service_record';
