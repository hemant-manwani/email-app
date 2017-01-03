var Q = require('q'),
	Tv4 = require('tv4'),
	Formats = require('tv4-formats'),
	Errors = require('../custom-errors'),
	db = require('../db'),
	Schemas = require('../schemas');

Tv4.addFormat(Formats);

function validateDocument(document, schemaName) {
	var schema = Schemas[schemaName];
	if(!schema){
		return new Errors.NotFoundError("Schema not found => " + schemaName);
	}
	if(!Tv4.validate(document, schema)){
		return new Errors.InvalidSchemaError(Tv4.error);
	}
	return null;
}

module.exports = function (collectionName, schemaName, elasticConfig) {
	return {
		find: function (criteria, options) {
			options = options || {};
			var deferred = Q.defer();
			db.find(collectionName, criteria, options, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		findById: function (id, options) {
			options = options || {};
			var deferred = Q.defer();
			db.findById(collectionName, id, options, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		findOne: function (criteria, options) {
			options = options || {};
			var deferred = Q.defer();
			db.findOne(collectionName, criteria, options, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		search: function (criteria, transformFromMongoToEs) {
			var deferred = Q.defer()
			if(!elasticConfig || !elasticConfig.index || !elasticConfig.type){
				deferred.reject(new Error('elasticConfig missing for resource'))
				return deferred.promise;
			}

			db.elastic.search(elasticConfig.index, elasticConfig.type, criteria, transformFromMongoToEs)
			.then(function (result) {
				var data = result.hits.hits.map(function (doc) {
					return doc._source
				})

				deferred.resolve({'count': result.hits.total, 'data': data, "took": result.took})
			})
			.fail(deferred.reject)
			return deferred.promise;
		},

		esCount: function (criteria, transformFromMongoToEs) {
			var deferred = Q.defer()
			if(!elasticConfig || !elasticConfig.index || !elasticConfig.type){
				deferred.reject(new Error('elasticConfig missing for resource'))
				return deferred.promise;
			}

			db.elastic.count(elasticConfig.index, elasticConfig.type, criteria, transformFromMongoToEs)
			.then(deferred.resolve)
			.fail(deferred.reject)
			return deferred.promise;
		},

		count: function (criteria, options) {
			options = options || {};
			var deferred = Q.defer();
			db.count(collectionName, criteria, options, function (err, count) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(count);
				}
			});

			return deferred.promise;
		},

		findAndModify: function(criteria, doc) {
			var deferred = Q.defer();
			db.findAndModify(collectionName, criteria, doc, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});
			return deferred.promise;
		},

		insert: function(document) {
			var deferred = Q.defer();
			var errors = validateDocument(document, schemaName);
			if(errors){
				deferred.reject(errors);
			}
			else {
				db.insert(collectionName, document, function (err, data) {
					if(err){
						deferred.reject(err);
					} else {
						deferred.resolve(data);
					}
				});
			}

			return deferred.promise;
		},

		/*
		 * Sample put operations
		 * Each field received in the packet will be updated separately. It wont affect other fields.
		 * {topics: ["ahsdadq382h3bd", "akjbsdab32872834bs"]} --> updates only topics
		 * {name: "Lorem Ipsum", topics: ["ahsdadq382h3bd", "akjbsdab32872834bs"]} --> updates name and topics
		*/
		updateById: function(id, fields){
			var deferred = Q.defer();
			db.updateById(collectionName, id, fields, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});
			return deferred.promise;
		},

		update: function(criteria, fields){
			var deferred = Q.defer();
			db.update(collectionName, criteria, fields, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});
			return deferred.promise;
		},

		remove: function(criteria) {
			var deferred = Q.defer();
			db.remove(collectionName, criteria, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		removeById: function(id) {
			var deferred = Q.defer();
			db.removeById(collectionName, id, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		aggregate: function(criteria,options) {
			var deferred = Q.defer();
			db.aggregate(collectionName, criteria, options, function (err, data) {
				if(err){
					deferred.reject(err);
				} else {
					deferred.resolve(data);
				}
			});

			return deferred.promise;
		},

		Guid: db.Guid
	};
};
