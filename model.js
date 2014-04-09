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

var CompletedGame = mongoose.model('CompletedGame',{
	players:[{type: mongoose.Schema.ObjectId, ref: 'Player', required: true}],
	results: String,
	position: {lat: Number, lng: Number}
});


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
  		games[0].remove()
  		matchFound(games[0].player);
  	} else{
  		noMatch();
  	}
  });
}

exports.getOpponent = function(email,callback){
	Player.find({email: email},function(err,players){
		if(err) return console.error(err);
		var myId = players[0]._id;
		ActiveGame.find( { players: myId }, function(err,games){
			if(err) return console.error(err);
			if(games.length){
				var players = games[0].players;
				var opponentId = players[0].equals(myId)? players[1] : players[0];
				Player.find({_id: opponentId},function(err,players){
					if(err) return console.error(err);
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

exports.reportMatch = function(email,iWon){
	Player.find({email:email},function(err,players){
		if(err) return console.error(err);
		var myId = players[0].id;
		ActiveGame.find({players: myId},function(err,games){
			if(err) return console.error(err);
			games[0].results.push({user:myId,iWon:iWon});
			games[0].save(function(err,updatedResults){
				if (err) return console.error(err);
				console.log("updated results", updatedResults);
			});

			if(games[0].results.length == 2){
				var winner = validateResults(games[0].results)
				var completedGame = new CompletedGame({players: games[0].players, results: winner}) 
				completedGame.save(function(err,completedGame){
					console.log('Game completed',completedGame);
				});
				games[0].remove();
				console.log(games[0]._id);
				updateScores(games[0].players,winner);
			}
		});
	});
}

function validateResults(results){
	if(results[0].iWon !== results[1].iWon){
		var winner = results[0].iWon ? results[0].user : results[1].user;
	}	else{
		var winner = null;
	}
	return winner;
}

function updateScores(players,winner){
	if(winner){
		players.forEach(function(player){
			Player.find({_id:player},function(err,players){
				if(err) console.error(err);
				if(players[0]._id.equals(winner)){
					players[0].score += 3;
					players[0].wins += 1;
				}	else {
					players[0].score += 2;
					players[0].losses += 1;
				}
				players[0].save(function(err,updatedScores){
					console.log('Scores updates',updatedScores);
				})
			})
		});
	}
}



function playersFound(gameId){
	activeGames[gameId].found = true;
}







