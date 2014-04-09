var model = require('./model');
var express   = require('express');
var webserver = express();


var webserverPort = process.env.PORT || 9400;
webserver.configure(function() {
	webserver.use(express.static(__dirname + '/public'));
  webserver.use(express.bodyParser());
	webserver.use(express.logger('dev'));
});

webserver.get("/matches.json", function(req, res) {
    res.send([
      {name: "Rockman", lat: 37.7619029, lng: -122.4151263},
      {name: "Papercutter", lat: 37.7602744, lng: -122.4101267}
    ])
});

webserver.get('/api/v1/login', function(req, res) {
  model.findOrCreatePlayer(req.query.email, function(player) {
    res.send(player);
  });
});

webserver.post('/api/v1/position', function(req, res) {
  if (!req.body.email) {
    res.send(400);
  } else {
    model.updatePlayerPosition(req.body.email, req.body.position);
    res.send(200);
  }
});

webserver.post('/api/v1/match_requests', function(req, res) {
  model.requestGame(req.query.email);
  res.send(200);
});

webserver.get('/api/v1/active_games',function(req,res){
  if (!req.query.email) {
    res.send(400, "Parameter required: email");
  } else {
    model.getOpponent(req.query.email, function(opponent){
      res.send(opponent)
    });
  }
})

webserver.post('/api/v1/completed_games',function(req,res){
  console.log("Storing results");
  model.reportMatchResults(req.query.email,req.query.iWon);
  res.send(200);
})

webserver.listen(webserverPort);
console.log("RPSing on port http://localhost:" + webserverPort);
