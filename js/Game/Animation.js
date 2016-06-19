var Animation = Thunder.Component.extend({			
	init: function(initAsset, initWidth, initHeight, initFrameCount, initSpeed, initStripWidth, initDebug) {
		this._super(initAsset.container);
		
		//Initialize properties
		this.asset = initAsset;
		this.debug = initDebug;
		this.width = initWidth;
		this.height = initHeight;
		this.source = this.asset.src;
		this.frame = 0;
		this.frameCount = initFrameCount;
		this.frameOffset = initStripWidth / this.frameCount;
		this.frameSpeed = initSpeed / this.frameCount; //milliseconds per frame
				
		//Initialize assets
		this.assetManager.addAsset("gui","img",this.asset.src,"STRIP",0,0,initStripWidth,this.height);	
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		this.layerManager.setLayerMask("/GUI",0,this.width,this.height,0);
		
		this.createResponders();
		this.createCustomizers();	
	},
	
	createResponders: function() {	
		var t = this;
		
		this.addResponder("FRAME", function(event) {
			if(t.frame < (t.frameCount - 1)) {
				var newX = (t.frameOffset * (++t.frame)) * -1;
				t.assetManager.getAsset("STRIP").setPosition(newX,0);
				t.eventQueue.addEvent("FRAME",t.frameSpeed);
			} else {
				t.frame = 0;
				t.layerManager.clearSet("/GUI");
				t.broadcastEvent("ANIMATION_COMPLETE");
			}
		});
	},
	
	createCustomizers: function() {		
		this.addCustomizer("img", function(asset) {	
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' style='position: absolute'/>");
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
		this.eventQueue.addEvent("FRAME",this.frameSpeed);
	}
});