var Dialog = Thunder.Component.extend({			
	init: function(initAsset) {
		this._super(initAsset.container);
			
		//Initialize properties
		this.name = initAsset.tag;
		this.type = null;
		
		//Initialize assets
		this.assetManager.addAsset("shade","img","image/dialog/shade.png","SHADE",0,0,72,72);
		this.assetManager.addAsset("gui","box",null,"DIALOG_BG",0,0,this.width - 10,this.height - 10);
				
		this.assetManager.addAsset("level","html",null,"LEVEL_HTML",20,20,280,200);
		this.assetManager.addAsset("level","btn","image/btn/start.jpg","BTNSTARTLEVEL",130,285,100,20);
		this.assetManager.addAsset("level","btn","image/btn/menu.jpg","BTNMAINMENU",235,285,70,20);
		
		this.assetManager.addAsset("win","html",null,"WIN_HTML",20,20,280,200);
		this.assetManager.addAsset("win","btn","image/btn/nextLevel.jpg","BTNPLAYNEXTLEVEL",35,285,90,20);
		this.assetManager.addAsset("win","btn","image/btn/replayLevel.jpg","BTNREPLAYLEVEL",130,285,100,20);
		this.assetManager.addAsset("win","btn","image/btn/menu.jpg","BTNMAINMENU",235,285,70,20);
		
		this.assetManager.addAsset("lose","html",null,"LOSE_HTML",20,20,280,200);
		this.assetManager.addAsset("lose","btn","image/btn/replayLevel.jpg","BTNREPLAYLEVEL",130,285,100,20);
		this.assetManager.addAsset("lose","btn","image/btn/menu.jpg","BTNMAINMENU",235,285,70,20);
		
		this.assetManager.addAsset("quit","html",null,"QUIT_HTML",20,20,280,200);
		this.assetManager.addAsset("quit","btn","image/btn/yes.jpg","BTNQUIT_YES",160,285,70,20);
		this.assetManager.addAsset("quit","btn","image/btn/no.jpg","BTNQUIT_NO",235,285,70,20);
		
		this.assetManager.addAsset("choose","html",null,"CHOOSE_HTML",20,20,280,200);
		this.assetManager.addAsset("choose","btn","image/btn/cancel.jpg","BTNCANCEL",205,285,100,20);
		
		this.assetManager.addAsset("like","html",null,"LIKE_HTML",20,20,460,430);
		this.assetManager.addAsset("like","btn","image/btn/close.jpg","BTNCLOSE",410,460,70,20);
		
		this.assetManager.addAsset("video","html",null,"HELP_HTML",20,20,280,40);
		this.assetManager.addAsset("video","html",null,"VIDEO_HTML",20,70,460,260);
		this.assetManager.addAsset("video","btn","image/btn/more.jpg","BTNMORE",340,340,70,20);
		this.assetManager.addAsset("video","btn","image/btn/close.jpg","BTNCLOSE",415,340,70,20);
		
		this.assetManager.addAsset("help","html",null,"HELP_HTML",20,20,460,40);
		this.assetManager.addAsset("help","scroll_widget","how-to-play.html","HOW_TO_PLAY_HTML",20,70,460,260);
		this.assetManager.addAsset("help","btn","image/btn/video.jpg","BTNVIDEO",340,340,70,20);
		this.assetManager.addAsset("help","btn","image/btn/close.jpg","BTNCLOSE",415,340,70,20);
				
		this.assetManager.addAsset("multiplayer-signin","html",null,"MULTIPLAYER_SIGNIN_HTML",20,20,280,200);
		this.assetManager.addAsset("multiplayer-signin","btn","image/btn/signIn.jpg","BTN_MULTIPLAYER_SIGNIN",160,285,70,20);
		this.assetManager.addAsset("multiplayer-signin","btn","image/btn/cancelSmall.jpg","BTNCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("multiplayer-unavailable","html",null,"MULTIPLAYER_UNAVAILABLE_HTML",20,20,280,200);
		this.assetManager.addAsset("multiplayer-unavailable","btn","image/btn/close.jpg","BTNCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("opponent_resigned","html",null,"OPPONENT_RESIGNED_HTML",20,20,280,200);
		this.assetManager.addAsset("opponent_resigned","btn","image/btn/close.jpg","BTNMULTIPLAYERCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("win-multiplayer","html",null,"WIN_MULTIPLAYER_HTML",20,20,280,200);
		this.assetManager.addAsset("win-multiplayer","btn","image/btn/share.jpg","BTNSHARE",160,285,70,20);
		this.assetManager.addAsset("win-multiplayer","btn","image/btn/close.jpg","BTNMULTIPLAYERCLOSE",235,285,70,20);
				
		this.assetManager.addAsset("lose-multiplayer","html",null,"LOSE_MULTIPLAYER_HTML",20,20,280,200);
		this.assetManager.addAsset("lose-multiplayer","btn","image/btn/close.jpg","BTNMULTIPLAYERCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("challenger","html",null,"CHALLENGER_HTML",20,20,290,240);
		this.assetManager.addAsset("challenger","btn","image/btn/close.jpg","BTNCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("challenge","html",null,"CHALLENGE_HTML",20,20,290,240);
		this.assetManager.addAsset("challenge","btn","image/btn/accept.jpg","BTNACCEPT",160,285,70,20);
		this.assetManager.addAsset("challenge","btn","image/btn/decline.jpg","BTNDECLINE",235,285,70,20);
		
		this.assetManager.addAsset("challenge_declined","html",null,"CHALLENGE_DECLINED_HTML",20,20,290,240);
		this.assetManager.addAsset("challenge_declined","btn","image/btn/close.jpg","BTNCLOSE",235,285,70,20);
		
		this.assetManager.addAsset("challenge_sent","html",null,"CHALLENGE_SENT_HTML",20,20,290,240);
		this.assetManager.addAsset("challenge_sent","btn","image/btn/cancel.jpg","BTNMULTIPLAYERCANCEL",205,285,100,20);
		
		this.assetManager.addAsset("challenge_withdrawn","html",null,"CHALLENGE_WITHDRAWN_HTML",20,20,290,240);
		this.assetManager.addAsset("challenge_withdrawn","btn","image/btn/close.jpg","BTNCLOSE",235,285,70,20);
		
		//Initialize layers
		this.layerManager.addLayer("/SHADE");
		this.layerManager.addLayer("/GUI");
		
		//Listen for window resize
		var t = this;
		$(window).resize(function() { t.handleResize() });
		
		this.createResponders();
		this.createCustomizers();	
	},
	
	createResponders: function() {
		var t = this;
		
		this.addResponder("BTN_CLICK", function(event) {
			t.broadcastEvent(event.owner.getName());					
		});
	},
	
	createCustomizers: function() {
		var t = this;
		
		this.addCustomizer("img", function(asset) {	
			asset.container.html("<img width='100%' height='100%' src='" + asset.src + "' id='" + asset.tag + "'/>");
		});
		
		this.addCustomizer("box", function(asset) {	
			asset.container.html("<div id='" + asset.tag + "' class='dialog' style='width: " + (t.width - 10) + "px; height: " + (t.height - 10) + "px;'/>");
		});
		
		this.addCustomizer("html", function(asset) {
			asset.container.html("<div style='position:absolute;width:100%;height:100%;'>" + App.getHTML(asset.tag) + "</div>");
			Cufon.refresh();
		});
		
		this.addCustomizer("btn", function(asset) {
			asset.param = new Button(asset);
			asset.param.addListener(t.eventQueue);
		});
		
		this.addCustomizer("scroll_widget", function(asset) {
			asset.param = new ScrollWidget(asset.container,asset.src,asset.width,asset.height,t.debug);
		});
	},
	
	draw: function(which, initWidth, initHeight) {
		this.type = which;
		this.width = initWidth;
		this.height = initHeight;
		
		this.handleResize();
		
		this.layerManager.layOut(this.assetManager.getAssets("shade"),"/SHADE");
		this.layerManager.layOut(this.assetManager.getAssets("gui|" + which),"/GUI");
	},
	
	erase: function() {
		this.layerManager.clearSet("/SHADE");
		this.layerManager.clearSet("/GUI");
	},
	
	handleResize: function() {		
		var w = $(window).width() - gAdWidth;;
		var h = $(window).height();
		
		this.assetManager.getAsset("SHADE").setWidth(w);		
		this.assetManager.getAsset("SHADE").setHeight(h);		
		this.layerManager.getLayerObject("/GUI").setPosition((w/2) - (this.width/2),(h/2) - (this.height/2));	
	},
	
	getName: function() {
		return this.name;	
	}
});