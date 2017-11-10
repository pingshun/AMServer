var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("index");

/*以下是路由配置*/

/* GET home page. */
router.get('/',checkLogin);
router.get('/', function(req, res, next) {
	posts = [];
    res.render('main/index', {title: 'Main'});
});

// router.get('/login',checkNotLogin);
router.get('/login',function(req,res,next){
	res.render('login/login', {'title': 'Login'});
});
router.get('/register',function(req,res,next){
	res.render('register/register', {'title': 'Register'});
});
router.get('/reset_pw',function(req,res,next){
    res.render('reset_pw', {'title': 'reset password'});
});

router.get('/found',checkLogin);
router.get('/found',function(req,res,next){
	res.render('found/found');
});

router.get('/guangzhu',function(req,res,next){
	res.render('guangzhu/guanzhu');
});

router.get('/register',function(req,res,next){
	res.render('register',{title:'用户注册'});
});

router.get('/home',function(req,res,next){
	console.log('ok');
	var user = {
		username : 'admin',
		password : 'admin'
	}
	res.locals.user = req.session.user;
	log.debug(res.locals.user);
	res.redirect('/');
});


router.get("/logout", checkLogin);
router.get('/logout',function(req,res,next){
	req.session.user=null;
	res.redirect('/login');
});

/*路由配置end*/



function checkLogin(req,res,next){
	log.debug(req.session.user);
	if(!req.session.user){
		console.log(req.session.user);
		req.flash('error','用户未登录');
		return res.redirect('/login');
	}
	next();
}
module.exports = router;


