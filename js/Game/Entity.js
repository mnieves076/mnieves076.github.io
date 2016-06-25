var Entity = Thunder.Component.extend({
	init: function(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement);

		//Initialize properties
		this.debug = initDebug;
		this.node = initNode; //Thunder.Point
		this.nodeMap = initNodeMap; //NodeMap
		this.width = initWidth;
		this.height = initHeight;
		this.selected = false; //Boolean
		this.selectionColor = "#0066CC";
		this.healthStatusBar;
		this.blockOffsetX = initParam.blockOffsetX;
		this.blockOffsetY = initParam.blockOffsetY;
		this.id = initParam.id;
		this.isDestroyed = false;

		//Initialize assets
		this.assetManager.addAsset("entity","box",null,"SELECTION",0,0,this.width,this.height,{
			color: this.selectionColor,
			style: "solid"
		});
		
		this.assetManager.addAsset("status","health_status",null,"HEALTH_STATUS",2,2,this.width - 4,4);

		//Initialize layers
		this.layerManager.addLayer("/ENTITY");
		this.layerManager.addLayer("/STATUS");

		//Update node map
		this.updateNodeMap(1);
		
		this.createCustomizers();	
	},

	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("img", function(asset) {
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' id='" + asset.tag + "' style='position: absolute'/>");
		});
		
		this.addCustomizer("box", function(asset) {
			var h = "<div style='position: absolute; border: 2px " + asset.param.style;
			h += " " + asset.param.color + "; width: " + (asset.width - 4) + "px; height: ";
			h += (asset.height - 4) + "px;'/>"
			asset.container.html(h);
		});
		
		this.addCustomizer("health_status", function(asset) {
			t.healthStatusBar = new StatusBar(asset.container,asset.width,asset.height,"00CC00","CC0000",t.debug);
			t.healthStatusBar.draw();
		});
	},

	draw: function() {
		if(!this.isDestroyed) {
			this.layerManager.addToLayOut([this.assetManager.getAsset("HEALTH_STATUS")],"/STATUS",0);
		}
	},

	toggleSelection: function() {
		if(!this.isDestroyed || (this.isDestroyed && this.selected)) {
			this.selected = !this.selected;
			//this.healthStatusBar.setVisible(this.selected);

			if(this.selected) {
				this.showSelection();
				this.trace("health = " + this.healthStatusBar.getValue());
			} else {
				this.hideSelection();
			}
		}
	},

	showSelection: function() {
		this.layerManager.layOut(this.assetManager.getAssets("entity"),"/ENTITY");
	},

	hideSelection: function() {
		this.layerManager.clearSet("/ENTITY");
	},

	registerDamage: function(e) {
		this.registerDamageByValue(Math.floor(Math.random() * 20) + 13,true);
	},

	registerDamageByValue: function(damage, emit) {
		if(App.game.isMultiplayer && emit) {
			App.multiplayerManager.send({"command":"ENTITY_DAMAGE","node":this.node,"damage":damage});
		}

		if(damage > this.healthStatusBar.getValue()) {
			this.healthStatusBar.setValue(0);
			this.isDestroyed = true;
		} else {
			this.healthStatusBar.setValue(this.healthStatusBar.getValue() - damage);
		}
	},

	updateNodeMap: function(newState) {
		this.nodeMap.set(this.node, this.width - this.blockOffsetX, this.height - this.blockOffsetY, newState, this);
	},

	moveNodeMap: function(newNode) {
		this.nodeMap.move(this.node, newNode, this.width - this.blockOffsetX, this.height - this.blockOffsetY, this);
	}
});
