var Button = Thunder.Component.extend({			
	init: function(initAsset) {
		this._super(initAsset.container);
			
		//Initialize properties
		this.name = initAsset.tag;
		this.width = initAsset.width;
		this.height = initAsset.height;
		this.image = initAsset.src;
		
		//Initialize assets
		this.assetManager.addAsset("gui","btn",null,"BTN",0,0);
				
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		
		//start
		this.createResponders();
		this.createCustomizers();	
		this.draw();
	},
	
	createResponders: function() {
		var t = this;
		
		this.addResponder("MOUSEUP", function(event) {
			t.broadcastEvent("BTN_CLICK");
		});
		
		this.addResponder("MOUSEENTER", function(event) {
			t.container.find("img").css("top",(t.height * -1) + "px");
		});
		
		this.addResponder("MOUSELEAVE", function(event) {
			t.container.find("img").css("top","0px");
		});
	},
	
	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("btn", function(asset) {		
			new Thunder.EventMap(asset.container,asset,this.eventQueue);
			var h = "<div style='position: absolute; cursor: pointer; width:" + this.width + "px; height:" + this.height + "px; overflow: hidden;" 
			h += "'><img style='position:absolute' src='" + this.image + "' width='" + this.width + "' height='" + (this.height * 2) + "'/></div>";
			asset.container.html(h);
		});
	},
	
	draw: function() {
		var assets = this.assetManager.getAssets("gui");
		this.layerManager.layOut(assets,"/GUI");
	},
	
	setImage: function(newSource) {
		this.image = newSource;
		this.draw();
	},
	
	getName: function() {
		return this.name;	
	}
});