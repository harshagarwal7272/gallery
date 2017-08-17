var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/newgallery');

router.get('/',function(req, res, next) {
		var posts = db.get('posts');
		posts.find({},{},function(err,posts){
			res.render('index',{
				"posts": posts
			});
		});
});

router.get('/myprofile',isLoggedIn,function(req,res,next){
		res.render('profile',{
		});
});
/*
router.get('/data',function(req,res){
	var users = db.get('users');
	users.findOne(function(err,datas){
		if (err) {
			res.send(err);
		}
			res.send(datas);
	});
});
*/

router.post('/',function(req,res,next){
	var body = req.body.body;
	var postid = req.body.postid;
	var commentdate = new Date();
	var comments = {"body": body, "commentdate": commentdate};
	var posts = db.get('posts');
	posts.update({
		"_id": postid
		},
		{
			$push:{
				"comments":comments
			}
		},
		function(err,doc){
			if(err){
				throw err;
			}else{
				req.flash('Success','comment added');
				res.location('/');
				res.redirect('/');
			}
		}
	);
});


router.get('/about',function(req, res, next) {
  res.render('about', { title: 'About' });
});

function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else
	{
		res.redirect('/users/login');
	}
}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = router;
