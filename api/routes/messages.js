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
		var index = message.thread.length + 1;
		var item = {"item":{body: req.body.message, created: new Date()}, index: index}
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
	req.body.thread[0].item.index = 1;
	Message.insert(req.body)
	.then(function(message){
		console.log(message);
		// res.send({"success": true, "data": message});
		return sendMail(req.body.to, req.body.from, req.body.subject, req.body.thread[0].item.body, message._id, 1)
	})
	.then(function (message) {
		res.send({"success": true, "data": message});
	})
	.fail(function (error) {
		return next(error);
	})
});
var sendMail = function(mailTo, mailFrom, subject, content, messageId, replyId){
	var deffered = Q.defer();
  content = '<div>content'+'<img src="http://localhost:5000/notify_user/'+messageId+'/'+replyId+'"/>'+'</div>'
	var helper = require('sendgrid').mail

	from_email = new helper.Email(mailFrom)
	to_email = new helper.Email("hemantatiitr@gmail.com")
	content = new helper.Content("text/html", content)
	mail = new helper.Mail(from_email, subject, to_email, content)

	var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
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
