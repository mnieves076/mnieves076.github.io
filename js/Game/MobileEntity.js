var MobileEntity = Entity.extend({
	init: function(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug);

		//Initialize properties
		this.rotation = initParam.rotation; // 0 thru 7
		this.maxSpeed = 36; //pixels per second
		this.nodeGoal = initNode; //Thunder.Point
		this.angleGoal = null;
		this.route = []; //Array of Thunder.Point
		this.moving = false; //Boolean
		this.isMoving = false; //Boolean
		//this.sendSyncEvent = false;
		
		this.createResponders();
	},

	createResponders: function() {
		var t = this;
		
		this.addResponder("MOVE", function(event) {
			t.move();
		});
			
		this.addResponder("RECALCULATE_ROUTE", function(event) {
			if(t.selected) t.trace("RECALCULATE_ROUTE");
			t.moveTo(t.nodeGoal, t.angleGoal);
		});
	},

	moveTo: function(newNodeGoal, newAngleGoal, distanceLimit) {
		this.moving = false;

		if(!this.isDestroyed) {
			if(this.nodeMap.canEnter(newNodeGoal, this, true) || distanceLimit != null) {
				if(this.selected) this.trace("moveTo " + newNodeGoal.toString()); /////

				this.nodeGoal = newNodeGoal;
				//this.sendSyncEvent = true;

				if(newAngleGoal == null) {
					newAngleGoal = this.node.getAngle(this.nodeGoal);
				}

				this.angleGoal = newAngleGoal;

				//determine route
				this.route = [];
				var wayPoint = new Thunder.Point(this.node.x,this.node.y);

				while(!wayPoint.equals(this.nodeGoal)) {
					var wayPointCandidates = this.getWayPointCandidates(wayPoint);
					var blocked = true;

					while(blocked && wayPointCandidates.length > 0) {
						var wpc = wayPointCandidates.shift();

						if(this.nodeMap.canEnter(wpc, this, true) && !this.findInRoute(wpc)) {
							wayPoint = wpc.getCopy();
							this.route.push(wayPoint);
							blocked = false;
							break;
						}
					}

					if(blocked) {
						if(this.selected) this.trace(">> movement blocked"); /////
						this.eventQueue.addUniqueEvent("RECALCULATE_ROUTE",2000);
						break;
					}

					//use distance limit if provided
					if(distanceLimit != null) {
						if((this.route.length * this.nodeMap.size) >= distanceLimit) {
							break;
						}
					}
				}

				if(!this.moving) {
					this.checkRoute();
					this.eventQueue.addUniqueEvent("MOVE",0);
				}
			} else {
				//if the node goal is unreachable, determine if we should wait or give up
				var e = this.nodeMap.getNodeEntity(this.nodeGoal);

				if(e instanceof MobileEntity && e.isMoving) {
					this.eventQueue.addUniqueEvent("MOVE",500);
					if(this.selected) this.trace(">> waiting to enter " + this.nodeGoal.toString());/////
					return;
				}

				if(this.selected) this.trace(">> can not reach " + this.nodeGoal.toString());/////	
				
				//set the nodeGoal to the next closest route location
				if(this.route.length > 0) {
					this.nodeGoal = this.route[this.route.length - 1];
					if(this.selected) this.trace(">> changed goal to " + this.nodeGoal.toString());/////						
				} 
				
				this.stop();
			}

			//this.sendSyncEvent = true;
		}
	},

	move: function() {
		this.isMoving = true;
		this.moving = false;

		if(!this.node.equals(this.nodeGoal) && this.route.length > 0 && !this.isDestroyed) {
			//determine if unit is facing in correct direction, rotate toward direction
			var a = this.node.getAngle(this.route[0]);
			var needsMoreRotation = this.rotateTo(a);

			if(needsMoreRotation) {
				if(this.selected) this.trace("rotating");
				this.moving = true;
				this.eventQueue.addUniqueEvent("MOVE",250,null);
			} else {
				var nextRouteNode = this.route.shift();

				if(this.nodeMap.canEnter(nextRouteNode, this)) {
					if(this.selected) this.trace("moving to next route node");
					this.moving = true;
					var newPosition = new Thunder.Point((nextRouteNode.x * 10) - this.width / 2, (nextRouteNode.y * 10) - this.height / 2);
					var d = this.getPosition().getDistance(newPosition);
					var t = (d / this.maxSpeed) * 1000;
					var m = this;
					this.moveNodeMap(nextRouteNode);
					this.node = nextRouteNode;
					
					this.container.stop(1,1);
					this.container.animate({top: newPosition.y, left: newPosition.x},t,'linear',function() {
						m.move();
					});
				} else {
					//If unit is blocked, then recalculate route
					this.eventQueue.removeEvent("MOVE");
					
					if(this.nodeMap.canEnter(this.nodeGoal, this)) {
						if(this.selected) this.trace("recalculate route to " + this.nodeGoal.toString());
					} else {
						this.stop();
						if(this.selected) this.trace("blocked, ending movement, recalculating route");
					}
					
					this.eventQueue.addUniqueEvent("RECALCULATE_ROUTE",250);
				}
			}
		} else {
			//arrived at desitination, rotate to goal rotation
			var needsMoreRotation = this.rotateTo(this.angleGoal);

			if(needsMoreRotation) {
				if(this.selected) this.trace("at destination: rotating");
				this.moving = true;
				this.eventQueue.addUniqueEvent("MOVE",250,null);
			} else {
				this.stop();
				if(this.selected) this.trace("at destination, ending movement");				
			}
		}
	},

	positionAt: function(x,y) {
		if(!this.isDestroyed) {
			this.eventQueue.removeEvent("RECALCULATE_ROUTE");
			this.eventQueue.removeEvent("MOVE");

			if(this.moving) {
				this.container.stop(1,1);
				//this.moving = false;
			}

			var newPosition = new Thunder.Point((x * 10) - this.width / 2, (y * 10) - this.height / 2);
			//newPosition = this.nodeMap.mapPointToNode(newPosition);
			this.container.css({top: newPosition.y, left: newPosition.x});
			this.updateNodeMap(0);
			this.node = new Thunder.Point(x,y);
			this.updateNodeMap(1);

			this.moveTo(this.nodeGoal,this.angleGoal);
		}
	},

	stop: function() {
		this.isMoving = false;
		
		if(this.moving) {
			this.eventQueue.removeEvent("RECALCULATE_ROUTE");		
			this.nodeGoal = this.node.getCopy();
			this.angleGoal = null;
			this.route = [];	
		}	
	},

	findInRoute: function(wayPoint) {
		for(var i = 0; i < this.route.length; i++) {
			if(this.route[i].equals(wayPoint)) {
				return true;
			}
		}

		return false;
	},

	checkRoute: function() {
		if(this.route.length > 2) {
			for(var i = 0, ii = this.route.length; i < ii; i++) {
				for(var e = (i + 2), ee = this.route.length; e < ee; e++) {
					if((e - i) > 1) {
						if(this.route[i].getDistance(this.route[e]) < 2) {
							this.route.splice(i + 1,((e - 1) - i));
							this.checkRoute();
							return;
						}
					}
				}
			}
		}
	},

	getWayPointCandidates: function(wayPoint) {
		var candidates = [];

		for(var c = -1; c <= 1; c++) {
			for(var r = -1; r <= 1; r++) {
				var wpc = new Thunder.Point(wayPoint.x + c, wayPoint.y + r);

				if(!wpc.equals(wayPoint)) {
					candidates.push({POINT: wpc,DISTANCE: wpc.getDistance(this.nodeGoal)});
				}
			}
		}

		candidates.sort(function(a,b) {
			return a.DISTANCE - b.DISTANCE; //ascending
		});

		var finalCandidates = [];

		for(var i = 0; i < candidates.length; i++) {
			finalCandidates.push(candidates[i].POINT);
		}

		return finalCandidates;
	},

	rotate: function(increment) {
		this.rotation += increment;

		if(this.rotation < 0) {
			this.rotation = 7;
		}

		if(this.rotation > 7) {
			this.rotation = 0;
		}

		this.assetManager.getAsset("STRIP").setPosition((this.width * this.rotation) * -1,0);
		//this.sendSyncEvent = true;
		//if(this.debug) { console.log(">> rotate: " + increment + ", rotation is now " + this.rotation); }
	},

	rotateTo: function(a) {
		if(a == null) {
			return false;
		}

		var goalRotation = this.convertAngleToRotation(a);

		if(this.moving || this.rotation == goalRotation) {
			return !(this.rotation == goalRotation);
		} else {
			var r = this.rotation;

			if(goalRotation > r) {
				if((goalRotation - r) <= 4) {
					this.rotate(1);
				} else {
					this.rotate(-1);
				}
			} else if(goalRotation < r) {
				if((r - goalRotation) <= 4) {
					this.rotate(-1);
				} else {
					this.rotate(1);
				}
			}
		}

		return !(this.rotation == goalRotation);
	},

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

	convertRotationToAngle: function(r) {
		return r * 45;
	}
});
