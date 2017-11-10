#!/bin/bash
mysqldump -u**** -p**** **** > /root/backup/db/am_$(date +%Y%m%d_%H%M%S).sql

find /root/backup/db -mtime +30 -type f -name am* | xargs rm -f
