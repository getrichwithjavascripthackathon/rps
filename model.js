var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/rps_dev');

var Player = mongoose.model('Player', {
	name : String,
	email: {type: String, required: true},
	score: Number,
	wins: Number,
	losses: Number,
	position: { lat: Number, lng: Number }
});

var RequestedGame = mongoose.model('RequestedGame', {
	player: {type: mongoose.Schema.ObjectId, ref: 'Player', required: true},
	requestedAt: {type: Date, required: true, default: Date}
});

var activeGames = {};
var completedGames = {};

function Game(p1,p2){
  this.players = [p1,p2];
  this.found = false;
  this.results = [];
}

var nextGame = 1;

exports.findOrCreatePlayer = function(name, email, done) {
	console.log("createPlayer", name, email);

	Player.find({ email: email }, function(err, players) {
		if (players.length) {
			done(players[0]);
		} else {
			var player = new Player({name: name, email: email, score: 0, wins: 0, losses: 0});

			player.save(function (err, savedPlayer) {
				if (err) return console.error(err);
				console.log("saved player", savedPlayer);
				done(savedPlayer);
			});
		}
	});
}

exports.requestGame = function(playerEmail){
	console.log("requestGame", playerEmail);

	// TODO: bring back this logic
	// if(playersRequestingGames.length) {
	// 	startMatch(userId,playersRequestingGames.shift());
	// } else {
	  Player.find({email: playerEmail}, function(err, players) {
			var request = new RequestedGame({player: players[0]});
			request.save(function(err, savedRequest) {
				if (err) return console.error(err);
				console.log("saved request", savedRequest);
			});
		});
	// }
}

exports.getPlayersRequestingGames = function(done) {
	return RequestedGame.find(function(err, requests) {
		done(requests);
	});
}

function startMatch(p1, p2){
	var gameId = 'g' + nextGame;
	activeGames[gameId] = new Game(p1,p2);
	nextGame++;
	playerData[p1].currentGame = gameId;
	playerData[p2].currentGame = gameId;
}

function playersFound(gameId){
	activeGames[gameId].found = true;
}

function validateResults(game){
  if(game.results[0].verdict === game.results[1].verdict){
  	var verdict = game.results[0].verdict;
  }  else {
  	var verdict = null;
  }
  delete game.results;
  game['results'] = verdict;
  return verdict;
}

function reportMatch(gameId,userId,winner){
  activeGames[gameId].results.push({judge: userId, verdict: winner});
  playerData[userId].currentGame = false;
  if(activeGames[gameId].results.length === 2){
  	completedGames[gameId] = activeGames[gameId];
  	delete activeGames[gameId];
    if(validateResults(completedGames[gameId])){
      updateScores(completedGames[gameId].players,completedGames[gameId].results)
    }
  }
}


function updateScores(players,winner){
  players.forEach(function(player){
  	var user = playerData[player]
    if(player == winner){
    	user.score += 3;
    	user.wins ++;
    }  else {
    	user.score += 2;
    	user.losses ++;
    }
  })
}
