var resourceBase = require('./base'),
	Q = require('q'),
	crypto = require('crypto'),
	User = resourceBase('users', 'user');

module.exports = User;
