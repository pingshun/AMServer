var Base = require('./tableBase');
var util = require('./../utils/amUtil');

module.exports = Car;

function Car() {
    Base.call(Car);
};

util.inherits(Car, Base);

Car._table_name = 'car';
