/**** GAME SERVER ************************************************/
var players = [];
//var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] }).listen(8080);
var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket'] }).listen(8080);
io.set('log level', 2);

io.sockets.on('connection', function(socket){		
	socket.on('message', function(data){		
		switch(data.command) {
			case "MOVE_UNITS":
			case "FIRE_UNITS_AT_NODE":
			case "FIRE_UNITS_AT_ENTITY":
			case "HALT_UNITS":
			case "ROTATE_UNITS":
			case "ENTITY_DAMAGE":
			case "SYNCHRONIZE":			
				try {
					if(players[data.fbUserID].opponent != null) {
						players[players[data.fbUserID].opponent].socket.emit("message",data);
					}
				} catch(e) {}
				break;
			case "FACEBOOK_INIT":
				socket.emit('message',getPlayerList());
				addPlayer(socket,data.fbUserID,data.fbUserName,data.fbUserLink);
				console.log("Player has facebook ID " + data.fbUserID);
				break;
			case "CHALLENGE":
				sendChallenge(data.fbUserID,data.id);
				break;
			case "CHALLENGE_ACCEPTED":
				createMatch(data.fbUserID,data.id);
				break;
			case "CHALLENGE_DECLINED":
				declineChallenge(data.fbUserID,data.id);				
				break;
			case "CHALLENGE_WITHDRAWN":
				withdrawChallenge(data.fbUserID)
				break;
			case "GET_PLAYER_LIST":
				if(players[data.fbUserID]) {
					players[data.fbUserID].inLobby = true;
					broadcast({"command":"STATUS_UPDATE","playerList":[getPlayerInfo(data.fbUserID)]});
				}
				
				socket.emit('message',getPlayerList());
				break;
			case "CHAT":
				var p = getPlayerInfo(data.fbUserID);
				p.message = data.message;
				var m = {"command":"CHAT","player":p};
				
				if(p.inLobby) {
					broadcast(m);
				} else {
					players[data.fbUserID].socket.emit("message",m);	
					
					if(players[data.fbUserID].opponent != null) {
						players[players[data.fbUserID].opponent].socket.emit("message",m);	
					}
				}
				break;
			case "MULTI_PLAYER_DEFEAT":
				scoreMatch(data.fbUserID,false);
				break;
			case "MULTI_PLAYER_VICTORY":
				scoreMatch(data.fbUserID,true);
				break;
			case "MULTI_PLAYER_QUIT":
				try {
					if(players[data.fbUserID].opponent != null) {
						removeOpponent(data.fbUserID,players[data.fbUserID].opponent);		
					}
				} catch(e) {}	
				break;
		}
	});
	
	socket.on('disconnect', function() {
		console.log("Socket " + socket.id + " terminated");
		
		//get the player id
		var pid;
		
		for(id in players) {
			if(players[id].socket.id == socket.id) {
				pid = id;
				break;
			}
		}
		
		console.log("Player " + pid + " terminated");
		
		try {
			if(players[pid].challenger != null) {
				declineChallenge(pid,players[pid].challenger);			
			}
		} catch(e) {}	
		
		try {
			if(players[pid].opponent != null) {
				removeOpponent(pid,players[pid].opponent);				
			}
		} catch(e) {}	
		
		removePlayer(pid);
	});
});


function addPlayer(socket,initFBUserID,initFBUserName,initFBUserLink) {
	if(!players[initFBUserID]) {
		players[initFBUserID] = {
			"id":initFBUserID,
			"socket":socket,
			"winner":null,
			"opponent":null,
			"challenger":null,
			"inLobby":true,
			"fbUserID":initFBUserID,
			"fbUserName":initFBUserName,
			"fbUserLink":initFBUserLink		
		};
		
		//notify clients
		var m = {"command":"PLAYER_ADDED","player":getPlayerInfo(initFBUserID)};
		broadcast(m);
	}
}

function removePlayer(id) {	
	if(players[id]) {
		var p = getPlayerInfo(id);
		delete players[id];	
		
		//notify clients
		broadcast({"command":"PLAYER_REMOVED","player":p});
	}
}

function getPlayerList() {
	var d = [];
	
	for(id in players) {
		d.push(getPlayerInfo(id));
	}
	
	return {"command":"PLAYER_LIST","playerList":d};	
}

function getPlayerInfo(id) {
	if(players[id]) {
		return {
			"id":players[id].fbUserID,
			"challenger":(players[id].challenger != null),
			"opponent":(players[id].opponent != null),
			"inLobby":players[id].inLobby,
			"fbUserID":players[id].fbUserID,
			"fbUserName":players[id].fbUserName,
			"fbUserLink":players[id].fbUserLink
		};
	}
	
	return null;
}

