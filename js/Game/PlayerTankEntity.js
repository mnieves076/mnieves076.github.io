var PlayerTankEntity = TankEntity.extend({
	init: function(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug);

		//Initialize properties
		this.selectionColor = "#FFFF00";
		this.idleColor = "#FF6600";
		this.replenishRate = 14.28;

		//Initialize assets
		this.assetManager.addAsset("gui","img","image/PlayerTankStrip.png","STRIP",0,0,480,60);
		this.assetManager.addAsset("idle","box",null,"IDLE_INDICATOR",0,0,this.width,this.height,{
			color: this.idleColor,
			style: "dotted"
		});

		//Set the selection color
		this.assetManager.getAsset("SELECTION").param = {
			color: this.selectionColor,
			style: "solid"
		};

		//Initialize layers
		this.layerManager.addLayer("/UNIT");
		this.layerManager.addLayer("/IDLE");

		//Start
		this.createResponders();
		this.draw();
		this.hanldeIdleBorderBlink();
	},

	createResponders: function() {
		var t = this;
		
		this.addResponder("ATTACK_GROUND", function(event) {
			t.attackGround(t.target);
		});
		
		this.addResponder("BLINK_IDLE_BORDER", function(event) {
			var asset = t.assetManager.getAsset("IDLE_INDICATOR");
			asset.setVisible(!asset.getVisible());
			t.eventQueue.addUniqueEvent("BLINK_IDLE_BORDER",1500);
		});
		
		this._super();
	},

	attackGround: function(n) {
		if(!this.isDestroyed) {
			this.target = n;

			//determine if unit is facing in correct direction, rotate toward direction
			var a = this.node.getAngle(this.target);
			var needsMoreRotation = this.rotateTo(a);

			//determine if unit is in range of target
			var d = this.node.getDistance(this.target) * this.nodeMap.size;
			var moveToTarget = (d > this.maxRange);

			if(needsMoreRotation && !this.moving) {
				this.stop();
				this.eventQueue.addUniqueEvent("ATTACK_GROUND",250);
			} else if(moveToTarget) {
				if(!this.moving) {
					this.moveTo(this.target.getCopy(), a, (d - this.maxRange));
				}
				this.eventQueue.addUniqueEvent("ATTACK_GROUND",250);
			} else {
				if(!this.isDestroyed) {
					this.stop();

					//unit is facing target, proceed to fire
					if(this.readyStatusBar.getValue() == 100) {
						this.projectileStartNode = this.offsetNode(this.node.getCopy(), (this.width / 10) / 2);

						/*if(App.game.isMultiplayer) {
							App.multiplayerManager.send({"command":"FIRE_UNIT","fireCommands":[{"index":this.index}]});
						} */

						this.broadcastEvent("FIRE_UNIT");
						this.readyStatusBar.setValue(0);
					} else {
						//still reloading
						this.eventQueue.addUniqueEvent("ATTACK_GROUND",250);
					}
				}
			}

			//if(this.selected) { this.toggleSelection(); }
			//this.sendSyncEvent = true;
			this.hanldeIdleBorderBlink();
		}
	},

	attackEntity: function(e) {
		if(!(e instanceof PlayerTankEntity)) {
			this._super(e);
			if(this.selected) this.broadcastUniqueEvent("CLEAR_PATH_DISPLAY",null,100);
			this.hanldeIdleBorderBlink();
		}
	},

	registerDamage: function(e) {
		if(!this.isDestroyed) {
			this._super(e);
			this.handleDestruction();
		}
	},

	registerDamageByValue: function(damage, emit) {
		this._super(damage, emit);
		this.handleDestruction();
	},

	handleDestruction: function() {
		this._super();

		if(this.isDestroyed) {
			if(!App.game.muteSound) {
				this.broadcastUniqueEvent("PLAY_HIT",null,100);
			}
		}

		this.broadcastEvent("PLAYER_TANK_REGISTER_DAMAGE");
		this.hanldeIdleBorderBlink();
	},

	move: function() {
		this._super();

		if(this.route.length == 0 && this.selected) {
			if(this.route.length > 0) { App.game.clearPath(); }
		} else if(this.selected) {
			if(this.route.length > 0) { App.game.drawPath(this.route); }
		}

		this.hanldeIdleBorderBlink();
	},

	moveTo: function(newNodeGoal, newAngleGoal, distanceLimit) {
		this._super(newNodeGoal, newAngleGoal, distanceLimit);
		if(this.route.length > 0 && this.selected) { App.game.drawPath(this.route); }
		if(this.selected) { this.toggleSelection(); }
		this.hanldeIdleBorderBlink();
	},

	toggleSelection: function() {
		this._super();

		if(this.targetEntity != null) {
			if(this.targetEntity.selected != this.selected) {
				this.targetEntity.toggleSelection();
			}
		}

		if(!this.selected) {
			if(this.route.length > 0) { App.game.clearPath(); }
		} else {
			if(this.route.length > 0) { App.game.drawPath(this.route); }
		}

		this.hanldeIdleBorderBlink();
	},

	hanldeIdleBorderBlink: function() {
		if(this.isIdle() && !this.selected && !this.isDestroyed) {
			this.showIdleBorder();
			this.eventQueue.addUniqueEvent("BLINK_IDLE_BORDER",1500);
		} else {
			this.eventQueue.removeEvent("BLINK_IDLE_BORDER");
			this.hideIdleBorder();
		}
	},

	showIdleBorder: function() {
		this.layerManager.layOut(this.assetManager.getAssets("idle"),"/IDLE");
	},

	hideIdleBorder: function() {
		this.layerManager.clearSet("/IDLE");
	},

	stop: function() {
		this._super();
		this.hanldeIdleBorderBlink();
	},

	stopAttack: function() {
		this._super();
		this.hanldeIdleBorderBlink();
	}
});
