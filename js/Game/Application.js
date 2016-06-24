var Application = Thunder.Component.extend({
	init: function(initRootElement, initDebug) {
		this._super(initRootElement);

		//Initialize properties
		this.debug = initDebug;
		this.backgroundAudio = null;
		this.achievements = [];
		this.nextDialog = null;
		this.game = null;

		//Initialize assets
		this.assetManager.addAsset("game","game",null,"GAME",0,0,0,0);
		this.assetManager.addAsset("message","message_widget",null,"MESSAGE_WIDGET",0,0,320,140);
		this.assetManager.addAsset("dialog","dialog_widget",null,"DIALOG_WIDGET",0,0,320,320);

		//Initialize layers
		this.layerManager.addLayer("/GAME");
		this.layerManager.addLayer("/GUI");
		this.layerManager.addLayer("/START");
		this.layerManager.addLayer("/DIALOG");
		this.layerManager.addLayer("/MESSAGE");

		//Listen for window resize
		var t = this;
		$(window).resize(function() { t.handleResize() });

		//Start
		var s = window.localStorage.getItem("ATPG_PLAYER_ACHIEVEMENTS");

		if(s != null) {
			gUserMaps = s.split(",");
		}

		this.createResponders();
		this.createCustomizers();		
		this.handleResize();
		this.drawGame();
		this.drawStartScreen();
	},

	createResponders: function() {
		var t = this;
		
		this.addResponder("BTNMORE",function(event) {
			t.track("howtoplay","more");
			t.drawDialog("help",500,375);
		});
		
		this.addResponder("BTNVIDEO",function(event) {
			t.track("howtoplay","video");
			t.stopBackgroundAudio();
			t.drawDialog("video",500,375);
		});
		
		this.addResponder("BTNMAINMENU",function(event) {
			t.game.eraseMap();
			t.eraseDialog();
			t.drawStartScreen();
		});
		
		this.addResponder("SINGLEPLAYERQUIT",function(event) {
			t.game.eraseMap();
			t.eraseDialog();
			t.drawStartScreen();
		});
		
		this.addResponder("BTNSTARTLEVEL",function(event) {
			t.track("game","start_level");
			t.game.startLevel();
		});
		
		this.addResponder("BTNREPLAYLEVEL",function(event) {
			t.track("game","replay_level");
			t.game.loadLevel(t.game.levelManager.getLevel());
		});
		
		this.addResponder("BTNPLAYNEXTLEVEL",function(event) {
			t.track("game","play_next_level");
			t.game.levelManager.setLevel(t.game.levelManager.getLevel() + 1);
			t.game.loadLevel(t.game.levelManager.getLevel());
		});
		
		/* this.addResponder("BTNMULTIPLAYERCANCEL",function(event) {
			t.multiplayerManager.disconnect();
			t.eraseDialog();
		}); */
		
		this.addResponder("BTNCANCEL",function(event) {
			t.eraseDialog();

			if(t.nextDialog != null) {
				t.drawDialog(t.nextDialog);
				t.nextDialog = null;
			}
		});
		
		this.addResponder("BTNCLOSE",function(event) {
			t.eraseDialog();

			if(t.nextDialog != null) {
				t.drawDialog(t.nextDialog);
				t.nextDialog = null;
			}
		});
		
		this.addResponder("BTNQUIT_YES",function(event) {
			t.eraseDialog();
			t.game.quit();
		});
		
		this.addResponder("BTNQUIT_NO",function(event) {
			t.eraseDialog();
		});
		
		this.addResponder("BTN_CLICK",function(event) {
			switch(event.owner.getName()) {
				case "BTNSINGLEPLAYER":
					t.track("menu","singleplayer");
					t.startSinglePlayer();
					break;
				case "BTNHOWTOPLAY":
					t.track("menu","howtoplay");
					t.stopBackgroundAudio();
					t.drawDialog("video",500,375);
					break;
				case "BTNMUTESOUND":
					t.track("menu","mute_sound");
					t.game.setMute(true);
					t.drawStartScreen();
					break;
				case "BTNUNMUTESOUND":
					t.track("menu","unmute_sound");
					t.game.setMute(false);
					t.drawStartScreen();
					break;
			}
		});
		
		this.addResponder("DISPLAY_WIN_DIALOG",function(event) {
			t.drawDialog("win");
		});
		
		this.addResponder("DISPLAY_LOSE_DIALOG",function(event) {
			t.drawDialog("lose");
		});
		
		/* this.addResponder("DISPLAY_MULTIPLAYER_WIN_DIALOG",function(event) {
		this.drawDialog("win-multiplayer");
		this.game.isMultiplayer = false;
		});
		this.addResponder("DISPLAY_MULTIPLAYER_LOSE_DIALOG",function(event) {
		this.drawDialog("lose-multiplayer");
		this.game.isMultiplayer = false;
		}); */
		
		this.addResponder("PLAY_RANDOM_BACKGROUND_AUDIO",function(event) {
			t.playRandomBackgroundAudio();
		});
		
		this.addResponder("SHOW_NEXT_ACHIEVEMENT",function(event) {
			t.drawAchievements();
		});

		/* Game Events ******************/
		this.addResponder("LOAD_NEW_LEVEL",function(event) {
			t.eraseDialog();
			t.stopBackgroundAudio();
		});
		
		this.addResponder("LOAD_LEVEL_COMPLETE",function(event) {
			if(t.game.levelManager.getPlayerLevel() > 1) {
				t.drawDialog("level");
			} else {
				t.nextDialog = "level";
				t.stopBackgroundAudio();
				t.drawDialog("video",500,375);
			}
		});
		
		this.addResponder("START_LEVEL",function(event) {
			t.eraseDialog();
			t.playRandomBackgroundAudio();
		});
		
		this.addResponder("SINGLE_PLAYER_DEFEAT",function(event) {
			t.stopBackgroundAudio();
			t.eventQueue.addEvent("DISPLAY_LOSE_DIALOG",3000);
		});
		
		this.addResponder("SINGLE_PLAYER_VICTORY",function(event) {
			t.handleSinglePlayerVictory();
		});
	},

	createCustomizers: function() {
		var t = this;

		t.addCustomizer("img", function(asset) {
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' id='" + asset.tag + "'/>");
		});
		
		t.addCustomizer("btn", function(asset) {
			asset.param = new Button(asset);
			asset.param.addListener(t.eventQueue);
		});
		
		t.addCustomizer("box", function(asset) {
			asset.container.html("<div style='position: absolute; background-color: " + asset.param + "; width: 100%; height: 100%'/>");
		});
		
		t.addCustomizer("html", function(asset) {
			asset.container.html("<div style='position:absolute;width:100%;height:100%;'>" + t.getHTML(asset.tag) + "</div>");
			Cufon.refresh();
		});
		
		t.addCustomizer("message_widget", function(asset) {
			asset.param = new MessageWidget(asset.container,t.achievements.shift(),t.debug);
			asset.param.addListener(t.eventQueue);
		});
		
		t.addCustomizer("dialog_widget", function(asset) {
			asset.param = new Dialog(asset);
			asset.param.addListener(t.eventQueue);
		});
		
		t.addCustomizer("game", function(asset) {
			t.game = new Game(asset.container);
			t.game.addListener(t.eventQueue);
		});
	},

	drawGame: function() {
		this.layerManager.layOut(this.assetManager.getAssets("game"),"/GAME");
	},

	drawStartScreen: function() {
		this.assetManager.removeAssets("start");

		this.assetManager.addAsset("start","box",null,"BG",0,0,320,this.height,"#000000");
		this.assetManager.addAsset("start","img","image/start_pic.jpg","PIC",0,0,320,320);

		var buttonYPos = 330;
		var buttonOffset = 33;
		this.assetManager.addAsset("start","btn","image/btn/startGame.jpg","BTNSINGLEPLAYER",30,buttonYPos,253,30);
		this.assetManager.addAsset("start","btn","image/btn/howToPlay.jpg","BTNHOWTOPLAY",30,(buttonYPos += buttonOffset),253,30);

		if(this.game.getMute()) {
			this.assetManager.addAsset("start","btn","image/btn/soundOn.jpg","BTNUNMUTESOUND",30,(buttonYPos += buttonOffset),253,30);
		} else {
			this.assetManager.addAsset("start","btn","image/btn/soundOff.jpg","BTNMUTESOUND",30,(buttonYPos += buttonOffset),253,30);
			this.playRandomBackgroundAudio();
		}

		this.assetManager.addAsset("start","html",null,"COPYRIGHT_HTML",0,(buttonYPos += buttonOffset + 10),320,20);
		this.layerManager.layOut(this.assetManager.getAssets("start"),"/START");
	},

	eraseStartScreen: function() {
		this.layerManager.clearSet("/START");
	},

	drawDialog: function(which,w,h) {
		if(isNaN(w)) { w = 320; }
		if(isNaN(h)) { h = 320; }

		this.layerManager.layOut(this.assetManager.getAssets("dialog"),"/DIALOG");
		this.assetManager.getAsset("DIALOG_WIDGET").param.draw(which,w,h);
	},

	eraseDialog: function() {
		this.layerManager.clearSet("/DIALOG");
	},

	drawAchievements:function() {
		if(this.achievements.length > 0) {
			this.layerManager.layOut(this.assetManager.getAssets("message"),"/MESSAGE");
		} else {
			this.layerManager.clearSet("/MESSAGE");
		}
	},

	getHTML: function(which) {
		var html = "";

		switch(which) {
			case "HELP_HTML":
				html += "<div class='Handel_Gothic'><h3>How&nbsp;To&nbsp;Play</h3></div>";
				break;
			case "VIDEO_HTML":
				var video_embeded = "Q_cRYEr9Qv8";
				html += '<object width="460" height="260"><param name="movie" value="https://www.youtube.com/v/' + video_embeded;
				html += '&hl=en_US&feature=player_embedded&version=3"></param><param name="allowFullScreen" ';
				html += 'value="false"></param><param name="allowScriptAccess" value="always"></param>';
				html += '<embed width="460" height="260" src="https://www.youtube.com/v/' + video_embeded + '?suggestedQuality=medium&hl=en_US';
				html += '&feature=player_embedded&version=3" type="application/x-shockwave-flash" ';
				html += 'allowfullscreen="false" allowScriptAccess="always"></embed>';
				html += '</object>';
				break;
			case "LEVEL_HTML":
				html += "<div class='Handel_Gothic'><h3>Level&nbsp;" + this.game.levelManager.getLevel() + "</h3><hr/><ul><li>Combat Zone: \"" + this.game.levelManager.getMapName() + "\"</li>";
				html += "<li>Mission: Destroy all enemy tanks</li>";
				html += "<li>Tanks Available: " + this.game.levelManager.getLevelInfo().PLAYER_UNITS + "</li>";
				html += "<li>Enemy Tanks: " + this.game.levelManager.getLevelInfo().ENEMY_UNITS + "</li></ul></div>";
				break;
			case "WIN_HTML":
				html += "<div class='Handel_Gothic'><h3>Victory!</h3><hr/>";
				html += "<p>" + (this.game.playerUnitStartCount - this.game.playerUnitCount) + " of " + this.game.playerUnitStartCount + " friendly tanks destroyed.</p>";
				html += "<p>" + (this.game.enemyUnitStartCount - this.game.enemyUnitCount) + " of " + this.game.enemyUnitStartCount + " enemy tanks destroyed.</p>";

				if(this.game.levelManager.getLevel() < this.game.levelManager.getMaxLevel()) {
					if(this.game.levelManager.getPlayerLevel() < (this.game.levelManager.getLevel() + 1)) {
						html += "<p>Congratulations! You have unlocked level " + (this.game.levelManager.getLevel() + 1) + ".</p>";
					} else {
						html += "<p>Advance to level " + (this.game.levelManager.getLevel() + 1) + ".</p>";
					}
				} else {
					html += "<p>Replay level " + this.game.levelManager.getLevel() + ".</p>";
				}

				html += "</div>";
				break;
			case "LOSE_HTML":
				html += "<div class='Handel_Gothic'><h3>Defeat!</h3><hr/>";
				html += "<p>" + (this.game.playerUnitStartCount - this.game.playerUnitCount) + " of " + this.game.playerUnitStartCount + " friendly tanks destroyed.</p>";
				html += "<p>" + (this.game.enemyUnitStartCount - this.game.enemyUnitCount) + " of " + this.game.enemyUnitStartCount + " enemy tanks destroyed.</p>";

				if(this.game.levelManager.getLevel() < this.game.levelManager.getMaxLevel()) {
					if(this.game.levelManager.getPlayerLevel() > this.game.levelManager.getLevel()) {
						html += "<p>Replay level " + this.game.levelManager.getLevel() + " or advance to level " + (this.game.levelManager.getLevel() + 1) + ".</p>";
					} else {
						html += "<p>Replay and win level " + this.game.levelManager.getLevel() + " in order to advance.</p>";
					}
				} else {
					html += "<p>Replay level " + this.game.levelManager.getLevel() + ".</p>";
				}

				html += "</div>";
				break;
			case "CHOOSE_HTML":
				html += "<div class='Handel_Gothic'><h3>Choose&nbsp;Level</h3><hr/>";

				if(window.console) console.log("Player level is " + this.game.levelManager.getPlayerLevel());

				for(var i = 1; i <= this.game.levelManager.getMaxLevel(); i++) {
					if(this.game.levelManager.getPlayerLevel() >= i) {
						html += "<div class='levelButton' onclick='App.eraseStartScreen(); App.game.loadLevel(" + i + ");'>" + i + "</div>";
					} else {
						html += "<div class='levelButton grey'>" + i + "</div>";
					}
				}

				html += "</div>";
				break;
			case "LIKE_HTML":
				html = "<iframe src='//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FArmored-Titans-Proving-Grounds%2F324490847582726&amp;width=460&amp;height=430&amp;colorscheme=dark&amp;show_faces=true&amp;border_color&amp;stream=false&amp;header=false&amp;appId=320397024645847' scrolling='no' frameborder='0' style='border:none; overflow:hidden; width:460px; height:430px;' allowTransparency='true'></iframe>";
				break;
			case "COPYRIGHT_HTML":
				html += "<div class='footer'>&#169; 2015-2016 PinDax LLC, All rights reserved.</div>";
				break;
			case "MULTIPLAYER_HTML":
				html += "<div class='Handel_Gothic'><h3>Multiplayer</h3></div>";
				break;
			case "MULTIPLAYER_SIGNIN_HTML":
				html += "<div class='Handel_Gothic'><h3>Multiplayer</h3><hr/>";
				html += "<div>Sign in with Facebook to access multiplayer.</div></div>";
				break;
			case "MULTIPLAYER_UNAVAILABLE_HTML":
				html += "<div class='Handel_Gothic'><h3>Multiplayer</h3><hr/>";
				html += "<div>Sorry, the server is not available. Please try again later.</div></div>";
				break;
			case "OPPONENT_RESIGNED_HTML":
				html += "<div class='Handel_Gothic'><h3>Opponent&nbsp;Resigned</h3><hr/>";
				html += "<div style='float: left'>Your opponent has left the match.</div></div>";
				break;
			case "WIN_MULTIPLAYER_HTML":
				html += "<div class='Handel_Gothic'><h3>Victory!</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.game.opponentFBLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.game.opponentFBUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>You defeated " + this.game.opponentFBName + " on \"" + this.game.levelManager.getMapName() + "\".</div></div>";
				break;
			case "LOSE_MULTIPLAYER_HTML":
				html += "<div class='Handel_Gothic'><h3>Defeat!</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.game.opponentFBLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.game.opponentFBUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>You have been defeated by " + this.game.opponentFBName + ".</div></div>";
				break;
			case "QUIT_HTML":
				html += "<div class='Handel_Gothic'><h3>Quit</h3><hr/>";
				html += "<div style='float: left'>Are you sure you want to quit?</div></div>";
				break;
			case "CHALLENGER_HTML":
				html += "<div class='Handel_Gothic'><h3>Multiplayer</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.game.opponentFBLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.game.opponentFBUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>" + this.game.opponentFBName + " is your opponent.</div></div>";
				break;
			case "CHALLENGE_HTML":
				html += "<div class='Handel_Gothic'><h3>Challenge</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.multiplayerDialog.challenger.fbUserLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.multiplayerDialog.challenger.fbUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>" + this.multiplayerDialog.challenger.fbUserName + " has challenged you to a match.</div></div>";
				break;
			case "CHALLENGE_DECLINED_HTML":
				html += "<div class='Handel_Gothic'><h3>Challenge&nbsp;Declined</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.multiplayerDialog.challenger.fbUserLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.multiplayerDialog.challenger.fbUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>" + this.multiplayerDialog.challenger.fbUserName + " has declined your challenge.</div></div>";
				break;
			case "CHALLENGE_SENT_HTML":
				html += "<div class='Handel_Gothic'><h3>Challenge&nbsp;Sent</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><img src='image/loader.gif' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>Waiting for a response...</div></div>";
				break;
			case "CHALLENGE_WITHDRAWN_HTML":
				html += "<div class='Handel_Gothic'><h3>Challenge&nbsp;Withdrawn</h3><hr/>";
				html += "<div style='float: left; margin: 0 10px 0 0'><a href='" + this.multiplayerDialog.challenger.fbUserLink + "' target='_blank'>";
				html += "<img src='https://graph.facebook.com/" + this.multiplayerDialog.challenger.fbUserID + "/picture' border='0'/></a></div>";
				html += "<div style='float: left; width: 220px'>" + this.multiplayerDialog.challenger.fbUserName + " has withdrawn the challenge.</div></div>";
				break;
		}

		return html;
	},

	startSinglePlayer: function() {
		if(this.game.levelManager.getPlayerLevel() > 1) {
			this.drawDialog("choose");
		} else {
			this.eraseStartScreen();
			this.game.loadLevel(1);
		}
	},

	handleSinglePlayerVictory: function() {
		this.stopBackgroundAudio();
		var achievementName = this.game.levelManager.getMapName().toUpperCase().replace(/\s/g,"_");
		var unlockSuccess = this.unlockAchievement(achievementName);

		if(unlockSuccess) {
			this.achievements.push(achievementName);
			gUserMaps.push(achievementName);
		}

		if(this.game.levelManager.getPlayerLevel() < this.game.levelManager.getMaxLevel()) {
			if(this.game.levelManager.getPlayerLevel() < (this.game.levelManager.getLevel() + 1)) {
				var achievementName = "LEVEL_" + this.game.levelManager.getLevel()
				this.unlockAchievement(achievementName);
				this.achievements.push(achievementName);
				this.game.levelManager.setPlayerLevel(this.game.levelManager.getLevel() + 1);
			}
		}

		window.localStorage.setItem("ATPG_PLAYER_ACHIEVEMENTS",this.achievements.join(","));
		this.drawAchievements();
		this.eventQueue.addEvent("DISPLAY_WIN_DIALOG",3000);
	},

	handleMultiPlayerDefeat: function() {
		this.stopBackgroundAudio();
		this.eventQueue.addEvent("DISPLAY_MULTIPLAYER_LOSE_DIALOG",1000);
	},

	handleMultiPlayerVictory: function() {
		this.stopBackgroundAudio();
		this.eventQueue.addEvent("DISPLAY_MULTIPLAYER_WIN_DIALOG",1000);
	},

	track: function(category,action) {
		_gaq.push(['_trackEvent', category, action]);
	},

	/************************************
		Background Audio Functions
	*************************************/

	playRandomBackgroundAudio: function() {
		if(!this.game.muteSound) {
			if(this.backgroundAudio == null) {
				this.backgroundAudio = this.getRandomBackgroundAudio();
				if(this.backgroundAudio != null) {
					this.backgroundAudio.play();
				} else {
					this.eventQueue.addUniqueEvent("PLAY_RANDOM_BACKGROUND_AUDIO",3000);
					return;
				}
			} else {
				this.backgroundAudio = this.getRandomBackgroundAudio();
				this.backgroundAudio.play();
			}

			this.eventQueue.addUniqueEvent("PLAY_RANDOM_BACKGROUND_AUDIO",60000);
		}
	},

	getRandomBackgroundAudio: function() {
		if(gBackgroundAudio.length > 0) {
			var pick = Math.floor(Math.random() * gBackgroundAudio.length);
			return gBackgroundAudio[pick];
		} else {
			this.trace("gBackgroundAudio.length = " + gBackgroundAudio.length);
		}

		return null;
	},

	stopBackgroundAudio: function() {
		this.eventQueue.removeEvent("PLAY_RANDOM_BACKGROUND_AUDIO");

		if(this.backgroundAudio != null) {
			this.backgroundAudio.stop();
		}
	},

	/************************************
		Resize Functions
	*************************************/

	handleResize: function() {
		var w = $(window).width() - gAdWidth;
		var h = $(window).height();

		if(w < 500) { w = 500; }
		if(h < 500) { h = 500; }

		$("#ads").height(h);

		this.setWidth(w);
		this.setHeight(h);

		this.layerManager.setLayerSetPosition("START", new Thunder.Point((w / 2 - 160),0));
		this.assetManager.getAsset("MESSAGE_WIDGET").setPosition(w - 330, h - 150);
	},

	/************************************
		Achievement Functions
	*************************************/

	unlockAchievement: function(which) {
		//check if we have the achievement
		for(var i = 0; i < gUserMaps.length; i++) {
			if(which == gUserMaps[i]) {
				return false;
			}
		}

		return true;
	}
});
