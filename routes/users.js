var express = require('express');
var router = express.Router();
var multer = require('multer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var flash = require('connect-flash');

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
  	'title': 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
  	'title': 'Login'
  });
});

var upload = multer({dest:'./public/images/uploads'});

router.post('/register',upload.single('profileimage'),function(req,res,next){
	var name = req.body.name;
	var email = req.body.email;
//	var body = req.body.body;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if(req.file){
		console.log('Uplaoding files..');
		var profileImageOriginalName = req.file.originalname;
		var profileImageName = req.file.filename;
		var profileImageMime = req.file.mimeType;
		var profileImagePath = req.file.path;
		var profileImageExt = req.file.extension;
		var profileImageSize = req.file.size;
	}else{
		var profileImageName = 'ab.png'
	}

	//Form validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
//	req.checkBody('body','Body is required').notEmpty();
	req.checkBody('email','Email not valid').isEmail();
	req.checkBody('username','UserName field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);	
	console.log('well well');
	User.findOne({'username':username},function(err,user){
		console.log('hello');
		if(err)throw err;
		if(user){
				console.log('already registered');				
				res.render('register',{
					error : {msg:'Username already exists'},
					name:name,
					email:email,
					username:username,
					password:password,
					password2:password2
				});
		}
		else{
			//check for errors
			var errors = req.validationErrors();
			if(errors){
				res.render('register',{
					errors:errors,
					name:name,
					email:email,
					username:username,
					password:password,
					password2:password2
				});
			}else{
				var newUser = new User({
					name : name,
					email : email,
			//			body : body,
					username : username,
					password : password,
					profileimage: profileImageName
				});

				//create user
				
				User.createUser(newUser,function(err,user){
					if(err)throw err;
					console.log(user);
				});
				

				//success message
				req.flash('success','you are now registered and may log in');
				res.location('/');
				res.redirect('/');
			}
		}
	});
});

passport.serializeUser(function(user,done){
	done(null,user.id);
});

passport.deserializeUser(function(id,done){
	User.getUserById(id,function(err,user){
		done(err,user);
	});
});

passport.use('local-login',new LocalStrategy(
		function(username,password,done){
			User.getUserByUsername(username,function(err,user){
					if(err)throw err;
					if(!user){
						console.log('Unknown user');
						return done(null,false,{message:'Unknown User'});
					}
					User.comparePassword(password,user.password,function(err,isMatch){
						if(err)throw err;
						if(isMatch){
							return done(null,user);
						}else{
							console.log("Invalid password");
							return done(null,false,{message:'Invalid password'});
						}
					});
			});
		}
	));


router.post('/login',passport.authenticate('local-login',{failureRedirect:'/users/login',failureFlash:'Invalid username or password'}),function(req,res){
	console.log('Authentication successfull');
//	global.username = req.body.username;
//	console.log(username);
	req.flash('Success','you are logged in');
//	res.send(req.body.username);
	res.redirect('/');
});

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','you have logged out');
	res.redirect('/users/login');
});
/*
router.get('/profile', function(req, res){
  res.render('profile', { username: req.user.username });
});
*/
module.exports = router;
