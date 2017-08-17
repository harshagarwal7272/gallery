var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongo = require('mongodb');
var db = require('monk')('localhost/newgallery');


var upload = multer({dest:'./public/images/uploads'});


router.get('/add',isLoggedIn,function(req,res,next){
	res.render('addpost',{
		"title": "Add Post"
	});
});

router.post('/add',upload.single('mainimage'),function(req,res,next){
	var title = req.body.title;
	var author = req.body.author;
	var date = new Date();

	if(req.file){
		var mainImageOriginalName = req.file.originalname;
		var mainImageName = req.file.filename;
		var mainImageMime = req.file.mimeType;
		var mainImagePath = req.file.path;
		var mainImageExt = req.file.extension;
		var mainImageSize = req.file.size;
	}else{
		var mainImageName = "noimage.jpg";
	}

	//Form validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('author','Author name is required').notEmpty();

	var errors = req.validationErrors();
	if(errors)
	{
		res.render('addpost',{
			"errors":errors,
			"title":title,
			"author":author
		});
	}else{
		var posts = db.get('posts');
		posts.insert({
			"title":title,
			"author":author,
			"mainimage":mainImageName
		},function(err,post){
			if(err){
				res.send("There was an issue in submitting the post");
			}else{
				req.flash('success','post submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = router;
