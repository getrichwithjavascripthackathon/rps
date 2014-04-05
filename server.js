var express   = require('express');
var webserver = express();

var webserverPort = 9400;
webserver.configure(function() {
	webserver.use(express.static(__dirname + '/public'));
	webserver.use(express.logger('dev'));
});

webserver.listen(webserverPort);
console.log("RPSing on port http://localhost:" + webserverPort);
