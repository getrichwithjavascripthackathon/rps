var emails = require('./emails');

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

var ActiveGame = mongoose.model('ActiveGame',{
	players:[{type: mongoose.Schema.ObjectId, ref: 'Player', required: true}],
	found: Boolean,
	results: Array
});

var completedGames = {};

var names = ["RockMAN", "PaperCutter", "ShearTerror", "RockStar",
	"ShearlockHolmes", "SharpestTool", "Dr.Rockson", "RanWithScissors",
	"Paperboy2", "RollingStone", "PaperWeightChampion"];

exports.findOrCreatePlayer = function(email, done) {
	var name = names[Math.floor(Math.random()*names.length)];
	console.log("createPlayer", name, email);
	Player.find({ email: email }, function(err, players) {
		if (players.length) {
			done(players[0]);
		} else {
			var player = new Player({name: name, email: email, score: 0, wins: 0, losses: 0});
			player.save(function (err, savedPlayer) {
				if (err) return console.error(err);
				console.log("created player", savedPlayer);
				done(savedPlayer);
			});
		}
	});
};

exports.updatePlayerPosition = function(email, position) {
	Player.find({email: email}, function(err, players) {
		var player = players[0];
		if (!player) return console.error("No player found: " + email);
		player.position = position;
		player.save(function(err, player) {
			if (err) return console.error(err);
		});
	});
};

exports.requestGame = function(playerEmail){
	console.log("requestGame", playerEmail);
  Player.find({email: playerEmail}, function(err, players) {
		var request = new RequestedGame({player: players[0]});
		findMatch(request.player,
		function(opponent){
			if(opponent){
				var activeGame = new ActiveGame({players:[request.player,opponent], found:false, results: []})
				activeGame.save(function(err,savedGame){
					if(err) {return console.error(err)}
					console.log("saved game", savedGame);
				Player.find({_id: {$in: [activeGame.players[0],activeGame.players[1]]}},function(err,players){
					if(err){return console.error(err)};
					emails.sendMatchEmail(players[0], players[1]);
				})

				});
			}
		},function(){
				request.save(function(err, savedRequest) {
					if (err) return console.error(err);
					console.log("saved request", savedRequest);
				});
		});
	});
}

function findMatch(player,matchFound,noMatch){
	if (!player) {
		console.log("findMatch: player is undefined");
		return;
	}
  RequestedGame.find({player: { $ne: player }}, function(err,games){
		if (err) return console.log(err);
		console.log("-> findMatch", games);
  	if(games[0]) {
  		RequestedGame.remove({});
  		matchFound(games[0].player);
  	} else{
  		noMatch();
  	}
  });
}

exports.getOpponent = function(email,callback){
	Player.find({email: email},function(err,players){
		if(err) return console.err(err);
		var myId = players[0]._id;
		ActiveGame.find( { players: myId }, function(err,games){
			if(err) return console.err(err);
			if(games.length){
				var players = games[0].players;
				var opponentId = players[0].equals(myId)? players[1] : players[0];
				Player.find({_id: opponentId},function(err,players){
					if(err) return console.err(err);
					callback(players);
				});
			} else {
				callback([]);
			}
		});
	});
}

exports.getPlayersRequestingGames = function(done) {
	return RequestedGame.find(function(err, requests) {
		done(requests);
	});
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
