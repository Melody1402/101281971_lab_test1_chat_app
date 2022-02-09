'use strict';

var session 	= require('express-session');

var init = function () {

	return session({
		secret:"thi",
		resave: false,
		saveUninitialized: true
	});
}

module.exports = init();