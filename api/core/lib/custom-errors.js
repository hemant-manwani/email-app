var AbstractError = function (constr) {
	// TODO:: disable stack trace in production code.
	Error.captureStackTrace(this, constr || this);
};

AbstractError.prototype = new Error;
AbstractError.super_ = Error;
AbstractError.prototype.constructor = AbstractError;

var errorFactory = function (name, statusCode) {
	var CustomError = function (message, innerError, statusCodeOverride) {
		this.statusCode   = statusCodeOverride || statusCode;
		this.message = message;
		this.innerError = innerError;
		if(typeof message === 'object'){
			this.message = message.message || message;
			this.innerError = innerError || message;
		}
		CustomError.super_.call(this, this.constructor);
	};

	CustomError.prototype = new AbstractError;
	CustomError.super_ = AbstractError;
	CustomError.prototype.constructor = CustomError;
	CustomError.prototype.name = name;

	return CustomError;
};

exports.ArgumentError = errorFactory('Argument');
exports.InvalidSchemaError = errorFactory('Invalid Schema', 400);
exports.ValidationError = errorFactory('Validation');
exports.DatabaseError = errorFactory('Database', 500);
exports.BadRequestError = errorFactory('BadRequest', 400);
exports.UnauthorizedError = errorFactory('Unauthorized', 401);
exports.NotFoundError = errorFactory('NotFound', 404);
exports.ForbiddenError = errorFactory('Forbidden', 403);
