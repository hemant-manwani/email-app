var router = require('express').Router(),
	Q = require('q'),
	Core = require('../core'),
	Errors = Core.Errors,
	Message = Core.Resources.Message,
	User = Core.Resources.User,
  util = Core.Util,
	config = require('../core/lib/config');

router.get('/messages/:from/:to', function(req, res, next) {
	var criteria = {
		"$or":[{"from":req.params.from, "to": req.params.to},
					{"to":req.params.from, "from": req.params.to}]
	};
	criteria = util.getFilters(req.query, criteria);
	//var options = util.createQueryOptions(req.query, config.allowedFields.message);
	var options = {sort: {created: -1}, skip:0, limit: 10000};
	Message.find(criteria, options)
	.then(function (messages) {
		res.send({"success": true, "data": messages});
	})
	.fail(function (error) {
		return next(error);
	})
});
router.get('/notify_user/:id/:index', function(req, res, next) {
	var id = Message.Guid(req.params.id);
	var index = req.params.index;

	Message.findById(id)
	.then(function (message) {
		var thread = message.thread;
		for(var i=0; i<thread.length; i++){
			if(thread[i].item.index == index){
				thread[i].item.hasRead = true;
			}
		}
		return Message.updateById(id, {"$set":{"thread": thread}})
	})
	.then(function(message){
		res.send({success: true, data: message});
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
		return updateUser(message);
	})
	.then(function(reponse){
		res.send({'success':true, 'data':response});
	})
	.fail(function(error){
		return next(error);
	})
});
router.post('/sendgrid_callback', function(req, res, next){
	var messageId = Message.Guid(req.body.mongo_id);
	Message.findOne({'_id':messageId})
	.then(function(message){
		if(message.thread==undefined)
			message.thread = [];
		var index = message.thread.length + 1;
		var item = {"item":{body: req.body.content, created: new Date()}, index: index}
		message.thread.push(item);
		return Message.updateById(messageId,{"$set":{"thread":message.thread}})
	})
	.then(function(reponse){
		res.send({'success':true, 'data':response});
	})
	.fail(function(error){
		return next(error);
	})
});
router.post('/create_message', function(req, res, next){

	req.body.created = new Date();
	req.body.thread[0].item.created = new Date();
	req.body.thread[0].item.index = 1;
  var newMessage;
	var email = {};
	Message.insert(req.body)
	.then(function(message){
		email = message;
		return updateUser(message);
	})
	.then(function(response){
		newMessage = response;
		return sendMail(req.body.to, req.body.from, req.body.subject, req.body.thread[0].item.body, email._id, 1)
	})
	.then(function (mailres) {
		res.send({"success": true, "data": newMessage});
	})
	.fail(function (error) {
		return next(error);
	})
});
var sendMail = function(mailTo, mailFrom, subject, content, messageId, replyId){
	var deffered = Q.defer();
  content = '<div>'+content+'<img width="1" height="1" border="0" src="http://54.169.218.46:5000/notify_user/'+messageId+'/'+replyId+'"/>'+'</div>'
	var helper = require('sendgrid').mail

	from_email = new helper.Email(mailFrom)
	to_email = new helper.Email("hmanwani@grepruby.com")
	content = new helper.Content("text/html", content)
	mail = new helper.Mail(from_email, subject, to_email, content)
	mail.reply_to = {
		'email': "inbound@proposestory.com",
		'name': messageId + "||" + replyId
	};
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
var updateUser = function(message){
	var deffered = Q.defer();
  var email = message.to;
	User.findOne({"email":email})
	.then(function(user){
		return User.updateById(user._id,{"$set":{"follow_up_date": new Date()}});
	})
	.then(function(user){
		deffered.resolve(user);
	})
	.fail(function(err){
		deffered.reject(err);
	})
	return deffered.promise;
}
module.exports = router;
