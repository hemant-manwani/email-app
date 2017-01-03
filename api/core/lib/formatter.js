var db = require('./db'),
	config = require('./config');

var formatters = {
    '_id' : {
    	format: function(value) {
    		if(value instanceof Array){
    			return value.map(function (o) {
    				return db.Guid(o)
    			})
    		}
		    return db.Guid(value)
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

	}

	exports.format = function (key, value) {
		if(formatters[key]){
			return formatters[key].format(value)
		}
		return value
  }
