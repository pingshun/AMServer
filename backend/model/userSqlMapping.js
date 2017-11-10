var user = {
	insert:'INSERT INTO am_user(name, password, email, token) VALUES(?,?,?,?)',
	update:'update am_user set name=?, password=? where id=?',
	delete: 'delete from am_user where id=?',
	queryById: 'select * from am_user where id=?',
	queryByNameAndPwd:'select id from am_user where name=? and password=?',
	queryByName: 'SELECT * FROM am_user WHERE name=?',
	queryByToken: 'SELECT * FROM am_user WHERE token=?',
	queryAll: 'select * from am_user'
};
 
module.exports = user;
