var tableBase = require('./tableBase');
var itemLastService = require('./itemLastService');
var carModel = require('./car');
var util = require('./../utils/amUtil');
var Q = require('q');

module.exports = ServiceItem;

function ServiceItem() {
    tableBase.call(ServiceItem);
};

util.inherits(ServiceItem, tableBase);

ServiceItem._table_name = 'service_item';

ServiceItem.refreshLastService = function (service_item, cb) {

    itemLastService.getsByFields({id: service_item.id}, function (err, res) {
        if(!err && res.length > 0) {
            service_item.last_service_time = res[0].last_service_time;
            service_item.last_service_mileage = res[0].last_service_mileage;
            if (cb) {
                cb(service_item);
            }
        } else {
            // set bought_date to the last_service_time if there is no service record existing for one service item
            carModel.getById(service_item.car_id, function (err, car) {
                service_item.last_service_mileage = 0;
                if (!err && car) {
                    service_item.last_service_time = car.bought_date;
                } else {
                    service_item.last_service_time = null;
                }
                if (cb) {
                    cb(service_item);
                }
            });


        }
    });
}