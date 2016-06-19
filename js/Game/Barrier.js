var Barrier = Thunder.Component.extend({			
	init: function(initRootElement, initNode, initNodeMap, initSource, initWidth, initHeight, initParam, initDebug) {
		this._super(initRootElement);
			
		//Initialize properties
		this.debug = initDebug;
		this.node = initNode; //Thunder.Point
		this.nodeMap = initNodeMap; //NodeMap
		this.width = initWidth;
		this.height = initHeight;
		this.blockOffsetX = initParam.blockOffsetX;
		this.blockOffsetY = initParam.blockOffsetY;
		
		//Initialize properties
		this.source = initSource;
		
		//Initialize assets
		this.assetManager.addAsset("gui","img",this.source,"IMAGE",0,0,this.width,this.height);
		
		//Initialize layers
		this.layerManager.addLayer("/IMAGE");
		
		//Update node map
		this.updateNodeMap(1);
		
		//Start
		this.createCustomizers();	
		this.draw();
	},
	
	createCustomizers: function() {
		this.addCustomizer("img", function(asset) {	
			asset.container.html("<img width='" + asset.width + "' height='" + asset.height + "' src='" + asset.src + "' style='position: absolute;'/>");
		});
	},
	
	draw: function() {
		this.layerManager.layOut(this.assetManager.getAssets("gui"),"/IMAGE");
	},
	
	updateNodeMap: function(newState) {
		this.nodeMap.set(this.node, this.width - this.blockOffsetX, this.height - this.blockOffsetY, newState, this, true);	
	}
});