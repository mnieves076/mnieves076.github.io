var Indicator = Thunder.Component.extend({			
	init: function(initRootElement, initSrc, initWidth, initHeight, initDebug) {
		this._super(initRootElement);
		
		//Initialize properties
		this.debug = initDebug;
		this.width = initWidth;
		this.height = initHeight;
		this.source = initSrc;
		this.isShowing = false;
		
		//Initialize assets
		this.assetManager.addAsset("gui","img",this.source,"STRIP",0,0,480,60);	
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		
		//Start
		this.createCustomizers();	
		this.layerManager.setLayerMask("/GUI",0,this.width,this.height,0);
	},
	
	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("img", function(asset) {	
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' id='" + asset.tag + "' style='cursor: pointer'/>");
		});
			
	},
	
	show: function() {		
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
		this.isShowing = true;
	},
	
	hide: function() {
		this.layerManager.clearSet("/GUI");	
		this.isShowing = false;
	},
	
	setRotation: function(a) {		
		var goalRotation = 0;
		
		for(var i = 0; i <= 360; i += 22.5) {
			if(a <= i) {				
				goalRotation = Math.floor(i / 45);	
				break;
			}
		}
		
		if(goalRotation > 7) {
			goalRotation = 0;	
		}
		
		this.assetManager.getAsset("STRIP").setPosition((this.width * goalRotation) * -1,0);
	}
});