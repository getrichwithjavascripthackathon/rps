 
var playerData = {
  "U123": { name: "RockMAN", score: 150, wins: 1, losses: 200, currentGame: false, position: {} },
  "U888": { name: "Jenny", score: 2, wins: 1, losses: 0, currentGame: "G1", position: {} },
  "U007": { name: "Johnny", score: 0, wins: 0, losses: 0, currentGame: "G2", position: {} }
};

var playersRequestingGames = [
  "U555", "U007"
]; 

var activeGames = {
  "G1": { players: ["U555", "U888"], found: true, results: {"U555": "U555", "U888": "U555"} },
  "G2": { players: ["U123", "U007"], found: false, results: {} }
};
  
var completedGames = {
  "G1": { players: ["U555", "U888"], results: {"U555": "U555", "U888": "U555"} }
};



//  === functions ===



var playerData = {};
var playersRequestingGames = [];
var activeGames = {};
var completedGames = {};

function Player(name){
	this.name = name;
	this.score = 0;
	this.wins = 0;
	this.losses = 0;
	this.currentGame = false;
	this.position = {};
}

function Game(p1,p2){
  this.players = [p1,p2];
  this.found = false;
  this.results = [];
}

var nextId = 1;
var nextGame = 1;

function createPlayer(userName) {
	playerData['U' + nextId] = new Player(userName)
	nextId++;
}

function requestMatch(userId){
	if(playersRequestingGames.length) {
		startMatch(userId,playersRequestingGames.shift());
	} else {
		playersRequestingGames.push(userId);
	}
}

function startMatch(p1, p2){
	activeGames['g' + nextGame] = new Game(p1,p2);
	nextGame++;
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