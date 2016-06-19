var MessageWidget = Thunder.Component.extend({			
	init: function(initRootElement, initAchievement, initDebug) {
		this._super(initRootElement);
			
		//Initialize properties
		this.achievement = initAchievement;
		this.debug = initDebug;
		
		//Initialize assets		
		this.assetManager.addAsset("gui","img","image/bg_message.png","BG",0,0,320,140);
		this.assetManager.addAsset("gui","img","image/fb/badge/" + gAchievements[this.achievement].key + ".png","ICON",20,20,50,50);
		this.assetManager.addAsset("gui","html",null,"DOC",80,20,190,90);
		this.assetManager.addAsset("gui","btn","image/btn/x.jpg","BTNX",280,20,20,20);
		//this.assetManager.addAsset("gui","btn","image/btn/share.jpg","BTNSHARE",230,100,70,20);
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
				
		//start
		this.createResponders();
		this.createCustomizers();	
		this.draw();
	},
	
	createResponders: function() {
		var t = this;
		
		this.addResponder("BTN_CLICK", function(event) {					
			switch(event.owner.getName()) {
				case "BTNX":	
					App.track("achievement","close");
					break;
			}
			
			t.broadcastEvent("SHOW_NEXT_ACHIEVEMENT");
		});
	},
	
	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("img", function(asset) {					
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' id='" + asset.tag + "'/>");
		});
	
		this.addCustomizer("btn", function(asset) {
			asset.param = new Button(asset);
			asset.param.addListener(t.eventQueue);
		});

		this.addCustomizer("html", function(asset) {
			var h = "<div style='position:absolute;width:100%;height:100%;'>";
			h += "<div class='Handel_Gothic'><p>Achievement Unlocked:<br/>" + gAchievements[t.achievement].description + "</p></div></div>";
			asset.container.html(h);
			Cufon.refresh();
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
	}
});