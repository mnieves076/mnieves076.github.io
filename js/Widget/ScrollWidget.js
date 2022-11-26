var ScrollWidget = Thunder.Component.extend({			
	init: function(initRootElement, initSource, initWidth, initHeight, initDebug) {
		this._super(initRootElement);
			
		//Initialize properties
		this.debug = initDebug;
		this.vScrollObj = null;
		this.width = initWidth;
		this.height = initHeight;
		
		//Initialize assets		
		this.assetManager.addAsset("gui","html",initSource,"doc",0,0,this.width,this.height);
		this.assetManager.addAsset("gui","vScrollbar",null,"scroll",this.width - 8,20,8,this.height - 20);
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
				
		//start
		this.createResponders();
		this.createCustomizers();
		this.draw();
	},
	
	createResponders: function(events) {
		var t = this;
		
		this.addResponder("SCROLL_UPDATE", function(event) {
			var y = event.owner.getValue() * -1;
			var asset = this.assetManager.getAsset("doc");
			
			if(asset != null) {
				asset.getContainer().querySelector(".loader").style.top = y;
			}
		});
		
		this.addResponder("UPDATE", function(event) {
			t.update();
		});
	},
	
	createCustomizers: function(assetList) {
		var t = this;
		
		this.addCustomizer("html", function(asset) {
			asset.container.innerHTML = "<div class='loader' style='position:absolute;width: " + (t.width - 16) + "px'></div>";
			asset.container.find(".loader").load(asset.src + "?" + (new Date()).getTime(), function() { Cufon.now(); Cufon.refresh(); t.refresh() });
			asset.setMask(0,asset.width,asset.height,0);
		});
		
		this.addCustomizer("vScrollbar", function(asset) {
			asset.setVisible(false);
			t.vScrollObj = new Thunder.Scrollbar(asset.container,asset.tag,t.getScrollbarAssetManager(),asset.width,asset.height);
			t.vScrollObj.setIncrement(10);
			t.vScrollObj.addListener(t.eventQueue);
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
	},
	
	getScrollbarAssetManager: function() {
		var am = new Thunder.AssetManager();				
		am.addAsset("gui","btn","image/scrollbar/scroll_rect.gif","RECT");
		am.addAsset("gui","btn","image/scrollbar/scroll_tab.gif","TAB",0,0,8,32);
		am.addAsset("gui","btn","image/scrollbar/scroll_up.gif","UP",0,0,8,16);
		am.addAsset("gui","btn","image/scrollbar/scroll_down.gif","DOWN",0,0,8,16);			
		return am;
	},
	
	refresh: function() {
		if(this.vScrollObj != null) {
			this.vScrollObj.setValue(0);
		}
		
		this.update();
	},
	
	update: function() {
		var asset = this.assetManager.getAsset("doc");
		
		if(asset != null) {
			var content = asset.container.find(".loader");		
			var vScrollbarAsset = this.assetManager.getAsset("scroll");
			
			if(content.height() == 0) {
				//content has not loaded
				this.eventQueue.addEvent("UPDATE",250);
			} else {			
				if(content.height() > (this.height)) {			
					this.vScrollObj.setMax(content.height() - (this.height));
					vScrollbarAsset.setVisible(true);
				} else {
					vScrollbarAsset.setVisible(false);
				}
			}
		}
	}
});