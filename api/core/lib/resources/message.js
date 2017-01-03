var resourceBase = require('./base'),
	Q = require('q'),
	crypto = require('crypto'),
	Message = resourceBase('messages', 'message');
module.exports = Message;
