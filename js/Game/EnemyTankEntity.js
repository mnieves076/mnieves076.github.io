var EnemyTankEntity = TankEntity.extend({
	init: function(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug);

		//Initialize properties
		this.selectionColor = "#FF0000";

		//Initialize assets
		this.assetManager.addAsset("gui","img","image/EnemyTankStrip.png","STRIP",0,0,480,60);

		//Set the selection color
		this.assetManager.getAsset("SELECTION").param ={
			color: this.selectionColor,
			style: "solid"
		}

		//Initialize layers
		this.layerManager.addLayer("/UNIT");

		//Start
		this.draw();
		this.healthStatusBar.setRange(0,60);
	},

	attackEntity: function(e) {
		if(!(e instanceof EnemyTankEntity)) {
			this._super(e);

			if(this.targetEntity != null) {
				if(this.targetEntity.isDestroyed) {
					this.stopAttack();
				}
			} else {
				this.broadcastUniqueEvent("ASSIGN_TARGETS",null,100);
			}
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

		if(this.isDestroyed && !App.game.muteSound) {
			this.broadcastUniqueEvent("PLAY_ENEMY_DESTROYED",null,100);
		}
	},

	stopAttack: function() {
		this._super();
		this.broadcastUniqueEvent("ASSIGN_TARGETS",null,100);
	}
});
