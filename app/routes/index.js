
var express	 	= require('express');
var router 		= express.Router();
var passport 	= require('passport');

var User = require('../models/user');
var Room = require('../models/room');

// Home page
router.get('/', function(req, res, next) {
	if(req.isAuthenticated()){
		return res.redirect('/rooms');
	}
	res.render('login', {
		success: req.flash('success')[0],
		errors: req.flash('error'), 
		showRegisterForm: req.flash('showRegisterForm')[0]
	});
});

// Login
router.post('/login', passport.authenticate('local', { 
	successRedirect: '/rooms', 
	failureRedirect: '/',
	failureFlash: true
}));

// Register
router.post('/register', function(req, res, next) {

	var credentials = {'username': req.body.username, 'password': req.body.password };
	if(credentials.username === '' || credentials.password === ''){
		req.flash('error', 'required');
		req.flash('showRegisterForm', true);
		return returnres.redirect('/');
	}
	// Check if the username already exists
	User.findOne({'username': req.body.username}, function(err, user){
		if(err) throw err;
		if(user){
			req.flash('error', 'this account already exist.');
			req.flash('showRegisterForm', true);
			res.redirect('/');
		}else{
			User.create(credentials, function(err, newUser){
				if(err) throw err;
				req.flash('success', 'Account is created. Please log in.');
				res.redirect('/');
			});
		}
	});
});

// Rooms
router.get('/rooms', User.isAuthenticated, function(req, res, next) {
	Room.find(function(err, rooms){
		if(err) throw err;
		res.render('rooms', { user: req.user, rooms });
	});
});

// Chat Room 
router.get('/chat/:id', User.isAuthenticated, function(req, res, next) {
	var roomId = req.params.id;
	Room.findById(roomId, function(err, room){
		if(err) throw err;
		if(!room){
			return next(); 
		}
		res.render('chatroom', { user: req.user, room: room });
	});
	
});

// Logout
router.get('/logout', function(req, res, next) {
	req.logout();
	// destroy session data
	req.session = null;
	// redirect to homepage
	res.redirect('/');
});

module.exports = router;