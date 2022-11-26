var NodeMap = BaseObject.extend({
	init: function(initSize, initWidth, initHeight) {
		//Initialize properties
		this.size = initSize;
		this.width = initWidth;
		this.height = initHeight;

		//Initialize map nodes
		this.clear();
	},

	clear: function() {
		this.nodes = [];

		for(var c = 0; c <= this.width / this.size; c++) {
			var a = [];

			for(var r = 0; r <= this.height / this.size; r++) {
				a.push({STATE: 0, ENTITY: null});
			}

			this.nodes.push(a);
		}
	},

	set: function(node, w, h, newState, entity, allowLOS) {
		/* w = w / this.size;
		h = h / this.size;*/
		var w = (entity.width - entity.blockOffsetX) / this.size;
		var h = (entity.height - entity.blockOffsetY) / this.size;
		
		/* var xStartRange = node.x - w / 2;
		var xEndRange = node.x + w / 2;
		var yStartRange = node.y - h / 2;
		var yEndRange = node.y + h / 2;  */
		
	
		var xStartRange = node.x - Math.floor(w / 2);
		var xEndRange = node.x + Math.floor(w / 2);
		var yStartRange = node.y - Math.floor(h / 2);
		var yEndRange = node.y + Math.floor(h / 2);

		if(xStartRange < 0) {
			xStartRange = 0;
		}

		if(yStartRange < 0) {
			yStartRange = 0;
		}

		if(xEndRange > (this.width / this.size)) {
			xEndRange = this.width / this.size;
		}

		if(yEndRange > (this.height / this.size)) {
			yEndRange = this.height / this.size;
		}

		var k = {STATE: newState, ENTITY: (newState) ? entity : null, ALLOW_LOS: allowLOS};

		for(var c = xStartRange; c <= xEndRange; c++) {
			for(var r = yStartRange; r <= yEndRange; r++) {
				var n = this.nodes[c][r];

				if(n.ENTITY == entity || n.ENTITY == null) {
					this.nodes[c][r] = k;
				}
			}
		}
	},

	move: function(oldNode, newNode, w, h, entity) {
		/* w = w / this.size;
		h = h / this.size;*/
		var w = (entity.width - entity.blockOffsetX) / this.size;
		var h = (entity.height - entity.blockOffsetY) / this.size;
		
		/* var xStartRange = oldNode.x - w / 2;
		var xEndRange = oldNode.x + w / 2;
		var yStartRange = oldNode.y - h / 2;
		var yEndRange = oldNode.y + h / 2;  */
		var xStartRange = oldNode.x - Math.floor(w / 2);
		var xEndRange = oldNode.x + Math.floor(w / 2);
		var yStartRange = oldNode.y - Math.floor(h / 2);
		var yEndRange = oldNode.y + Math.floor(h / 2); 
		
		var min = 0;
		var maxX = this.width / this.size;
		var maxY = this.height / this.size;

		if(xStartRange < min) {
			xStartRange = min;
		}

		if(yStartRange < min) {
			yStartRange = min;
		}

		if(xEndRange > maxX) {
			xEndRange = maxX;
		}

		if(yEndRange > maxY) {
			yEndRange = maxY;
		}

		var k = {STATE: 1, ENTITY: entity, ALLOW_LOS: true};
		var n = {STATE: 0, ENTITY: null, ALLOW_LOS: true};
		var a = oldNode.getAngle(newNode);

		if(a == 360 || a == 45 || a == 315) { //N or NE or NW
			for(var c = xStartRange; c <= xEndRange; c++) {
				if(yStartRange > min) {
					this.nodes[c][yStartRange - 1] = k;
				}

				this.nodes[c][yEndRange] = n;
			}

			if(yStartRange > min) {
				yStartRange -= 1;
			}

			if(yEndRange > min) {
				yEndRange -= 1;
			}
		}

		if(a == 90 || a == 45 || a == 135) { //E or NE or SE
			for(var r = yStartRange; r <= yEndRange; r++) {
				this.nodes[xStartRange][r] = n;

				if(xEndRange < maxX) {
					this.nodes[xEndRange + 1][r] = k;
				}
			}

			if(xStartRange < maxX) {
				xStartRange += 1;
			}

			if(xEndRange < maxX) {
				xEndRange += 1;
			}
		}

		if(a == 180 || a == 135 || a == 225) { //S or SE or SW
			for(var c = xStartRange; c <= xEndRange; c++) {
				this.nodes[c][yStartRange] = n;

				if(yEndRange < maxY) {
					this.nodes[c][yEndRange + 1] = k;
				}
			}

			if(yStartRange < maxY) {
				yStartRange += 1;
			}

			if(yEndRange < maxY) {
				yEndRange += 1;
			}
		}

		if(a == 270 || a == 225 || a == 315) { //W or SW or NW
			for(var r = yStartRange; r <= yEndRange; r++) {
				if(xStartRange > min) {
					this.nodes[xStartRange - 1][r] = k;
				}
				
				this.nodes[xEndRange][r] = n;
			}
		}
	},

	canEnter: function(node, entity, ignoreMobileEntities) {
		if(node == null) {
			return false;
		}

		if(this.inBounds(node)) {
			var w = (entity.width - entity.blockOffsetX) / this.size;
			var h = (entity.height - entity.blockOffsetY) / this.size;
		
			var xStartRange = node.x - Math.floor(w / 2);
			var xEndRange = node.x + Math.floor(w / 2);
			var yStartRange = node.y - Math.floor(h / 2);
			var yEndRange = node.y + Math.floor(h / 2);

			if(xStartRange < 0) {
				xStartRange = 0;
			}

			if(yStartRange < 0) {
				yStartRange = 0;
			}

			if(xEndRange > (this.width / this.size)) {
				xEndRange = this.width / this.size;
			}

			if(yEndRange > (this.height / this.size)) {
				yEndRange = this.height / this.size;
			}

			for(var c = xStartRange; c <= xEndRange; c++) {
				for(var r = yStartRange; r <= yEndRange; r++) {
					var n = this.nodes[c][r];
					var ignoreEntity = (ignoreMobileEntities == true) && (n.ENTITY instanceof MobileEntity) && (n.ENTITY.moving);

					if(n.ENTITY != entity && n.ENTITY != null && !ignoreEntity) {
						return false;
					}
				}
			}

			return true;
		} else {
			return false;
		}
	},

	getNodeEntity: function(n) {
		if(this.inBounds(n)) {
			return this.nodes[n.x][n.y].ENTITY;
		} else {
			return null;
		}
	},

	inBounds: function(n) {
		return (n.x > 0 && n.y > 0 && n.x <= (this.width / this.size) && n.y <= (this.height / this.size));
	},

	mapPointToNode: function(p) {
		var x = Math.floor(p.x / this.size);
		var y = Math.floor(p.y / this.size);
		return new Thunder.Point(x,y);
	},

	mapPointToEmptyNode: function(p) {
		var x = Math.floor(p.x / this.size);
		var y = Math.floor(p.y / this.size);

		var nodes = [[x,y],[x + 1,y],[x,y + 1],[x + 1,y + 1],[x - 1,y + 1],[x - 1,y],[x - 1,y - 1],[x,y - 1],[x + 1,y - 1]];

		for(var i = 0; i < nodes.length; i++) {
			var p = new Thunder.Point(nodes[i][0],nodes[i][1]);

			if(this.getNodeEntity(p) == null) {
				return p;
			}
		}

		return null;
	},

	mapNodeToPoint: function(n) {
		var x = n.x * this.size;
		var y = n.y * this.size;
		return new Thunder.Point(x,y);
	},
	
	drawNodeMarkers: function() {
		var h = "";
		
		for(var c = 0; c <= this.width / this.size; c++) {
			for(var r = 0; r <= this.height / this.size; r++) {
				if(this.nodes[c][r].ENTITY != null) {
					h += "<img src='image/marker-blue.jpg' style='position: absolute; top: " + (r * this.size) + "px; left: " + (c * this.size) + "px'/>";
				}
			}
		}
		
		App.game.assetManager.getAsset("PATH_DISPLAY").container.innerHTML = h;
	},
	
	drawNodeMarker: function(c,r) {
		var h = "<img src='image/marker-blue.jpg' style='position: absolute; top: " + (r * this.size) + "px; left: " + (c * this.size) + "px'/>";		
		App.game.assetManager.getAsset("PATH_DISPLAY").container.innerHTML = h;
	}
});
