module.exports = {
	'host': "localhost",
	'port': 5000,
	'db': {
	 	'mongoAuth': process.env.MONGODB_AUTH,
	 },
	'formatters' : {
		'_id' : {}

		,'name' : {
			format: function(value) {
				return new RegExp(value, 'i');
		 	}
		}
    ,'content' : {
			format: function(value) {
				return new RegExp(value, 'i');
		 	}
		}
		,'created' : {
			format: function(value) {
				return new Date(value);
		 	}
		}
		,'modified' : {
			format: function(value) {
				return new Date(value);
		 	}
		}
		,'fullName' : {
			format: function(value) {
				return new RegExp(value, 'i');
		 	}
		}

	},
	queryOperators: ['$eq', '$gt', '$gte','$and', '$lt','$all','$in', '$lte', '$ne', '$nin', '$exists', '$elemMatch', '$regex', '$or'],
	'allowedFields': {
			'user': '_id,firstName,lastName,email,created,technology,follow_up_date',
			'message': '_id,from,to,subject,thread,hasRead,fromName,toName,created'
		},
};
