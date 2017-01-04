var Errors = require('../custom-errors'),
	config = require('../config'),
	Core = require('../../../core'),
  Formatter = require('../formatter'),
	Q = require('q');

exports.createQueryOptions = function (queryParams, allowedFields) {
	var options = {};
	if(queryParams.start !== undefined && queryParams.count !== undefined) {
		if(isNaN(parseInt(queryParams.start))){
			throw new Errors.BadRequestError("Query paramater 'start' should be a valid number");
		}
		if(isNaN(parseInt(queryParams.count))){
			throw new Errors.BadRequestError("Query paramater 'count' should be a valid number");
		}

		options.skip = parseInt(queryParams.start);
		options.limit = parseInt(queryParams.count);
	} else {
		options.skip = 0;
		options.limit = 10;
	}
	if(allowedFields){
		options.fields = queryParams.fields ? stripUnsupportedFields(queryParams.fields, allowedFields) : allowedFields;
	}

	if(queryParams.sort){
		options.sort = {};
		var sortParams = queryParams.sort.split(',');
		var param, sortOrder;
		for (var i = 0, l=sortParams.length; i < l; i++) {
			param = sortParams[i];
			sortOrder = param.charAt(0) === "-" ? -1 : 1;
			param = sortOrder === -1 ? param.substr(1) : param;
			if(param){
				options.sort[param] = sortOrder;
			}
		}
	}

	return options;
};
exports.getFilters = function (queryParams, filters) {
	var queryConditions = {};
	if(queryParams.filter){
		queryConditions = JSON.parse(queryParams.filter);
		console.log(queryConditions);
		parseConditions(queryConditions)
	}

	function parseConditions (conditions) {
		for(var key in conditions){
			if(conditions.hasOwnProperty(key)){
				if(key === "$or" || key=="$and"){
					if(!conditions[key] instanceof Array){
						throw new Errors.BadRequestError("Invalid filter format.");
					}
					for (var k = 0; k < conditions[key].length; k++) {
						parseConditions(conditions[key][k])
					}
				} else {
					if(typeof conditions[key] !== "object"){
						throw new Errors.BadRequestError("Invalid filter format.");
					}
					var operators = Object.keys(conditions[key]);
					for (var i = 0, l = operators.length; i < l; i++) {
						if(config.queryOperators.indexOf(operators[i]) === -1){
							throw new Errors.BadRequestError("Invalid filter format. Unsupported operator.");
						}
					}

					if(Formatter && Formatter.format){
						for( var prop in conditions[key] ) {
							if(prop == '$in')
								continue;
							conditions[key][prop] = Formatter.format(key, conditions[key][prop])
						}
					}


				}
			}
		}
	}

	for(var key in queryConditions){
		if(queryConditions.hasOwnProperty(key)){
			filters[key] = queryConditions[key];
		}
	}
	return filters;
};

function stripUnsupportedFields (requestedSet, allowedSet) {
	requestedSet = requestedSet.split(",");
	allowedSet = allowedSet.split(",");

	var supportedSet = ["_id"];
	for (var i = 0, l = requestedSet.length; i < l; i++) {
		if(allowedSet.indexOf(requestedSet[i]) != -1){
			supportedSet.push(requestedSet[i]);
		}
	}
	return supportedSet;
}
