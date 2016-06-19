var MiniMap = Thunder.Component.extend({		
	 init: function(initRootElement, initDebug, initMapPixelWidth, initMapPixelHeight) {
		this._super(initRootElement);
		
		//Initialize properties
		this.debug = true; //initDebug;
		this.mapPixelWidth = initMapPixelWidth;
		this.mapPixelHeight = initMapPixelHeight;
		this.mapAsset = null;
		this.mapWidth = this.mapPixelWidth / 10;
		this.mapHeight = this.mapPixelHeight / 10;
		this.viewAsset = null;
		this.viewWidth = 0;
		this.viewHeight = 0;
		this.entityList = [];
		this.mapPosition = new Thunder.Point(0,0);
				
		//Initialize assets
		this.assetManager.addAsset("gui","canvas",null,"MAP",0,0,this.mapWidth,this.mapHeight);	
		this.assetManager.addAsset("gui","canvas",null,"VIEW",0,0,0,0);
		this.assetManager.addAsset("gui","mouse_input",null,"MOUSE_INPUT",0,0,this.mapWidth,this.mapHeight);
		
		//Initialize layers
		this.layerManager.addLayer("/GUI");
		
		//Listen for window resize
		var t = this;
		$(window).resize(function() { t.handleResize() });
		
		//Start
		this.createResponders();
		this.createCustomizers();	
		this.viewAsset = this.assetManager.getAsset("VIEW");
		this.mapAsset = this.assetManager.getAsset("MAP");
		this.handleResize();
		this.draw();
	},
	
	createResponders: function() {	
		var t = this;
		
		this.addResponder("REPAINT", function(event) {
			t.repaint();
		});
			
		this.addResponder("MOUSEUP", function(event) {
			switch(event.owner.tag) {
				case "MOUSE_INPUT":
					var p = event.getLocalEventPosition();
					p.x -= (t.viewWidth / 2);
					p.y -= (t.viewHeight / 2);
					t.setMapPosition(p);
					t.broadcastEvent("MINI_MAP_UPDATE");
					break;
			}
		});
	},
	
	createCustomizers: function() {		
		var t = this;
		
		this.addCustomizer("mouse_input", function(asset) {
			t.mouseEventMap = new Thunder.EventMap(asset.container,asset,t.eventQueue);
			asset.container.html("<img style='cursor: pointer; width:" + asset.width + "px; height:" + asset.height + "px' src='image/transpix.gif' id='" + asset.tag + "'/>");
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/GUI");
		this.viewAsset.getContainer().css({"border":"1px solid #FFFF00"});
		
		this.mapAsset.getContainer().css({"background-color":"#000000"});
		this.mapAsset.setAlpha(0.5);
		
		this.repaint();
	},
	
	repaint: function () {
		var color;
		var h = "";
		
		for(var i = 0; i < this.entityList.length; i++) {
			if(this.entityList[i].isDestroyed) {
				color = "#666666";
			} else {
				if(this.entityList[i] instanceof PlayerTankEntity) {
					color = "#00FF00";
				} else {
					color = "#FF0000";
				}
			}
			
			h += "<div style='position: absolute; background-color: " + color + "; width: 6px; height: 6px; left:" + (this.entityList[i].node.x - 3) + "px; top:" + (this.entityList[i].node.y - 3) + "px;'></div>";
		}
		
		this.mapAsset.getContainer().html(h);
		this.eventQueue.addUniqueEvent("REPAINT",2000);
	},
	
	setEntities: function(newEntityList) {
		this.entityList = newEntityList;
	},
	
	setMapPosition: function(newPosition) {
		this.mapPosition = newPosition;	
		
		if(this.mapPosition.x < 0) {
			this.mapPosition.x = 0;	
		}
		
		if(this.mapPosition.y < 0) {
			this.mapPosition.y = 0;	
		}
		
		if(this.mapPosition.x > (this.mapWidth - this.viewWidth)) {
			this.mapPosition.x = this.mapWidth - this.viewWidth;	
		}
		
		if(this.mapPosition.y > (this.mapHeight - this.viewHeight)) {
			this.mapPosition.y = this.mapHeight - this.viewHeight;	
		}
		
		this.viewAsset.setPosition(this.mapPosition.x,this.mapPosition.y);
	},
	
	getMapPosition: function() {
		return this.mapPosition;	
	},
	
	handleResize: function() {
		this.viewWidth = ($(window).width() - gAdWidth) / 10;
		this.viewHeight = $(window).height() / 10;
		
		if(this.viewWidth > this.mapWidth) {
			this.viewWidth = this.mapWidth;	
			this.setMapPosition(new Thunder.Point(0,this.mapPosition.y));
			this.broadcastEvent("MINI_MAP_UPDATE");
		} 
		
		if(this.viewHeight > this.mapHeight) {
			this.viewHeight = this.mapHeight;	
			this.setMapPosition(new Thunder.Point(this.mapPosition.x,0));
			this.broadcastEvent("MINI_MAP_UPDATE");
		} 
		
		this.viewAsset.setWidth(this.viewWidth - 2);
		this.viewAsset.setHeight(this.viewHeight - 2);
		
		if((this.mapPosition.x + this.viewWidth) > this.mapWidth) {
			this.setMapPosition(new Thunder.Point(this.mapWidth - this.viewWidth,this.mapPosition.y));
			this.broadcastEvent("MINI_MAP_UPDATE");
		}
		
		if((this.mapPosition.y + this.viewHeight) > this.mapHeight) {
			this.setMapPosition(new Thunder.Point(this.mapPosition.x,this.mapHeight - this.viewHeight));
			this.broadcastEvent("MINI_MAP_UPDATE");
		}
	}
});