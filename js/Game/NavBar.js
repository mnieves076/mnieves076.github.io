var NavBar = Thunder.Component.extend({			
	init: function(initRootElement) {
		this._super(initRootElement);
		
		//Initialize properties
		this.buttonsWidth = 0;
		
		//Initialize assets
		this.assetManager.addAsset("gui","img","image/inGameLogo.png","LOGO",0,0,144,72);
		
		if(App.game.isMultiplayer) {
			this.assetManager.addAsset("button","btn","image/btn/chat.jpg","BTNCHAT",0,0,70,20);			
		}
		
		if(App.game.getMute()) {
			this.assetManager.addAsset("button","btn","image/btn/soundOnSmall.jpg","BTNSOUND",0,0,100,20);
		} else {
			this.assetManager.addAsset("button","btn","image/btn/soundOffSmall.jpg","BTNSOUND",0,0,100,20);
		}
		
		this.assetManager.addAsset("button","btn","image/btn/quit.jpg","BTNQUIT",0,0,70,20);
				
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		this.layerManager.addLayer("/BUTTON");
		this.layerManager.addLayer("/DIALOG");
		
		//Listen for window resize
		var t = this;
		$(window).resize(function() { t.handleResize() });
		
		//start
		this.createResponders();
		this.createCustomizers();	
		this.draw();
	},
	
	createResponders: function() {
		var t = this;
		
		this.addResponder("BTN_CLICK", function(event) {
			switch(event.owner.getName()) {
				case "BTNSOUND":
					if(App.game.getMute()) {
						App.track("game","unmute_sound");
						event.owner.setImage("image/btn/soundOffSmall.jpg");
						App.game.setMute(false);
					} else {
						App.track("game","mute_sound");
						event.owner.setImage("image/btn/soundOnSmall.jpg");
						App.game.setMute(true);
					}
					break;
				/* case "BTNSHARE":
					App.track("game","share");
					if(gFBUserID != "") {
						FB.ui({
							method: 'feed',
							name: 'Armored Titans: Proving Grounds',
							link: 'http://apps.facebook.com/armored-titans-pg/',
							picture: "http://www.pindax.com/games/atpg/image/start_pic.jpg",
							caption: "A fast paced real-time tactical war game.",
							description:  "Guide your tanks through multiple levels of difficulty or take on your friends in head to head combat.",
							message: ""
						});
					}
					break; */
				case "BTNQUIT":	
					App.track("game","quit");
					App.drawDialog("quit");
					break;
				case "BTNCHAT":
					App.track("game","chat");
					App.chatDialog.show();
					break;
			}
		});
	},
	
	createCustomizers: function() {
		var t = this;
				
		this.addCustomizer("img", function(asset) {	
			asset.container.html("<img width='100%' height='100%' src='" + asset.src + "' id='" + asset.tag + "'/>");
		});
		
		this.addCustomizer("btn", function(asset) {	
			asset.param = new Button(asset);
			asset.param.addListener(t.eventQueue);
		});	
	},
	
	draw: function() {
		var buttonAssets = this.assetManager.stack(this.assetManager.getAssets("button"),Thunder.HORIZONTAL,0,0,5);
		this.buttonsWidth = (buttonAssets.length - 1) * 5;
		
		for(var i = 0; i < buttonAssets.length; i++) {
			this.buttonsWidth += buttonAssets[i].width;
		}
		
		this.handleResize();
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
		this.layerManager.layOut(buttonAssets,"BUTTON",0);
		this.layerManager.layOut(this.assetManager.getAssets("dialog"),"/DIALOG");
	},
	
	handleResize: function() {		
		var w = $(window).width() - gAdWidth;;
		var h = $(window).height();
		
		if(w > App.game.levelManager.getMapPixelWidth()) {
			w = App.game.levelManager.getMapPixelWidth();
		}
		
		this.layerManager.getLayerObject("/GUI").setPosition(10,h - 82);	
		this.layerManager.getLayerObject("/BUTTON").setPosition(w - this.buttonsWidth - 10,h - 30);	
	}
});