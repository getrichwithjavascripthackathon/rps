var model = require('./model');
var express   = require('express');
var webserver = express();


var webserverPort = process.env.PORT || 9400;
webserver.configure(function() {
	webserver.use(express.static(__dirname + '/public'));
	webserver.use(express.logger('dev'));
});

webserver.get("/matches.json", function(req, res) {
    res.send([
      {name: "Rockman", lat: 37.7619029, lng: -122.4151263},
      {name: "Papercutter", lat: 37.7602744, lng: -122.4101267}
    ])
});

webserver.get('/api/v1/login', function(req, res) {
  model.findOrCreatePlayer(req.query.name, req.query.email, function(player) {
    res.send(player);
  });
});

webserver.post('/api/v1/position', function(req, res) {
  model.updatePlayerPosition(req.query.email, { lat: req.query.lat, lng: req.query.lng });
  res.send(200);
});

webserver.post('/api/v1/match_requests', function(req, res) {
  model.requestGame(req.query.email);
  res.send(200);
});

webserver.get('/api/v1/match_requests', function(req, res) {
  console.log("Getting requested matches");
  model.getPlayersRequestingGames(function(requests) {
    res.send(requests);
  });
});

webserver.get('/api/v1/active_games',function(req,res){
  console.log("Finding active games");
  model.getOpponent(req.query.email,function(opponent){
    console.log('I need a real function!');
    res.send(opponent)
  });
})

webserver.listen(webserverPort);
console.log("RPSing on port http://localhost:" + webserverPort);