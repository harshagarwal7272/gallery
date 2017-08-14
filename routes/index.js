var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/newgallery');

/* GET home page. */


router.get('/',function(req, res, next) {
		var posts = db.get('posts');
		posts.find({},{},function(err,posts){
			res.render('index',{
				"posts": posts
			});
		});
});

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

module.exports = router;
