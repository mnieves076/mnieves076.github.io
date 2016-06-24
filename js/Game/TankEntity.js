var TankEntity = MobileEntity.extend({
	init: function(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement, initNode, initNodeMap, initWidth, initHeight, {rotation: initParam.rotation, blockOffsetX: 20, blockOffsetY: 20}, initDebug);

		//Initialize properties
		this.index = initParam.index;
		this.target = null; //Thunder.Point
		this.targetEntity = null; //Entity
		this.readyStatusBar; //StatusBar
		this.maxRange = 440;
		this.replenishRate = 12.5;
		this.projectileStartNode = null;

		//Initialize assets
		this.assetManager.addAsset("status","ready_status",null,"READY_STATUS",2,this.height - 6,this.width - 4,4);
		
		this.createResponders();
		this.createCustomizers();	
	},

	createResponders: function() {
		var t = this;
		
		this.addResponder("ATTACK_ENTITY", function(event) {
			this.attackEntity(this.targetEntity);

			/* if(this instanceof PlayerTankEntity && App.game.isMultiplayer && this.targetEntity != null) {
				App.multiplayerManager.send({"command":"FIRE_UNITS_AT_ENTITY","fireCommands":[{"index":this.index,"node":this.targetEntity.node}]});
			} */
		});
		
		this.addResponder("REPLENISH_COMPLETE", function(event) {
			this.eventQueue.addUniqueEvent("ATTACK_ENTITY",0);
		});
		
		this._super();
	},

	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("ready_status", function(asset) {
			t.readyStatusBar = new StatusBar(asset.container,asset.width,asset.height,"0099FF","000000",t.debug);
			t.readyStatusBar.setReplenishRate(t.replenishRate,1000);
			t.readyStatusBar.draw();
			t.readyStatusBar.addListener(t.eventQueue);
		});
		
		this._super();
	},

	draw: function() {
		this._super();
		this.layerManager.setLayerMask("/UNIT",0,this.width,this.height,0);
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/UNIT");

		if(!this.isDestroyed) {
			this.layerManager.addToLayOut([this.assetManager.getAsset("READY_STATUS")],"/STATUS");
		}

		this.rotate(0);

		this.readyStatusBar.setVisible(!this.isDestroyed);
		this.healthStatusBar.setVisible(!this.isDestroyed);
	},

	isIdle: function() {
		if(!this.moving && this.targetEntity == null) {
		//if(this.node.equals(this.nodeGoal) && this.targetEntity == null) {
			return true;
		} else {
			return false;
		}
	},

	/*showSelection: function() {
		this._super();
		this.trace("> angleGoal = " + this.angleGoal);
		this.trace("> rotation = " + this.rotation);
	},*/

	rotateInPosition: function(angle) {
		if(this.angleGoal != angle) {
			this.angleGoal = angle;
			this.eventQueue.addUniqueEvent("MOVE",0);
		}
	},

	attackEntity: function(e) {
		if(e == null) {
			this.stopAttack();
			return;
		}

		if(!this.isDestroyed) {
			if(!e.isDestroyed) {
				this.targetEntity = e;

				//determine if unit is in range of target
				var d = this.node.getDistance(this.targetEntity.node) * this.nodeMap.size;
				var a = this.node.getAngle(this.targetEntity.node);

				var moveToTarget = (d > this.maxRange);

				//determine if unit is facing in correct direction, rotate toward direction
				var needsMoreRotation = false;
				var r = this.convertAngleToRotation(a);

				if(this.rotation != r) {
					var needsMoreRotation = this.rotateTo(a);
				}

				if(needsMoreRotation) {
					//if(this.debug) { console.log("rotate: is " + this.rotation + " needs " + r) } /////
					this.eventQueue.addUniqueEvent("ATTACK_ENTITY",500);
				} else if(moveToTarget) {
					if(!this.moving) {
						//if(this.debug) { console.log("move to target at " + this.targetEntity.node.toString()) } /////
						this.moveTo(this.targetEntity.node, a, (d - 100));
					}

					this.eventQueue.addUniqueEvent("ATTACK_ENTITY",3000);
				} else {
					this.stop();

					//unit is facing target, proceed to fire
					if(this.readyStatusBar.getValue() == 100) {
						this.projectileStartNode = this.offsetNode(this.node.getCopy(), (this.width / 10) / 2);

						if(this.hasLOS(this.projectileStartNode,this.targetEntity.node)) {
							/*if(this instanceof PlayerTankEntity && App.game.isMultiplayer) {
								App.multiplayerManager.send({"command":"FIRE_UNIT","fireCommands":[{"index":this.index}]});
							} */

							//if(this instanceof PlayerTankEntity || this instanceof EnemyTankEntity) {
								this.broadcastEvent("FIRE_UNIT");
								this.readyStatusBar.setValue(0);
							//}
						} else {
							this.eventQueue.addUniqueEvent("ATTACK_ENTITY",500);
						}
						//if(this.debug) { console.log("firing") } /////////////////////////
					} else {
						//still reloading
						//if(this.debug) { console.log("reloading") } /////////////////////////
					}
				}

				//this.sendSyncEvent = true;
			} else {
				this.stopAttack();
			}
		}
	},

	getProjectileStartNode: function() {
		return this.projectileStartNode;
	},

	getProjectileEndNode: function() {
		if(this.targetEntity != null) {
			return this.targetEntity.node;
		} else {
			return this.target;
		}
	},

	stopAttack: function() {
		//if(this.debug) { console.log("stop attack") } /////////////////////////
		this.eventQueue.removeEvent("ATTACK_GROUND");
		this.eventQueue.removeEvent("ATTACK_ENTITY");
		this.target = null;
		this.targetEntity = null;
	},

	offsetNode: function(n, d) {
		switch(this.rotation) {
			case 0:
				n.y -= d;
				break;
			case 1:
				n.x += d;
				n.y -= d;
				break;
			case 2:
				n.x += d;
				break;
			case 3:
				n.x += d;
				n.y += d;
				break;
			case 4:
				n.y += d;
				break;
			case 5:
				n.x -= d;
				n.y += d;
				break;
			case 6:
				n.x -= d;
				break;
			case 7:
				n.x -= d;
				n.y -= d;
				break;
		}

		return n;
	},

	registerDamage: function(e) {
		if(!this.isDestroyed) {
			this._super(e);
			this.sendSyncEvent = true;

			if(this.isDestroyed) {
				this.handleDestruction();
			} else {
				if(this.targetEntity != e) {
					if(this instanceof EnemyTankEntity) {
						var isBothEnemy = (this instanceof EnemyTankEntity && e instanceof EnemyTankEntity);

						if(!isBothEnemy) {
							this.stop();
							this.stopAttack();
							this.attackEntity(e);
						}
					} else {
						if(this.targetEntity == null && !this.moving) {
							var isBothPlayer = (this instanceof PlayerTankEntity && e instanceof PlayerTankEntity);

							if(!isBothPlayer) {
								if(this instanceof PlayerTankEntity) {
									this.stop();
									this.stopAttack();
									this.attackEntity(e);

									if(App.game.isMultiplayer) {
										App.multiplayerManager.send({"command":"FIRE_UNITS_AT_ENTITY","fireCommands":[{"index":this.index,"node":e.node}]});
									}
								}
							}
						}
					}
				}
			}
		}
	},

	handleDestruction: function() {
		if(this.healthStatusBar.getValue() == 0) {
			this.isDestroyed = true;
			this.sendSyncEvent = true;
		}

		if(this.isDestroyed) {
			this.eventQueue.removeAllEvents();
			this.stop();
			this.stopAttack();

			//Draw destroyed state
			if(this instanceof EnemyTankEntity) {
				this.source = "image/DestroyedEnemyTankStrip.png";
			} else {
				this.source = "image/DestroyedPlayerTankStrip.png";
			}

			this.assetManager.getAsset("STRIP").src = this.source;
			this.draw();
			
			if(this instanceof PlayerTankEntity) {
				this.broadcastUniqueEvent("ASSIGN_TARGETS",null,100);
				if(this.selected) this.broadcastUniqueEvent("CLEAR_PATH_DISPLAY",null,100);
			}
			
			//Turn off selection
			if(this.selected) {
				this.toggleSelection();
			}

			//Remove from node map
			this.updateNodeMap(0);

			this.broadcastUniqueEvent("CHECK_FOR_VICTORY",null,100);
			App.game.moveToBack(this.container);
		}
	},

	undoDestruction: function() {
		this.isDestroyed = false;
		this.sendSyncEvent = true;

		//Draw live state
		if(this instanceof EnemyTankEntity) {
			this.source = "image/EnemyTankStrip.png";
		} else {
			this.source = "image/PlayerTankStrip.png";
		}

		this.assetManager.getAsset("STRIP").src = this.source;
		this.draw();

		//Add to node map
		this.updateNodeMap(1);
	},

	hasLOS: function(startNode,endNode) {
		//if(this.debug) { console.log("check LOS") } /////////////////////////

		//determine route
		var wayPoint = startNode.getCopy();

		while(!wayPoint.equals(endNode)) {
			if(wayPoint.x > endNode.x) {
				wayPoint.x -= 1;
			}

			if(wayPoint.x < endNode.x) {
				wayPoint.x += 1;
			}

			if(wayPoint.y > endNode.y) {
				wayPoint.y -= 1;
			}

			if(wayPoint.y < endNode.y) {
				wayPoint.y += 1;
			}

			//determine if the waypoint is occupied
			var e = this.nodeMap.getNodeEntity(wayPoint);

			if(e != null) {
				if(e == this.targetEntity || e instanceof Barrier || e instanceof StaticEntity) {
					return true;
				} else {
					if(e != this) {
						if((this instanceof PlayerTankEntity) && (e instanceof EnemyTankEntity) && !e.isDestroyed) {
							return true;
						} else if((this instanceof EnemyTankEntity) && (e instanceof PlayerTankEntity) && !e.isDestroyed) {
							return true;
						}

						return false;
					}
				}
			}
		}

		return false;
	}
});
