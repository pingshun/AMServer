var tableBase = require('./tableBase');
var util = require('./../utils/amUtil');

module.exports = ItemLastService;

function ItemLastService() {
    tableBase.call(ItemLastService);
};

util.inherits(ItemLastService, tableBase);

ItemLastService._table_name = 'item_last_service';
