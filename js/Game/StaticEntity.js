var StaticEntity = Entity.extend({			
	init: function(initRootElement, initNode, initNodeMap, initSource, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement, initNode, initNodeMap, initWidth, initHeight, initParam, initDebug);
			
		//Initialize properties
		this.source = initSource;
		
		//Initialize assets
		this.assetManager.addAsset("gui","img",this.source,"IMAGE",0,0,this.width,this.height);
		
		//Initialize layers
		this.layerManager.addLayer("/IMAGE");
		
		//Start
		this.draw();
		this.healthStatusBar.setRange(0,initParam.maxHealth);
	},
	
	draw: function() {
		this._super();
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/IMAGE");
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
		if(this.isDestroyed) {
			//Turn off selection
			if(this.selected) {
				this.toggleSelection();	
			}
			
			//Remove from node map
			this.updateNodeMap(0);
			
			//Draw destroyed state
			this.source = this.source.replace(/-(.+).png/,"-Destroyed.png");
			this.assetManager.getAsset("IMAGE").src = this.source;
			this.draw();
		} 
	},
	
	toggleSelection: function() {
		this._super();		
		this.healthStatusBar.setVisible(this.selected);
	}
});