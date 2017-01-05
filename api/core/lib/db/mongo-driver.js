var Q = require('q'),
	MongoDb = require('mongodb'),
	config = require('../config'),
	ObjectID = MongoDb.ObjectID,
	db;

var mongoDriver = {
	ensureConnection : function () {
		var deferred = Q.defer();
		MongoDb.MongoClient.connect(config.db.mongoAuth, function(err, database) {
			if (err) {
				return deferred.reject(err);
			}
			db = database;
			deferred.resolve();
		})
		return deferred.promise;
	},

	find: function (collectionName, query, options, cb) {
		decipherOptions(options);
		db.collection(collectionName).find(query, options).toArray(function (err, docs) {
			cb(err, docs);
		});
	},

	aggregate: function (collectionName, query, options,cb) {
		db.collection(collectionName).aggregate(query, options, function (err, doc) {
			cb(err, doc);
		});
	},

	findById: function (collectionName, id, options, cb) {
		decipherOptions(options);
		//ObjectIDs are represented as 24-digit hexadecimal strings, so convert the string back into an ObjectID
		var objectId = new ObjectID(id);
		db.collection(collectionName).findOne({_id: objectId}, options, function(err, doc) {
			cb(err, doc);
		});
	},

	findOne: function(collectionName, query, options, cb) {
		decipherOptions(options);
		db.collection(collectionName).findOne(query, options, function(err, doc) {
			cb(err, doc);
		});
	},

	count: function (collectionName, query, options, cb) {
		decipherOptions(options);
		db.collection(collectionName).count(query, options, function (err, count) {
			cb(err, count);
		});
	},
	insert: function(collectionName, document, cb) {
		db.collection(collectionName).insert(document, {w: 1}, function(err, doc) {
			console.log(err);
			var firstDoc = doc.ops ? doc.ops[0] : doc;
			cb(err, firstDoc)
		});
	},

	findAndModify: function(collectionName, query, doc, cb) {
		db.collection(collectionName).findAndModify(query, [['_id', 1]], {$setOnInsert: doc}, {upsert: true, new: true}, function(err, doc) {
			cb(err, doc);
		});
	},

	updateById: function(collectionName, id, doc, cb){
		//ObjectIDs are represented as 24-digit hexadecimal strings, so convert the string back into an ObjectID
		var objectId = new ObjectID(id);
		if(doc.$set){
			delete doc.$set._id;
		}
		delete(doc._id); // delete the Original _id field if present
		db.collection(collectionName)
		.findAndModify({_id: objectId}, [], doc, {new: true, w: 1}, function(err, data) {
			cb(err, data);
		});
	},

	update: function(collectionName, query, doc, cb){
		if(doc.$set){
			delete doc.$set._id;
		}
		delete doc._id; // delete the Original _id field if present
		db.collection(collectionName)
		.update(query, doc, {multi: true}, function(err, data) {
			cb(err, data);
		});
	},

	remove: function (collectionName, query, cb) {
		db.collection(collectionName).remove(query, {w:1}, function(err, result) {
			cb(err, { success: (result > 0) });
		});
	},

	removeById: function(collectionName, id, cb) {
		//ObjectIDs are represented as 24-digit hexadecimal strings, so convert the string back into an ObjectID
		var objectId = new ObjectID(id);
		db.collection(collectionName).remove({_id: objectId}, {w:1}, function(err, result) {
			cb(err, { success: (result > 0) });
		});
	},

	Guid: ObjectID
};

function decipherOptions (options) {
	if(options.fields){
		options.fields = getFieldsMap(options.fields);
	}
}
function getFieldsMap(fields) {
	if(typeof fields === "string"){
		fields = fields.split(",");
	}

	var fieldsMap = {};
	for (var i = 0, l = fields.length; i < l; i++) {
		fieldsMap[fields[i]] = 1;
	}
	return fieldsMap;
}
module.exports = mongoDriver;
