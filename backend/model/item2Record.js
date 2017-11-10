var tableBase = require('./tableBase');
var util = require('./../utils/amUtil');

module.exports = Item2Record;

function Item2Record() {
    tableBase.call(Item2Record);
};

util.inherits(Item2Record, tableBase);

Item2Record._table_name = 'item2record';
