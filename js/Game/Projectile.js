var Projectile = Thunder.Component.extend({
	init: function(initAsset, initNode, initNodeMap, initWidth, initHeight, initDebug) {
		this._super(initAsset.container);

		//Initialize properties
		this.asset = initAsset;
		this.debug = initDebug;
		this.node = initNode; //Thunder.Point
		this.nodeMap = initNodeMap; //NodeMap
		this.maxSpeed = 40; //pixels per second
		this.maxRange = 440; //pixels
		this.width = initWidth;
		this.height = initHeight;
		this.source = this.asset.src;
		this.nodeGoal; //Thunder.Point
		this.route = []; //Array of Thunder.Point
		this.entityOwner;
		this.entityReceiver = null;

		//Initialize assets
		this.assetManager.addAsset("gui","img",this.asset.src,"PROJECTILE",0,0,this.width,this.height);

		//Initialize layers
		this.layerManager.addLayer("/GUI");
		
		this.createCustomizers();	
	},

	createCustomizers: function() {
		var t = this;

		this.addCustomizer("img", function(asset) {	
			asset.container.innerHTML = "<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' style='position: absolute'/>";
		});
	},

	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
	},

	setTarget: function(n, entityOwner) {
		this.entityReceiver = null;
		this.draw();
		this.nodeGoal = n;

		//determine route
		this.route = [];
		var wayPoint = this.node.getCopy();

		while(!wayPoint.equals(this.nodeGoal)) {
			if(wayPoint.x > this.nodeGoal.x) {
				wayPoint.x -= 1;
			}

			if(wayPoint.x < this.nodeGoal.x) {
				wayPoint.x += 1;
			}

			if(wayPoint.y > this.nodeGoal.y) {
				wayPoint.y -= 1;
			}

			if(wayPoint.y < this.nodeGoal.y) {
				wayPoint.y += 1;
			}

			this.route.push(wayPoint.getCopy());

			//determine if the waypoint is occupied
			var e = this.nodeMap.getNodeEntity(wayPoint);

			if(e != null && !(e instanceof Barrier)) {
				//projectile hit
				this.entityOwner = entityOwner;
				this.entityReceiver = e;
				this.nodeGoal = e.node.getCopy();
				break;
			}
		}

		this.move();
	},

	move: function() {
		if(this.route.length > 0) {
			this.setPosition(this.route[0].x * this.nodeMap.size,this.route[0].y * this.nodeMap.size);
			var d = this.node.getDistance(this.nodeGoal);
			var t = (d / this.maxSpeed) * 1000;
			var x = this.nodeGoal.x * this.nodeMap.size;
			var y = this.nodeGoal.y * this.nodeMap.size;
			Velocity(this.container,{top: y, left: x}, {duration: t, easing: 'linear', complete: () => { this.movementComplete();}});
		}
	},

	movementComplete: function() {
		this.layerManager.clearSet("/GUI");
		this.broadcastEvent("PROJECTILE_MOVEMENT_COMPLETE");

		if(this.entityReceiver != null) {
			this.entityReceiver.registerDamage(this.entityOwner);
		}
	},

	getNodeGoal: function() {
		return this.nodeGoal;
	}
});
