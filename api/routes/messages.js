var router = require('express').Router(),
	Q = require('q'),
	Core = require('../core'),
	Errors = Core.Errors,
	Message = Core.Resources.Message,
  util = Core.Util,
	config = require('../core/lib/config');

router.get('/messages/:from/:to', function(req, res, next) {
	var criteria = {
		"$or":[{"from":req.params.from, "to": req.params.to},
					{"to":req.params.from, "from": req.params.to}]
	};
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
router.put('/message', function(req, res, next){
	var messageId = Message.Guid(req.body.id);
	Message.findOne({'_id':messageId})
	.then(function(message){
		if(message.thread==undefined)
			message.thread = [];
		var item = {"item":{body: req.body.message, created: new Date()}}
		message.thread.push(item);
		return Message.updateById(messageId,{"$set":{"thread":message.thread}})
	})
	.then(function(message){
		res.send({'success':true, 'data':message});
	})
	.fail(function(error){
		return next(error);
	})
});
router.post('/create_message', function(req, res, next){
	req.body.created = new Date();
	req.body.thread[0].item.created = new Date();
	sendMail(req.body.to, req.body.from, req.body.subject, req.body.thread[0].item.body)
	.then(function(response){
		console.log(response);
		return Message.insert(req.body)
	})
	.then(function (message) {
		res.send({"success": true, "data": message});
	})
	.fail(function (error) {
		return next(error);
	})
});
var sendMail = function(mailTo, mailFrom, subject, content){
	var deffered = Q.defer();

	var helper = require('sendgrid').mail

	from_email = new helper.Email(mailFrom)
	to_email = new helper.Email(mailTo)
	content = new helper.Content("text/plain", content)
	mail = new helper.Mail(from_email, subject, to_email, content)

	var sg = require('sendgrid')("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");
	var request = sg.emptyRequest({
	  method: 'POST',
	  path: '/v3/mail/send',
	  body: mail.toJSON()
	});

	sg.API(request, function(error, response) {
		if(error)
			deffered.reject(error);
		console.log(response);
		deffered.resolve(response);
	})
	return deffered.promise;
}

module.exports = router;
