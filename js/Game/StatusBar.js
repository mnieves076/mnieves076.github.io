var StatusBar = Thunder.Component.extend({			
	init: function(initRootElement, initWidth, initHeight, initForeColor, initBackColor, initDebug) {
		this._super(initRootElement);
		
		//Initialize properties
		this.debug = initDebug;
		this.width = initWidth;
		this.height = initHeight;
		this.foreColor = initForeColor;
		this.backColor = initBackColor;
		this.min = 0;
		this.max = 100;
		this.value = this.max;
		this.replenishValue = 0;
		this.replenishInterval = 0;
		
		//Initialize assets
		this.assetManager.addAsset("gui","bar",null,"BACKGROUND",0,0,this.width,this.height,this.backColor);	
		this.assetManager.addAsset("gui","bar",null,"FOREGROUND",0,0,this.width,this.height,this.foreColor);
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		
		//Start
		this.createResponders();
		this.createCustomizers();	
		this.setVisible(false);
	},
	
	createResponders: function() {
		var t = this;
		
		this.addResponder("REPLENISH", function(event) {
			if(t.value < t.max) {
				t.setValue(t.value + t.replenishValue);
			}
		});
	},
	
	createCustomizers: function() {
		var t = this;

		this.addCustomizer("bar", function(asset) {
			asset.container.innerHTML += "<div class='bar' style='position:absolute; background-color: #" + asset.param + "; width: " + asset.width + "px; height: " + asset.height + "px;'/>";
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
	},
	
	setRange: function(newMin, newMax) {
		if(newMin >= newMax) {
			console.error("StatusBar.setRange called with invalid values.");	
			return;
		}
		
		this.min = newMin;
		this.max = newMax;
		
		if(this.value < newMin) {
			this.setValue(this.min);
			return;
		}
			
		if(this.value > newMax) {
			this.setValue(newMax);
			return;
		}		
		
		this.update();		
	},
	
	setValue: function(newValue) {	
		if(newValue < this.min) { 
			newValue = this.min;
		}	
		
		if(newValue > this.max) {
			newValue = this.max;
		}
		
		this.value = newValue;
		this.update();
		
		if(this.value < this.max && this.replenishValue > 0 && this.replenishInterval > 0) {
			//start to replenish
			this.eventQueue.addUniqueEvent("REPLENISH",this.replenishInterval);
		} else if(this.value == this.max && this.replenishValue > 0 && this.replenishInterval > 0) {
			this.broadcastEvent("REPLENISH_COMPLETE");		
		}
	},
	
	getValue: function() {
		return this.value;	
	},
	
	update: function() {	
		var newWidth = this.width * (this.value / this.max);
		let n = this.assetManager.getAsset("FOREGROUND").container.querySelector(".bar");
		
		if(n) {
			n.style.width = newWidth + "px";
		}
	},
	
	setReplenishRate: function(newReplenishValue, newReplenishInterval) {
		this.replenishValue = newReplenishValue;
		this.replenishInterval = newReplenishInterval;
	}
});