var Q = require('q'),
	mongo = require('./mongo-driver');

exports.find = mongo.find;
exports.findOne = mongo.findOne;
exports.findById = mongo.findById;
exports.count = mongo.count;
exports.insert = mongo.insert;
exports.findAndModify = mongo.findAndModify;
exports.updateById = mongo.updateById;
exports.remove = mongo.remove;
exports.removeById = mongo.removeById;
exports.aggregate = mongo.aggregate;
exports.Guid = mongo.Guid;
exports.update = mongo.update;


exports.ensureConnections = function () {
	return Q.all([
		mongo.ensureConnection()
	])
}