function sendChallenge(p1id,p2id) {
	try {
		players[p1id].challenger = p2id;
		players[p2id].challenger = p1id;
	} catch(e) {
		return;	
	}
	
	//notify clients that player status has changed
	statusUpdate(p1id,p2id);
	
	//notify target player of challenge
	players[p2id].socket.emit("message",{"command":"CHALLENGE","player":getPlayerInfo(p1id)});
	
	console.log("Player " + p1id + " challenges " + p2id);	
}

function declineChallenge(p1id,p2id) {
	players[p1id].challenger = null;
	players[p2id].challenger = null;
	
	//notify clients that player status has changed
	statusUpdate(p1id,p2id);
	
	//notify target player of decline
	players[p2id].socket.emit("message",{"command":"CHALLENGE_DECLINED","player":getPlayerInfo(p1id)});
	
	console.log("Player " + p1id + " delcines challenge from " + p2id);	
}

function withdrawChallenge(p1id) {
	try {
		var p2id = players[p1id].challenger;
	} catch(e) {
		return;	
	}
	
	if(p2id == null) {
		//match already started
		endMatch(p1id);
	} else {
		players[p1id].challenger = null;
		players[p2id].challenger = null;
		
		//notify clients that player status has changed
		statusUpdate(p1id,p2id);
		
		//notify target player of decline
		players[p2id].socket.emit("message",{"command":"CHALLENGE_WITHDRAWN","player":getPlayerInfo(p1id)});
		
		console.log("Player " + p1id + " withdraws challenge from " + p2id);
	}
}

function createMatch(p1id,p2id) {
	console.log("Create match: " + p1id + " vs. " + p2id);
	
	players[p1id].challenger = null;
	players[p2id].challenger = null;
	
	//set the two players as opponents
	players[p1id].opponent = p2id;
	players[p2id].opponent = p1id;
	
	//remove the two players from lobby
	players[p1id].inLobby = false;
	players[p2id].inLobby = false;
	
	//pick a map for the match
	var m = Math.floor(Math.random() * 6);
	
	//pick total units
	var totalUnits = 5 + Math.ceil(Math.random() * 5);
	
	//notify players that the match has started	
	players[p1id].socket.emit("message",{"command":"START_MATCH","map":m,"start":"west","opponent":getPlayerInfo(p2id),"totalUnits":totalUnits});
	players[p2id].socket.emit("message",{"command":"START_MATCH","map":m,"start":"east","opponent":getPlayerInfo(p1id),"totalUnits":totalUnits});
	
	//notify clients that player status has changed
	statusUpdate(p1id,p2id);
}

function removeOpponent(p1id,p2id) {
	players[p1id].opponent = null;
	players[p2id].opponent = null;
		
	//notify clients that player status has changed
	statusUpdate(p1id,p2id);
	
	//notify target player of removal
	players[p2id].socket.emit("message",{"command":"OPPONENT_RESIGNED","player":getPlayerInfo(p1id)});
	
	console.log("Player " + p1id + " resigned match");	
}

function scoreMatch(p1id,isWinner) {
	if(players[p1id].opponent != null && players[p1id].winner == null) {
		var p2id = players[p1id].opponent;
	
		players[p1id].winner = isWinner;	
		
		if(isWinner) {
			console.log("Player " + p1id + " has won the match");	
		} else {
			console.log("Player " + p1id + " has lost the match");
		}
		
		if((players[p2id].winner == false && players[p1id].winner == true) || (players[p2id].winner == true && players[p1id].winner == false)) {
			endMatch(p1id);
		}
	}
}

function endMatch(p1id) {	
	if(players[p1id].opponent != null) {
		var p2id = players[p1id].opponent;
		
		console.log("End match: " + p1id + " vs. " + p2id);
		
		players[p2id].opponent = null;
		players[p1id].opponent = null;
		
		players[p2id].winner = null;
		players[p1id].winner = null;
		
		//notify players that the match has ended
		players[p1id].socket.emit("message",{"command":"END_MATCH"});
		players[p2id].socket.emit("message",{"command":"END_MATCH"});
		
		//notify clients that player status has changed
		statusUpdate(p1id,p2id);
	} 
}

function statusUpdate(p1id,p2id) {
	var d = [];
	d.push(getPlayerInfo(p1id));
	d.push(getPlayerInfo(p2id));
	broadcast({"command":"STATUS_UPDATE","playerList":d});
}

function broadcast(msg) {
	for(id in players) {
		if(players[id].opponent == null) {
			players[id].socket.emit("message",msg);	
		}
	}
}