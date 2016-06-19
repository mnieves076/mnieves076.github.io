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
		this.layerManager.defineSet("GUI");
				
		//start
		this.draw();
	},
	
	handleEvents: function(events) {
		for(var i = 0; i < events.length; i++) {
			if(this.debug) this.trace("SCROLLWIDGET: " + events[i].name);
			
			switch(events[i].name) {
				case "SCROLL_UPDATE":
					var y = events[i].owner.getValue() * -1;
					var asset = this.assetManager.getAsset("doc");
					
					if(asset != null) {
						asset.getContainer().find(".loader").css("top",y);
					}
					break;
				case "UPDATE":
					this.update();
					break;
			}
		}
	},
	
	handleCustomization: function(assetList) {
		var t = this;
		
		for(var i = 0, ii = assetList.length; i < ii; i++) {
			var asset = assetList[i];	
		
			switch (asset.type) {	
				case "html":
					asset.container.html("<div class='loader' style='position:absolute;width: " + (this.width - 16) + "px'></div>");
					asset.container.find(".loader").load(asset.src + "?" + (new Date()).getTime(), function() { Cufon.now(); Cufon.refresh(); t.refresh() });
					asset.setMask(0,asset.width,asset.height,0);
					break;
				case "vScrollbar":
					asset.setVisible(false);
					this.vScrollObj = new Thunder.Scrollbar(asset.container,asset.tag,this.getScrollbarAssetManager(),asset.width,asset.height);
					this.vScrollObj.setIncrement(10);
					this.vScrollObj.addListener(this.eventQueue);
					break;
			}
		}
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"GUI",0);
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