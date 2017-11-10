#!/bin/bash

docker run --name am_db_mysql -e MYSQL_ROOT_PASSWORD=public -e MYSQL_DATABASE=AutoMaster -p 3306:3306 -d mysql:5.6