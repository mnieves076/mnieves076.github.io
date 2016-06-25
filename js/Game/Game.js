var Game = Thunder.Component.extend({
	init: function(initRootElement) {
		this._super(initRootElement);

		//Initialize properties
		this.playerUnits = [];
		this.enemyUnits = [];
		this.playerUnitCount = 0;
		this.enemyUnitCount = 0;
		this.enemyUnitStartCount = 0;
		this.playerUnitStartCount = 0;
		this.staticEntities = [];
		this.mapNodeSize = 10;
		this.nodeMap = null;
		this.currentMousePosition; //Thunder.Point
		this.mouseDownPosition; //Thunder.Point
		this.mouseUpPosition; //Thunder.Point
		this.mouseEventMap; //Thunder.EventMap
		this.movementGoals = [];
		this.indicators = []; //Indicator
		this.indicatorActive = false;
		this.goalAngle;
		this.projectiles = []; //Array of Projectiles
		this.explosions = []; //Array of Animations
		this.unitToggle = true;
		this.levelManager = new LevelManager(this.assetManager);
		this.scrollDirection;
		this.mapPosition = new Thunder.Point(0,0);
		//this.isMultiplayer = false;
		this.syncSpeed = 1000;
		/* this.opponentFBUserID = null;
		this.opponentFBName = null;
		this.opponentFBLink = null; */
		this.gameOver = true;
		this.muteSound = false;

		//Initialize assets
		this.assetManager.addAsset("indicator","indicator","image/OrientationStrip.png","ROTATION_INDICATOR",0,0,60,60);
		this.assetManager.addAsset("indicator","indicator","image/TargetStrip.png","ATTACK_INDICATOR",0,0,60,60);
		this.assetManager.addAsset("path","path",null,"PATH_DISPLAY",0,0,0,0);
		this.assetManager.addAsset("input","mouse_input",null,"MOUSE_INPUT",0,0,0,0);

		this.assetManager.addAsset("gui","minimap",null,"MINIMAP",0,20,0,0);
		this.assetManager.addAsset("gui","navbar",null,"NAVBAR",0,0,0,0);

		for(var i = 0; i < 20; i++) {
			this.assetManager.addAsset("entity","playerunit",null,"U-" + i,0,0,60,60,{"index":i,"rotation":0});
			this.assetManager.addAsset("entity","enemyunit",null,"E-" + i,0,0,60,60,{"index":i,"rotation":0});
			//this.assetManager.addAsset("entity","netunit",null,"N-" + i,0,0,60,60,{"index":i,"rotation":0});
		}

		//Initialize layers
		this.layerManager.addLayer("/MAP");
		this.layerManager.addLayer("/ENTITY");
		this.layerManager.addLayer("/PATH");
		this.layerManager.addLayer("/EXPLOSION");
		this.layerManager.addLayer("/PROJECTILE");
		this.layerManager.addLayer("/INDICATOR");
		this.layerManager.addLayer("/INPUT");
		this.layerManager.addLayer("/GUI");

		//Listen for window resize
		var t = this;
		$(window).resize(function() { t.handleResize() });

		//Start
		this.createResponders();
		this.createCustomizers();	
		this.handleResize();
		this.bindKeyEvents();
		this.layerManager.layOut(this.assetManager.getAssets("path"),"/PATH");
		this.layerManager.layOut(this.assetManager.getAssets("indicator"),"/INDICATOR");

		var b = window.localStorage.getItem("ATPG_MUTE_SOUND");

		if(b != null) {
			this.setMute(parseInt(b));
		}
	},

	createResponders: function() {
		var t = this;

		this.addResponder("MOUSEDOWN", function(event) {
			$(document).focus();
			t.currentMousePosition = event.getLocalEventPosition();
			t.mouseDownPosition = event.getLocalEventPosition();

			if(!t.gameOver) {
				if(event.eventObject.ctrlKey) {
					if(!t.showAttackIndicator()) {
						t.startScrollMap();
					}
				} else {
					if(!t.showRotationIndicator()) {
						t.startScrollMap();
					}
				}
			}

			t.mouseEventMap.mapMouseMoveEvent();
		});
		
		this.addResponder("MOUSEUP", function(event) {
			t.mouseUpPosition = event.getLocalEventPosition();

			if(!t.gameOver) {
				if(!t.indicatorActive) {
					t.setSelection(event);
				} else {
					if(t.indicators['ROTATION_INDICATOR'].isShowing) {
						t.setMovementGoals(t.mouseDownPosition.getCopy());
						t.movePlayerUnits();
					}

					if(t.indicators['ATTACK_INDICATOR'].isShowing) {
						t.firePlayerUnits();
					}

					t.hideIndicators();
					t.updateInputCursor();
				}
			}

			t.endScrollMap();
			t.mouseEventMap.unMapMouseMoveEvent();
		});
		
		this.addResponder("MOUSEMOVE", function(event) {
			t.currentMousePosition = event.getLocalEventPosition();
			var d = t.mouseDownPosition.getDistance(t.currentMousePosition);

			if(d > t.nodeMap.size) {
				t.goalAngle = t.mouseDownPosition.getAngle(event.getLocalEventPosition());

				if(t.indicators['ROTATION_INDICATOR'].isShowing) {
					t.indicators['ROTATION_INDICATOR'].setRotation(t.goalAngle);
				} else if(!t.indicators['ATTACK_INDICATOR'].isShowing) {
					t.rotateSelectedUnits(t.goalAngle);
				}
			}
		});
		this.addResponder("DOUBLECLICK", function(event) {
			if(!t.indicators['ROTATION_INDICATOR'].isShowing && !t.indicators['ATTACK_INDICATOR'].isShowing && !t.gameOver) {
				t.setSelection(event, true);
			}
		});

		this.addResponder("DISPLAY_WIN_DIALOG", function(event) {
			t.drawDialog("win");
		});
		
		this.addResponder("DISPLAY_LOSE_DIALOG", function(event) {
			t.drawDialog("lose");
		});
		
		this.addResponder("ASSIGN_TARGETS", function(event) {
			t.assignTargets();
		});
		
		this.addResponder("FIRE_UNIT", function(event) {
			t.addProjectile(event.owner.getProjectileStartNode(),event.owner.getProjectileEndNode(),event.owner);
		});
		
		this.addResponder("CHECK_FOR_VICTORY", function(event) {
			t.checkForVictory();
		});
		
		this.addResponder("ANIMATION_COMPLETE", function(event) {
			t.explosions.push(event.owner);
		});
		
		this.addResponder("PROJECTILE_MOVEMENT_COMPLETE", function(event) {
			t.projectiles.push(event.owner);
			t.addExplosion(event.owner.getNodeGoal());
		});
		
		this.addResponder("CLEAR_PATH_DISPLAY", function(event) {
			t.clearPath();
		});
		
		this.addResponder("DRAW_PATH_DISPLAY", function(event) {
			t.drawPath(event.owner.route);
		});
		
		this.addResponder("PLAYER_TANK_REGISTER_DAMAGE", function(event) {
			t.activateNearbyUnits(event.owner);
		});
		
		this.addResponder("SCROLL_MAP", function(event) {
			t.scrollMap();
		});
		
		this.addResponder("MINI_MAP_UPDATE", function(event) {
			var p = event.owner.getMapPosition();
			p = new Thunder.Point(p.x * -10,p.y * -10);
			t.scrollMapToPosition(p);
		});
		
		/* this.addResponder("SYNC_EVENT", function(event) {
			this.sendSyncEvent();
		}); */
		
		this.addResponder("PLAY_CANON", function(event) {
			gAudio["CANON"].play();
		});
		
		this.addResponder("PLAY_EXPLOSION", function(event) {
			gAudio["EXPLOSION"].play();
		});
		
		this.addResponder("PLAY_ENEMY_DESTROYED", function(event) {
			gAudio["ENEMY_DESTROYED"].play();
		});
		
		this.addResponder("PLAY_HIT", function(event) {
			gAudio["HIT"].play();
		});
		
		this.addResponder("PLAY_SOUND_FX", function(event) {
			gAudio[event.owner.name].play();
		});
	},

	createCustomizers: function() {
		var t = this;

		t.addCustomizer("mouse_input", function(asset) {
			t.mouseEventMap = new Thunder.EventMap(asset.container,asset,t.eventQueue);
			asset.container.html("<img style='cursor: pointer; width:" + asset.width + "px; height:" + asset.height + "px' src='image/transpix.gif' id='" + asset.tag + "'/>");
		});
		
		t.addCustomizer("img", function(asset) {
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' id='" + asset.tag + "'/>");
		});
		
		t.addCustomizer("playerunit", function(asset) {
			var n = t.nodeMap.mapPointToNode(asset.getPosition().addPoint(new Thunder.Point(asset.width / 2,asset.height / 2)));
			var pu = new PlayerTankEntity(asset.container,n, t.nodeMap, asset.width,asset.height, asset.param, t.debug);
			pu.addListener(t.eventQueue);
			t.playerUnits.push(pu);
		});
		
		t.addCustomizer("enemyunit", function(asset) {
			var n = t.nodeMap.mapPointToNode(asset.getPosition().addPoint(new Thunder.Point(asset.width / 2,asset.height / 2)));
			var pu = new EnemyTankEntity(asset.container,n, t.nodeMap, asset.width,asset.height, asset.param, t.debug);
			pu.addListener(t.eventQueue);
			t.enemyUnits.push(pu);
		});
		
		t.addCustomizer("static", function(asset) {
			var n = t.nodeMap.mapPointToNode(asset.getPosition().addPoint(new Thunder.Point(asset.width / 2,asset.height / 2)));
			asset.param.id = asset.tag;
			t.staticEntities.push(new StaticEntity(asset.container,n, t.nodeMap, asset.src,asset.width,asset.height,asset.param,t.debug));
		});
		
		t.addCustomizer("barrier", function(asset) {
			var n = t.nodeMap.mapPointToNode(asset.getPosition().addPoint(new Thunder.Point(asset.width / 2,asset.height / 2)));
			t.staticEntities.push(new Barrier(asset.container,n, t.nodeMap, asset.src,asset.width,asset.height,asset.param,t.debug));
		});
		
		t.addCustomizer("indicator", function(asset) {
			if(t.indicators[asset.tag] == null) {
				t.indicators[asset.tag] = new Indicator(asset.container,asset.src,asset.width,asset.height,t.debug);
			}
		});
		
		t.addCustomizer("projectile", function(asset) {
			var n = t.nodeMap.mapPointToNode(asset.getPosition());
			var p = new Projectile(asset, n, t.nodeMap, asset.width, asset.height, t.debug);
			p.addListener(t.eventQueue);
			t.projectiles.push(p);
		});
		
		t.addCustomizer("explosion", function(asset) {
			var a = new Animation(asset, asset.width, asset.height, 16, 1600, 960, t.debug)
			t.explosions.push(a);
		});
		
		t.addCustomizer("html", function(asset) {
			asset.container.html("<div style='position:absolute;width:100%;height:100%;'>" + t.getHTML(asset.tag) + "</div>");
			Cufon.refresh();
		});
		
		t.addCustomizer("navbar", function(asset) {
			asset.param = new NavBar(asset.getContainer());
		});
		
		t.addCustomizer("minimap", function(asset) {
			asset.param = new MiniMap(asset.getContainer(), t.debug, t.levelManager.getMapPixelWidth(), t.levelManager.getMapPixelHeight());
			asset.param.addListener(t.eventQueue);
		});
		
		t.addCustomizer("box", function(asset) {
			asset.container.html("<div style='position: absolute; background-color: " + asset.param + "; width: 100%; height: 100%'/>");
		});
	},

	drawMap: function() {
		this.layerManager.layOut(this.assetManager.getAssets("input"),"/INPUT");
		this.layerManager.layOut(this.assetManager.getAssets("map"),"/MAP");
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
		this.layerManager.layOut(this.assetManager.getAssets("static-entity"),"/ENTITY");
	},

	eraseMap: function() {
		this.layerManager.clearSet("/INPUT");
		this.layerManager.clearSet("/MAP");
		this.layerManager.clearSet("/ENTITY");
		this.layerManager.clearSet("/GUI");
	},

	/************************************
		Movement and Rotation Functions
	*************************************/

	movePlayerUnits: function() {
		var angle = null;

		if(!this.mouseDownPosition.equals(this.mouseUpPosition)) {
			angle = this.mouseDownPosition.getAngle(this.mouseUpPosition);
		}

		if(this.movementGoals.length > 0) {
			this.clearPath();
			var n = this.nodeMap.mapPointToNode(this.movementGoals[0]);
			var movementCommands = [];

			for(var i = 0; i < this.playerUnits.length; i++) {
				if(this.playerUnits[i].selected) {
					this.playerUnits[i].stop();
					this.playerUnits[i].stopAttack();
					this.playerUnits[i].moveTo(n,angle);

					movementCommands.push({
						"index":this.playerUnits[i].index,
						"node":n,
						"angle":angle
					});
				}
			}

			if(this.isMultiplayer && movementCommands.length > 0) {
				App.multiplayerManager.send({"command":"MOVE_UNITS","movementCommands":movementCommands});
			}

			this.movementGoals = [];

			if(!this.muteSound) {
				switch(Math.floor(Math.random() * 4)) {
					case 0:
						this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"MOVING_OUT"});
						break;
					case 1:
						this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"YES_SIR"});
						break;
					case 2:
						this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"ROGER_THAT"});
						break;
				}
			}
		}
	},

	haltAllUnits: function() {
		for(var i = 0; i < this.playerUnits.length; i++) {
			this.playerUnits[i].stop();
			this.playerUnits[i].stopAttack();
		}

		for(var i = 0; i < this.enemyUnits.length; i++) {
			this.enemyUnits[i].stop();
			this.enemyUnits[i].stopAttack();
		}
	},

	haltSelectedUnits: function() {
		var haltCommands = [];

		for(var i = 0; i < this.playerUnits.length; i++) {
			if(this.playerUnits[i].selected) {
				this.playerUnits[i].stop();
				this.playerUnits[i].stopAttack();

				haltCommands.push({
					"index":this.playerUnits[i].index
				});
			}
		}

		this.clearPath();

		if(this.isMultiplayer && haltCommands.length > 0) {
			App.multiplayerManager.send({"command":"HALT_UNITS","haltCommands":haltCommands});
		}
	},

	rotateSelectedUnits: function(angle, excludedPlayerUnit) {
		var rotateCommands = [];

		for(var i = 0; i < this.playerUnits.length; i++) {
			if(this.playerUnits[i].selected && this.playerUnits[i] != excludedPlayerUnit) {
				this.playerUnits[i].rotateInPosition(angle);

				rotateCommands.push({
					"index":this.playerUnits[i].index,
					"angle":angle
				});
			}
		}

		if(this.isMultiplayer && rotateCommands.length > 0) {
			App.multiplayerManager.send({"command":"ROTATE_UNITS","rotateCommands":rotateCommands});
		}
	},

	setMovementGoals: function(p) {
		if(p != undefined) {
			var n = this.nodeMap.mapPointToNode(p);
			var e = this.nodeMap.getNodeEntity(n);

			if(e == null) {
				this.movementGoals = [p.getCopy()];
			}
		}
	},

	/************************************
		Fire Functions
	*************************************/

	firePlayerUnits: function() {
		var selection = this.getSelection();
		var n = this.nodeMap.mapPointToNode(this.mouseUpPosition);
		var fireCommands = [];

		for(var i = 0; i < selection.length; i++) {
			selection[i].stop();
			selection[i].stopAttack();
			selection[i].attackGround(n);

			fireCommands.push({
				"index":selection[i].index,
				"node":n
			});
		}

		if(this.isMultiplayer && fireCommands.length > 0) {
			App.multiplayerManager.send({"command":"FIRE_UNITS_AT_NODE","fireCommands":fireCommands});
		}
	},

	firePlayerUnitsAtEntity: function(e) {
		var selection = this.getSelection();
		var fireCommands = [];

		for(var i = 0; i < selection.length; i++) {
			selection[i].stop();
			selection[i].stopAttack();
			selection[i].attackEntity(e);

			fireCommands.push({
				"index":selection[i].index,
				"node":e.node
			});
		}

		if(this.isMultiplayer && fireCommands.length > 0) {
			App.multiplayerManager.send({"command":"FIRE_UNITS_AT_ENTITY","fireCommands":fireCommands});
		}

		if(selection.length > 0 && !this.muteSound) {
			switch(Math.floor(Math.random() * 4)) {
				case 0:
					this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"TARGET_CONFIRMED"});
					break;
				case 1:
					this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"ATTACKING_TARGET"});
					break;
				case 2:
					this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"ROGER_THAT"});
					break;
			}
		}
	},

	activateNearbyUnits: function (e) {
		var selection = this.getNearbyUnits(e);
		var fireCommands = [];

		for(var i = 0; i < selection.length; i++) {
			if(selection[i].targetEntity == null && !selection[i].moving) {
				if(selection[i] instanceof PlayerTankEntity || selection[i] instanceof EnemyTankEntity) {
					selection[i].attackEntity(e.targetEntity);
				}

				if(selection[i] instanceof PlayerTankEntity) {
					fireCommands.push({
						"index":selection[i].index,
						"node":e.node
					});
				}
			}
		}

		if(this.isMultiplayer && fireCommands.length > 0) {
			App.multiplayerManager.send({"command":"FIRE_UNITS_AT_ENTITY","fireCommands":fireCommands});
		}
	},

	/************************************
		Net Unit Functions
	*************************************/

	moveNetUnits: function(movementCommands) {
		for(var i = 0; i < movementCommands.length; i++) {
			this.enemyUnits[movementCommands[i].index].stop();
			this.enemyUnits[movementCommands[i].index].stopAttack();
			var n = new Thunder.Point(movementCommands[i].node.x,movementCommands[i].node.y);
			this.enemyUnits[movementCommands[i].index].moveTo(n,movementCommands[i].angle);
		}
	},

	fireNetUnitsAtNode: function(fireCommands) {
		for(var i = 0; i < fireCommands.length; i++) {
			this.enemyUnits[fireCommands[i].index].stop();
			this.enemyUnits[fireCommands[i].index].stopAttack();
			var n = new Thunder.Point(fireCommands[i].node.x,fireCommands[i].node.y);
			this.enemyUnits[fireCommands[i].index].attackGround(n);
		}
	},

	fireNetUnitsAtEntity: function(fireCommands) {
		for(var i = 0; i < fireCommands.length; i++) {
			this.enemyUnits[fireCommands[i].index].stop();
			this.enemyUnits[fireCommands[i].index].stopAttack();
			var e = this.nodeMap.getNodeEntity(fireCommands[i].node);
			this.enemyUnits[fireCommands[i].index].attackEntity(e);
		}
	},

	haltNetUnits: function(haltCommands) {
		for(var i = 0; i < haltCommands.length; i++) {
			this.enemyUnits[haltCommands[i].index].stop();
			this.enemyUnits[haltCommands[i].index].stopAttack();
		}
	},

	rotateNetUnits: function(rotateCommands) {
		for(var i = 0; i < rotateCommands.length; i++) {
			this.enemyUnits[rotateCommands[i].index].rotateInPosition(rotateCommands[i].angle);
		}
	},

	applyEntityDamage: function(node,damage) {
		var e = this.nodeMap.getNodeEntity(node);

		if(e != null) {
			e.registerDamageByValue(damage,false);
		}
	},

	sendSyncEvent: function() {
		if(this.isMultiplayer) {
			var unitData = [];

			for(var i = 0; i < this.playerUnits.length; i++) {
				//if(this.playerUnits[i].sendSyncEvent) {
					unitData.push({
						"index":this.playerUnits[i].index,
						"node":this.playerUnits[i].node,
						"rotation":this.playerUnits[i].rotation,
						"health":this.playerUnits[i].healthStatusBar.getValue(),
						"readiness":this.playerUnits[i].readyStatusBar.getValue(),
						"destroyed":this.playerUnits[i].isDestroyed,
						"nodeGoal":this.playerUnits[i].nodeGoal
					});

					this.playerUnits[i].sendSyncEvent = false;
				//}
			}

			if(unitData.length > 0) {
				App.multiplayerManager.send({"command":"SYNCHRONIZE","unitData":unitData});
			}

			this.eventQueue.addUniqueEvent("SYNC_EVENT",this.syncSpeed);
		}
	},

	applySynchronization: function(unitData) {
		for(var i = 0; i < unitData.length; i++) {
			var eu = this.enemyUnits[unitData[i].index];
			var sd = unitData[i];

			//apply node goal
			if((eu.nodeGoal.x != sd.nodeGoal.x) || (eu.nodeGoal.y != sd.nodeGoal.y)) {
				eu.nodeGoal = new Thunder.Point(sd.nodeGoal.x,sd.nodeGoal.y);

				if(eu.selected) this.trace("sync: nodeGoal set to " + eu.nodeGoal.toString());

				if(!eu.moving) {
					eu.stop();
					eu.stopAttack();
					eu.moveTo(eu.nodeGoal,eu.angleGoal);
				}
			}

			//apply position
			if((!isNaN(sd.node.x)) && (!isNaN(sd.node.y))) {
				if((eu.node.x != sd.node.x) || (eu.node.y != sd.node.y)) {
					if((eu.getPosition().getDistance(new Thunder.Point(sd.node.x,sd.node.y)) > 40) || !eu.isMoving) {
						if(eu.selected) this.trace("sync: position set to " + sd.node.x + "," + sd.node.y);
						eu.positionAt(sd.node.x,sd.node.y);
					}
				}
			}

			if(!eu.moving) {
				//apply rotation
				if(eu.rotation != sd.rotation) {
					eu.rotation = sd.rotation;
					if(eu.selected) this.trace("sync: rotation set to " + eu.rotation);
					eu.angleGoal = null;
					eu.rotate(0);
				}
			}

			//apply health
			if(eu.healthStatusBar.getValue() != sd.health) {
				eu.healthStatusBar.setValue(sd.health);
				if(eu.selected) this.trace("sync: health set to " + sd.health);

				if(sd.health == 0) {
					eu.handleDestruction();
				} else if(sd.health > 0 && eu.isDestroyed) {
					eu.undoDestruction();
				}
			}

			//apply destruction
			if((sd.destroyed && !eu.isDestroyed) || (eu.healthStatusBar.getValue() == 0 && !eu.isDestroyed)) {
				eu.isDestroyed = true;
				eu.handleDestruction();
			}

			//apply readiness
			if(eu.readyStatusBar.getValue() != sd.readiness) {
				if(eu.selected) this.trace("sync: readiness set to " + sd.readiness);
				eu.readyStatusBar.setValue(sd.readiness);
			}

		}
	},

	/************************************
		Selection Functions
	*************************************/

	notSelection: function(event) {
		var n = this.nodeMap.mapPointToNode(this.mouseDownPosition);
		var e = this.nodeMap.getNodeEntity(n);

		if(e == null) {
			return true;
		}

		return false;
	},

	setSelection: function(event, selectNearbyUnits) {
		var n = this.nodeMap.mapPointToNode(this.mouseDownPosition);
		var e = this.nodeMap.getNodeEntity(n);

		if(e != null) {
			if(e instanceof PlayerTankEntity) {
				if(!event.eventObject.shiftKey) {
					if(selectNearbyUnits) {
						this.selectNearbyUnits(e);
						return true;
					} else {
						this.deselectPlayerUnits(e);
						this.deselectStaticEntities(e);
						this.deselectEnemyUnits();
					}
				}

				e.toggleSelection();
				this.updateInputCursor();
			} else if(e instanceof StaticEntity) {
				if(this.getSelection().length == 0) {
					e.toggleSelection();
				} else {
					if(!e.selected) {
						e.toggleSelection();
					}
				}

				this.deselectStaticEntities(e);
				this.deselectEnemyUnits();
				this.firePlayerUnitsAtEntity(e);
			} else if(e instanceof EnemyTankEntity) {
				if(this.getSelection().length == 0) {
					e.toggleSelection();
				} else {
					if(!e.selected) {
						e.toggleSelection();
					}
				}

				this.deselectStaticEntities();
				this.deselectEnemyUnits(e);
				this.firePlayerUnitsAtEntity(e);
			}

			return true;
		}

		return false;
	},

	getSelection: function(excludedPlayerUnit) {
		var selection = [];

		for(var i = 0; i < this.playerUnits.length; i++) {
			if(this.playerUnits[i].selected && this.playerUnits[i] != excludedPlayerUnit) {
				selection.push(this.playerUnits[i]);
			}
		}

		return selection;
	},

	updateInputCursor: function() {
		var d = this.assetManager.getAsset("MOUSE_INPUT").container.find("img");

		if(this.getSelection().length > 0) {
			d.css({"cursor":"crosshair"});
		} else {
			d.css({"cursor":"pointer"});
		}
	},

	getNearbyUnits: function(e) {
		var selection = [];

		for(var i = 0; i < this.playerUnits.length; i++) {
			if(e.getPosition().getDistance(this.playerUnits[i].getPosition()) <= 120) {
				selection.push(this.playerUnits[i]);
			}
		}

		return selection;
	},

	selectNearbyUnits: function(e) {
		var selection = this.getNearbyUnits(e);

		for(var i = 0; i < selection.length; i++) {
			if(!selection[i].selected) {
				selection[i].toggleSelection();
			}
		}

		this.updateInputCursor();
	},

	togglePlayerUnitSelection: function() {
		this.unitToggle = !this.unitToggle;

		for(var i = 0; i < this.playerUnits.length; i++) {
			if(this.playerUnits[i].selected == this.unitToggle) {
				this.playerUnits[i].toggleSelection();
			}
		}
	},

	deselectPlayerUnits: function(excludedPlayerUnit) {
		for(var i = 0; i < this.playerUnits.length; i++) {
			if(this.playerUnits[i].selected && this.playerUnits[i] != excludedPlayerUnit) {
				this.playerUnits[i].toggleSelection();
			}
		}

		this.updateInputCursor();
	},

	deselectStaticEntities: function(excludedStaticEntity) {
		for(var i = 0; i < this.staticEntities.length; i++) {
			if(this.staticEntities[i].selected && this.staticEntities[i] != excludedStaticEntity) {
				this.staticEntities[i].toggleSelection();
			}
		}
	},

	deselectEnemyUnits: function(excludedEnemyUnit) {
		for(var i = 0; i < this.enemyUnits.length; i++) {
			if(this.enemyUnits[i].selected && this.enemyUnits[i] != excludedEnemyUnit) {
				this.enemyUnits[i].toggleSelection();
			}
		}
	},

	/************************************
		Misc Functions
	*************************************/

	convertAngleToRotation: function(a) {
		var r = 0;

		for(var i = 0; i <= 360; i += 22.5) {
			if(a <= i) {
				r = Math.floor(i / 45);
				break;
			}
		}

		if(r > 7) {
			r = 0;
		}

		return r;
	},

	bindKeyEvents: function() {
		var t = this;

		$(document).focus();
		$(document).keypress(function(event) {
			if (typeof event.keyCode != "undefined") {
				var k = event.keyCode;
			} else {
				var k = event.which;
			}

			//if(window.console) console.log("key code: " + k);

			switch(k) {
				case 96: //clear selection
					t.deselectPlayerUnits(null);
					t.deselectEnemyUnits();
					t.deselectStaticEntities();
					break;
				case 32: //halt selected units
					t.haltSelectedUnits();
					break;
				case 13: //select all units
					t.togglePlayerUnitSelection();
					break;
			}
   		});
	},

	moveToBack: function(c) {
		this.layerManager.moveToLayer("/ENTITY",c,true);
	},

	setMute: function(newState) {
		if(isNaN(newState)) {
			newState = false;
		}

		this.muteSound = newState;
		window.localStorage.setItem("ATPG_MUTE_SOUND",(newState == true) ? 1:0);

		if(App) {
			if(this.muteSound) {
				App.stopBackgroundAudio();
			} else {
				App.playRandomBackgroundAudio();
			}
		}
	},

	getMute: function() {
		return this.muteSound;
	},

	/************************************
		Indicator Functions
	*************************************/

	showRotationIndicator: function() {
		var selection = this.getSelection();

		if(selection.length > 0) {
			var n = this.nodeMap.mapPointToEmptyNode(this.mouseDownPosition);

			//determine if the position contains an entity
			if(n == null) {
				return false;
			}

			//determine if the position is a valid location
			if(!this.nodeMap.canEnter(n,selection[0],true)) {
				if(!this.muteSound) {
					this.eventQueue.addUniqueEvent("PLAY_SOUND_FX",1000,{"name":"CANT_MOVE_THERE"});
				}
				return false;
			}

			var i = this.indicators['ROTATION_INDICATOR'];
			i.setPosition(this.mouseDownPosition.x - (i.width / 2),this.mouseDownPosition.y - (i.height / 2));
			i.show();

			//set default indicator rotation
			i.setRotation(selection[0].getPosition().getAngle(i.getPosition()));
			this.indicatorActive = true;
			return true;
		}

		return false;
	},

	showAttackIndicator: function() {
		var selection = this.getSelection();

		if(selection.length > 0) {
			var i = this.indicators['ATTACK_INDICATOR'];
			i.setPosition(this.mouseDownPosition.x - (i.width / 2),this.mouseDownPosition.y - (i.height / 2));
			i.show();
			this.indicatorActive = true;
			return true;
		}

		return false;
	},

	hideIndicators: function() {
		this.indicators['ROTATION_INDICATOR'].hide();
		this.indicators['ATTACK_INDICATOR'].hide();
		this.indicatorActive = false;
	},

	/************************************
		Projectile Functions
	*************************************/

	addProjectile: function(startNode, endNode, entityOwner) {
		if(startNode == null || endNode == null || entityOwner == null || this.gameOver) {
			return;
		}

		if(!this.muteSound) {
			this.eventQueue.addUniqueEvent("PLAY_CANON",250);
		}

		var startPoint = this.nodeMap.mapNodeToPoint(startNode);

		if(this.projectiles.length == 0) {
			//create a new projectile asset
			var tag = "PROJECTILE-" + (new Date()).getTime() + "-" + (Math.random() * 9999);
			var asset = this.assetManager.addAsset("projectile","projectile","image/shell.jpg",tag,startPoint.x,startPoint.y,3,3);
			this.layerManager.addToLayOut([asset],"/PROJECTILE");
		}

		var projectile = this.projectiles.pop();
		projectile.asset.setPosition(startPoint.x,startPoint.y);
		var n = this.nodeMap.mapPointToNode(projectile.asset.getPosition());
		projectile.node = n;
		projectile.setTarget(endNode, entityOwner);
	},

	addExplosion: function(n) {
		if(this.gameOver) {
			return;
		}

		if(!this.muteSound) {
			this.eventQueue.addUniqueEvent("PLAY_EXPLOSION",250);
		}

		var startPoint = this.nodeMap.mapNodeToPoint(n);

		if(this.explosions.length == 0) {
			//create a new explosion asset
			var tag = "EXPLOSION-" + (new Date()).getTime() + "-" + (Math.random() * 9999);
			var asset = this.assetManager.addAsset("explosion","explosion","image/ExplosionStrip.png",tag,startPoint.x - 30,startPoint.y - 30,60,60);
			this.layerManager.addToLayOut([asset],"/EXPLOSION");
		}

		var explosion = this.explosions.pop();
		explosion.asset.setPosition(startPoint.x - 30,startPoint.y - 30);
		explosion.draw();
	},

	/************************************
		Enemy Unit Functions
	*************************************/

	assignTargets: function() {
		if(this.isMultiplayer || this.gameOver) {
			return;
		}

		//this.getUnitCount();

		if(this.playerUnits.length > 0) {
			for(var i = 0; i < this.enemyUnits.length; i++) {
				if(!this.enemyUnits[i].isDestroyed && this.enemyUnits[i].targetEntity == null) {
					for(var ii = 0; ii < this.playerUnits.length; ii++) {
						if(!this.playerUnits[ii].isDestroyed) {
							if(this.getAssignmentCount(this.playerUnits[ii]) < 2 || (this.enemyUnitCount / this.playerUnitCount > 2)) {
								this.enemyUnits[i].attackEntity(this.playerUnits[ii]);
								break;
							}
						}
					}
				}
			}
		}
	},

	getAssignmentCount: function(e) {
		var assignmentCount = 0;

		for(var i = 0, ii = this.enemyUnits.length; i < ii; i++) {
			if(!this.enemyUnits[i].isDestroyed) {
				if(this.enemyUnits[i].targetEntity == e) {
					assignmentCount++;

					if(assignmentCount == 2) {
						return assignmentCount;
					}
				}
			}
		}

		return assignmentCount;
	},

	/************************************
		Level Functions
	*************************************/

	loadLevel: function(newLevel) {
		if(newLevel) {
			this.broadcastEvent("LOAD_NEW_LEVEL");
			this.levelManager.setLevel(newLevel);
		}

		this.load(null);
		this.broadcastEvent("LOAD_LEVEL_COMPLETE");
	},

	startLevel: function() {
		if(this.gameOver) {
			this.gameOver = false;
			this.isMultiplayer = false;
			this.broadcastEvent("START_LEVEL");
			this.layerManager.addToLayOut(this.levelManager.startLevel(),"/ENTITY");
			this.eventQueue.addEvent("ASSIGN_TARGETS",10000);

			var mapLocY = (this.levelManager.getMapPixelHeight() - this.height) / 2;

			if(mapLocY < 0) {
				mapLocY = 0;
			}

			if(this.levelManager.playerStartsEast) {
				var mapLocX = this.levelManager.getMapPixelWidth() - this.width;

				if(mapLocX < 0) {
					mapLocX = 0;
				}

				this.scrollMapToPosition(new Thunder.Point(mapLocX * -1,mapLocY * -1));
			} else {
				this.scrollMapToPosition(new Thunder.Point(0,mapLocY * -1));
			}

			this.assetManager.getAsset("MINIMAP").param.setEntities(this.playerUnits.concat(this.enemyUnits));
		}
	},

	/************************************
		Multiplayer Functions
	*************************************/

	startMatch: function(whichMap,whichStart,initOpponent,totalUnits) {
		this.gameOver = false;
		this.isMultiplayer = true;
		this.load(whichMap);

		this.layerManager.addToLayOut(this.levelManager.startMatch(whichStart,totalUnits),"/ENTITY");
		var mapLocY = (this.levelManager.getMapPixelHeight() - this.height) / 2;

		if(mapLocY < 0) {
			mapLocY = 0;
		}

		if(this.levelManager.playerStartsEast) {
			var mapLocX = this.levelManager.getMapPixelWidth() - this.width;

			if(mapLocX < 0) {
				mapLocX = 0;
			}

			this.scrollMapToPosition(new Thunder.Point(mapLocX * -1,mapLocY * -1));
		} else {
			this.scrollMapToPosition(new Thunder.Point(0,mapLocY * -1));
		}

		this.assetManager.getAsset("MINIMAP").param.setEntities(this.playerUnits.concat(this.enemyUnits));
		this.broadcastEvent("LOAD_MATCH");

		this.opponentFBUserID = initOpponent.fbUserID;
		this.opponentFBName = initOpponent.fbUserName;
		this.opponentFBLink = initOpponent.fbUserLink;

		this.broadcastEvent("START_MATCH");

		this.eventQueue.addUniqueEvent("SYNC_EVENT",this.syncSpeed);
	},

	endMatch: function() {
		this.getUnitCount();

		if(this.playerUnitCount == 0) {
			App.handleMultiPlayerDefeat();
		} else if(this.enemyUnitCount == 0) {
			App.handleMultiPlayerVictory();
		}

		App.chatDialog.hide();
		this.stop();
		this.eventQueue.removeEvent("SYNC_EVENT");
	},

	/************************************

	*************************************/

	quit: function() {
		if(this.isMultiplayer) {
			App.multiplayerManager.send({"command":"MULTI_PLAYER_QUIT"});
			this.endMatch();
			this.broadcastEvent("MULTIPLAYERQUIT");
		} else {
			this.stop();
			this.broadcastEvent("SINGLEPLAYERQUIT");
		}
	},

	load: function(whichMap) {
		this.clearPath();
		this.eraseMap();
		this.playerUnits = [];
		this.enemyUnits = [];
		this.staticEntities = [];
		this.projectiles = [];
		this.levelManager.loadMap(whichMap);

		var mapWidth = this.levelManager.getMapPixelWidth();
		var mapHeight = this.levelManager.getMapPixelHeight();

		this.nodeMap = new NodeMap(this.mapNodeSize, mapWidth, mapHeight);

		var asset = this.assetManager.getAsset("PATH_DISPLAY");
		asset.setWidth(mapWidth);
		asset.setHeight(mapHeight);

		var asset = this.assetManager.getAsset("MOUSE_INPUT");
		asset.setWidth(mapWidth);
		asset.setHeight(mapHeight);
		$("#MOUSE_INPUT").css({"width": mapWidth + "px","height": mapHeight + "px"});

		this.handleResize();
		this.drawMap();
	},

	getUnitCount: function() {
		this.enemyUnitCount = 0;
		this.playerUnitCount = 0;
		this.enemyUnitStartCount = this.enemyUnits.length;
		this.playerUnitStartCount = this.playerUnits.length;

		for(var i = 0, ii = this.enemyUnits.length; i < ii; i++) {
			if(!this.enemyUnits[i].isDestroyed) {
				this.enemyUnitCount++;
			}
		}

		for(var i = 0, ii = this.playerUnits.length; i < ii; i++) {
			if(!this.playerUnits[i].isDestroyed) {
				this.playerUnitCount++;
			}
		}
	},

	checkForVictory: function() {
		this.getUnitCount();

		if(this.playerUnitCount == 0) {
			if(this.isMultiplayer) {
				this.sendSyncEvent();
				App.multiplayerManager.send({"command":"MULTI_PLAYER_DEFEAT"});
				return;
			} else {
				if(!this.gameOver) {
					this.broadcastEvent("SINGLE_PLAYER_DEFEAT");
				}
			}

			this.stop();
			return;
		}

		if(this.enemyUnitCount == 0) {
			if(this.isMultiplayer) {
				this.sendSyncEvent();
				App.multiplayerManager.send({"command":"MULTI_PLAYER_VICTORY"});
				return;
			} else {
				if(!this.gameOver) {
					this.broadcastEvent("SINGLE_PLAYER_VICTORY");
				}
			}

			this.stop();
			return;
		}
	},

	stop: function() {
		this.gameOver = true;
		this.eventQueue.removeAllEvents();
		this.haltAllUnits();
	},

	/************************************
		Level Functions
	*************************************/

	drawPath: function(route) {
		if(route.length > 0) {
			var h = "";

			for(var i = 0, ii = route.length; i < ii; i++) {
				h += "<img src='image/marker.jpg' style='position: absolute; top: " + (route[i].y * this.nodeMap.size) + "px; left: " + (route[i].x * this.nodeMap.size) + "px'/>";
			}

			this.assetManager.getAsset("PATH_DISPLAY").container.html(h);
		}
	},

	clearPath: function() {
		this.assetManager.getAsset("PATH_DISPLAY").container.empty();
	},

	/************************************
		Map Functions
	*************************************/

	startScrollMap: function(newDirection) {
		this.eventQueue.addUniqueEvent("SCROLL_MAP");
	},

	endScrollMap: function () {
		this.eventQueue.removeEvent("SCROLL_MAP");
	},

	scrollMap: function() {
		var shiftX = this.mouseDownPosition.x - this.currentMousePosition.x;
		var shiftY = this.mouseDownPosition.y - this.currentMousePosition.y;

		if(shiftX != 0 || shiftY != 0) {
			this.mapPosition.x -= shiftX;
			this.mapPosition.y -= shiftY;

			if(this.mapPosition.x < (this.levelManager.getMapPixelWidth() - this.getWidth()) * -1) {
				this.mapPosition.x = (this.levelManager.getMapPixelWidth() - this.getWidth()) * -1;
			}

			if(this.mapPosition.y < (this.levelManager.getMapPixelHeight() - this.getHeight()) * -1) {
				this.mapPosition.y = (this.levelManager.getMapPixelHeight() - this.getHeight()) * -1;
			}

			if(this.mapPosition.x > 0) {
				this.mapPosition.x = 0;
			}

			if(this.mapPosition.y > 0) {
				this.mapPosition.y = 0;
			}

			this.scrollMapToPosition(this.mapPosition);
		}

		this.eventQueue.addUniqueEvent("SCROLL_MAP",100);
	},

	scrollMapToPosition: function(newPosition) {
		var movingLayers = ["MAP","PATH","ENTITY","EXPLOSION","PROJECTILE","INDICATOR","INPUT"];

		for(var i = 0; i < movingLayers.length; i++) {
			this.layerManager.setLayerSetPosition(movingLayers[i],newPosition);
		}

		if(!this.mapPosition.equals(newPosition)) {
			this.mapPosition = newPosition.getCopy();
		}

		var p = new Thunder.Point((this.mapPosition.x * -1) / this.mapNodeSize,(this.mapPosition.y * -1) / this.mapNodeSize);
		this.assetManager.getAsset("MINIMAP").param.setMapPosition(p);
	},

	/************************************
		Resize Functions
	*************************************/

	handleResize: function() {
		var w = $(window).width() - gAdWidth;
		var h = $(window).height();

		if(w < 500) { w = 500; }
		if(h < 500) { h = 500; }

		this.setWidth(w);
		this.setHeight(h);

		if(w > this.levelManager.getMapPixelWidth()) {
			w = this.levelManager.getMapPixelWidth();
		}

		if(h > this.levelManager.getMapPixelHeight()) {
			h = this.levelManager.getMapPixelHeight();
		}

		this.assetManager.getAsset("MINIMAP").setPosition(w - (this.levelManager.getMapPixelWidth() / 10) - 10,20);
	}
});
