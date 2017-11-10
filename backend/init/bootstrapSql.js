
var all_sqls = [
    //"CREATE DATABASE AutoMaster DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci",

    "ALTER DATABASE AutoMaster CHARACTER SET utf8",
    "ALTER DATABASE AutoMaster COLLATE utf8_general_ci ",

    "DROP VIEW IF EXISTS item_last_service;",

    "DROP TABLE IF EXISTS item2record",
    "DROP TABLE IF EXISTS service_item",
    "DROP TABLE IF EXISTS service_record",
    "DROP TABLE IF EXISTS car",
    "DROP TABLE IF EXISTS am_user",

    "CREATE TABLE am_user ( " +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "name VARCHAR(100) NOT NULL, " +
        "gender INTEGER, " +
        "password VARCHAR(100) NOT NULL, " +
        "email VARCHAR(100) NOT NULL, " +
        "token VARCHAR(10000), " +
        "reset_pw_req_time BIGINT," +
        "reset_pw_req_id VARCHAR(36)," +

        "PRIMARY KEY (id) " +
    ")",

    "CREATE TABLE car ( " +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "user_id INT NOT NULL, " +
        "guid VARCHAR(36) NOT NULL, " +
        "name VARCHAR(32) NOT NULL, " +
        "bought_date BIGINT NOT NULL, " +
        "plate_num VARCHAR(32), " +
        "add_time BIGINT NOT NULL, " +
        "brand VARCHAR(32), " +
        "mileage INT, " +
        "vin VARCHAR(32), " +
        "engine_id VARCHAR(32), " +
        "last_update BIGINT, " +
        "remark VARCHAR(255), " +

        "PRIMARY KEY (id), " +
        "CONSTRAINT FK_CAR_USER_ID_2_USER_ID FOREIGN KEY (user_id) REFERENCES am_user (id) ON DELETE CASCADE " +
    ")",

    "CREATE TABLE service_item ( " +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "car_id INT, " +
        "type INT, " +
        "name VARCHAR(32) NOT NULL, " +
        "mileage_period INT, " +
        "time_period INT, " +

        "PRIMARY KEY (id), " +
        "CONSTRAINT FK_SERVICE_ITEM_2_CAR_ID FOREIGN KEY (car_id) REFERENCES car (id) ON DELETE CASCADE " +
    ")",

    "CREATE TABLE service_record( " +
        "id INT NOT NULL AUTO_INCREMENT, " +
        "car_id INT NOT NULL, " +
        "mileage INT NOT NULL, " +
        "finish_time BIGINT, " +
        "service_store VARCHAR(255), " +
        "cost INT, " +
        "add_time BIGINT, " +
        "remark VARCHAR(255), " +
        "PRIMARY KEY (id), " +
        "CONSTRAINT FK_SERVICE_RECORD_2_CAR_ID FOREIGN KEY (car_id) REFERENCES car (id) ON DELETE CASCADE " +
    ")",

    "CREATE TABLE item2record( " +
        "id INTEGER NOT NULL AUTO_INCREMENT, " +
        "item_id INT, " +
        "record_id INT, " +

        "PRIMARY KEY (id), " +
        "CONSTRAINT FK_ITEM2RECORD_2_ITEM_ID FOREIGN KEY (item_id) REFERENCES service_item (id) ON DELETE CASCADE , " +
        "CONSTRAINT FK_ITEM2RECORD_2_RECORD_ID FOREIGN KEY (record_id) REFERENCES service_record (id) ON DELETE CASCADE " +
    ")",


    "CREATE VIEW item_last_service AS SELECT item.id, item.name, max(record.finish_time) last_service_time, max(record.mileage) last_service_mileage " +
    "FROM service_record record, service_item item, item2record rel " +
    "WHERE record.id = rel.record_id AND item.id = rel.item_id " +
    "GROUP BY item.id",

    "INSERT INTO am_user (name, password, email, token) values ('admin', '7ad04efe85006f1bd3', 'admin@emontech.cn', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGVtb250ZWNoLmNuIiwiaWF0IjoxNDgzMDgwODU5fQ.6ME3Kttl96OWm_nYDfyPjcA64AXFZNE8uECkn03nk9Y')",

    "INSERT INTO `car` VALUES (1,1,'23786588-071a-486e-e4a7-65b1fddb32c4','明锐',1356926400000,'京NPS260',1481697166026,'98',69604,NULL,NULL,1506861872223,NULL);",

    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('更换机油', 1, 10000, 12);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('汽油滤芯', 2, 10000, 12);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('空气滤芯', 3, 10000, 12);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('空调滤芯', 4, 10000, 12);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('制动液', 5, 40000, 24);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('防冻液', 6, 30000, 24);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('更换轮胎', 7, 60000, 60);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('正时皮带', 8, 80000, 48);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('刹车片', 9, 50000, 0);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('火花塞', 10, 40000, 0);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('电瓶', 11, 60000, 48);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('变速箱油', 12, 40000, 36);",
    "INSERT INTO service_item (name, type, mileage_period, time_period) VALUES ('机动车年检', 13, 0, 12);",

    "INSERT INTO `service_item` VALUES (14,1,1,'更换机油',10000,12);",
    "INSERT INTO `service_item` VALUES (15,1,2,'汽油滤芯',10000,12);",
    "INSERT INTO `service_item` VALUES (16,1,3,'空气滤芯',10000,12);",
    "INSERT INTO `service_item` VALUES (17,1,4,'空调滤芯',10000,12);",
    "INSERT INTO `service_item` VALUES (18,1,5,'制动液',40000,24);",
    "INSERT INTO `service_item` VALUES (19,1,6,'防冻液',30000,24);",
    "INSERT INTO `service_item` VALUES (20,1,7,'更换轮胎',60000,60);",
    "INSERT INTO `service_item` VALUES (21,1,8,'正时皮带',80000,48);",
    "INSERT INTO `service_item` VALUES (22,1,9,'刹车片',50000,0);",
    "INSERT INTO `service_item` VALUES (23,1,10,'火花塞',40000,0);",
    "INSERT INTO `service_item` VALUES (24,1,11,'电瓶',60000,48);",
    "INSERT INTO `service_item` VALUES (25,1,12,'变速箱油',40000,36);",
    "INSERT INTO `service_item` VALUES (26,1,13,'机动车年检',0,12);",

    "INSERT INTO `service_record` VALUES (1,1,54082,1448640000000,'君奥达',0,1481697362213,NULL);",
    "INSERT INTO `service_record` VALUES (2,1,54300,1449331200000,'米其林',0,1481697434738,NULL);",
    "INSERT INTO `service_record` VALUES (3,1,59000,1466697600000,'君奥达',0,1481697557598,NULL);",
    "INSERT INTO `service_record` VALUES (4,1,60868,1477670400000,'君奥达',100,1481697635393,NULL);",
    "INSERT INTO `service_record` VALUES (5,1,61150,1481558400000,'古城车管所',0,1481697696447,NULL);",
    "INSERT INTO `service_record` VALUES (6,1,69604,1506700800000,'君奥达',134,1506752865112,NULL);",

    "INSERT INTO `item2record` VALUES (1,19,1);",
    "INSERT INTO `item2record` VALUES (2,18,1);",
    "INSERT INTO `item2record` VALUES (3,25,1);",
    "INSERT INTO `item2record` VALUES (4,20,2);",
    "INSERT INTO `item2record` VALUES (5,21,3);",
    "INSERT INTO `item2record` VALUES (6,23,3);",
    "INSERT INTO `item2record` VALUES (7,16,4);",
    "INSERT INTO `item2record` VALUES (8,14,4);",
    "INSERT INTO `item2record` VALUES (9,15,4);",
    "INSERT INTO `item2record` VALUES (10,22,4);",
    "INSERT INTO `item2record` VALUES (11,26,5);",
    "INSERT INTO `item2record` VALUES (12,14,6);",

];

module.exports = {
    sqls: all_sqls,
};
