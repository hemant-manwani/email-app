var express = require('express'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    config = require('./core/lib/config'),
    Core = require('./core');

if(!config.db.mongoAuth){
  console.log("Error! Could not find MongoDB credentials in config.db.mongoAuth.")
  process.exit(1);
}

//socket io code
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(4000);
io.on('connection', function (socket) {
  module.exports = {socket: socket, io: io};
});


//socket io code



var routes = require('./routes');

var app = express();
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// hook for CORS
app.use(function(req, res, next) {
  console.log(req.url);
  var oneof = false;
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    oneof = true;
  }
  if (req.headers['access-control-request-method']) {
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    oneof = true;
  }
  if (req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    oneof = true;
  }
  if (oneof) {
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }
  res.header("Access-Control-Expose-Headers", "Content-Length, x-items-count");
  res.header("Access-Control-Allow-Credentials", "true");

  // intercept OPTIONS method
  if (oneof && req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

// handle OPTIONS requests from the browser
app.options("*", function(req,res,next){res.send(200);});

app.use('/', routes);

// Error handling middleware
app.use(function(err, req, res, next){
  //console.log(err);
  if(err.statusCode){
    res.status(err.statusCode || 500);
  }
  res.send({"success": false, "message": err.message, "data": err});
});

process.on('uncaughtException', function(err) {
  console.log(err);
});








Core.DB.ensureConnections()
.then(function () {
	app.listen(config.port, function () {
		console.log(('email_app api server running at http://' + config.host + ':' + config.port + '/'));
	});
})
.fail(function (error) {
    console.log(error);
    console.log("Error! Failed to establish DB connections.");
    process.exit(1);
});
