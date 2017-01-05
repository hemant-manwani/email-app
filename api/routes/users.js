var router = require('express').Router(),
	Q = require('q'),
	Core = require('../core'),
	Errors = Core.Errors,
	User = Core.Resources.User,
	util = Core.Util,
	config = require('../core/lib/config');

router.get('/users', function(req, res, next) {
	var criteria = {};
  criteria = util.getFilters(req.query, criteria);
	var options = {sort:{"follow_up_date": -1}, skip: 0, limit: 10000};//util.createQueryOptions(req.query, config.allowedFields.user);
	User.find(criteria, options)
	.then(function (users) {
		res.send({"success": true, "data": users});
	})
	.fail(function (error) {
		return next(error);
	})
});
router.post('/user', function(req, res, next) {
	User.insert(req.body)
	.then(function (user) {
		res.send({"success": true, "data": user});
	})
	.fail(function (error) {
		return next(error);
	})
});
router.get('/health', function(req, res, next){
  res.send({success: true, data: null});
})
module.exports = router;
