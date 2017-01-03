var router = require('express').Router(),
	Q = require('q'),
	Core = require('../core'),
	Errors = Core.Errors,
	Message = Core.Resources.Message,
  util = Core.Util,
	config = require('../core/lib/config');

router.get('/messages', function(req, res, next) {
	var criteria = {};
  criteria = util.getFilters(req.query, criteria);
	var options = util.createQueryOptions(req.query, config.allowedFields.message);
	Message.find(criteria, options)
	.then(function (messages) {
		res.send({"success": true, "data": messages});
	})
	.fail(function (error) {
		return next(error);
	})
});

module.exports = router;
