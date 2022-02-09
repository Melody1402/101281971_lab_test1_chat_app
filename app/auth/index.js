
var passport 	= require('passport');

var LocalStrategy  = require('passport-local').Strategy;
var User = require('../models/user');

var init = function(){

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalStrategy(
	  function(username, password, done) {
	  	if(username === '' || password === ''){
	  		return done(null, false, { message: 'Required.' });
	  	}

	    User.findOne({ username: username }, function(err, user) {
	      if (err) { return done(err); }
	      if (!user) {
	        return done(null, false, { message: 'Wrong info.' });
	      }

	      user.validatePassword(password, function(err, isMatch) {
	        	if (err) { return done(err); }
	        	if (!isMatch){
	        		return done(null, false, { message: 'Wrong info.' });
	        	}
	        	return done(null, user);
	      });

	    });
	  }
	));
	
	return passport;
}
	
module.exports = init();