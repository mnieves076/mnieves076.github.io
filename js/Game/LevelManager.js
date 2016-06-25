var LevelManager = BaseObject.extend({			
	init: function(initAssetManager) {				
		//Initialize properties
		this.assetManager = initAssetManager;
		this.level = 1;
		this.maxLevel = 16;
		this.levels = [];
		this.mapName = "";
		this.playerStartsEast;
		this.mapGridWidth = 0;
		this.mapGridHeight = 0;
		this.mapSectionWidth = 900;
		this.mapSectionHeight = 680;
		
		//get player level
		this.playerLevel = gUserLevel;	
		var i = window.localStorage.getItem("ATPG_PLAYER_LEVEL");
		
		if(i != null) {
			this.playerLevel = i;
		}
		
		this.defineLevels();
	},
	
	getMaxLevel: function() {
		return this.maxLevel;	
	},
	
	getLevel: function() {
		return this.level;
	},
	
	setLevel: function(newLevel) {
		if(this.level < this.maxLevel && newLevel <= this.maxLevel) {
			this.level = newLevel;
		}
	},
	
	getPlayerLevel: function() {
		return this.playerLevel;
	},
	
	setPlayerLevel: function(newLevel) {
		this.playerLevel = newLevel;
		window.localStorage.setItem("ATPG_PLAYER_LEVEL",this.playerLevel);
	},
	
	getMapName: function() {
		return this.mapName;	
	},
	
	getMapPixelWidth: function() {
		return this.mapGridWidth * this.mapSectionWidth;
	},
	
	getMapPixelHeight: function() {
		return this.mapGridHeight * this.mapSectionHeight;
	},
	
	getLevelInfo: function() {
		return this.levels[this.level - 1];		
	},
	
	defineLevels: function() {
		this.levels.push({PLAYER_UNITS: 3, ENEMY_UNITS: 2});//level 1, -1	
		this.levels.push({PLAYER_UNITS: 4, ENEMY_UNITS: 4});//level 2, 0
		this.levels.push({PLAYER_UNITS: 5, ENEMY_UNITS: 5});//level 3, 0	
		this.levels.push({PLAYER_UNITS: 6, ENEMY_UNITS: 6});//level 4, 0	
		this.levels.push({PLAYER_UNITS: 6, ENEMY_UNITS: 7});//level 5, +1		
		this.levels.push({PLAYER_UNITS: 7, ENEMY_UNITS: 8});//level 6, +1 		
		this.levels.push({PLAYER_UNITS: 7, ENEMY_UNITS: 9});//level 7, +2		
		this.levels.push({PLAYER_UNITS: 8, ENEMY_UNITS: 10});//level 8, +2		
		this.levels.push({PLAYER_UNITS: 8, ENEMY_UNITS: 11});//level 9, +3		
		this.levels.push({PLAYER_UNITS: 9, ENEMY_UNITS: 12});//level 10, +3		
		this.levels.push({PLAYER_UNITS: 9, ENEMY_UNITS: 13});//level 11, +4	
		this.levels.push({PLAYER_UNITS: 10, ENEMY_UNITS: 14});//level 12, +4		
		this.levels.push({PLAYER_UNITS: 11, ENEMY_UNITS: 15});//level 13, +4 		
		this.levels.push({PLAYER_UNITS: 12, ENEMY_UNITS: 16});//level 14, +4	
		this.levels.push({PLAYER_UNITS: 14, ENEMY_UNITS: 18});//level 15, +4 	
		this.levels.push({PLAYER_UNITS: 16, ENEMY_UNITS: 20});//level 16, +4 		
	},
	
	loadMap: function(whichMap) {
		this.assetManager.removeAssets("map|static-entity");
		
		//define parameters
		var treeParams = {blockOffsetX: 40, blockOffsetY: 40, maxHealth: 25};
		var house40Params = {blockOffsetX: 40, blockOffsetY: 40, maxHealth: 50};
		var house60Params = {blockOffsetX: 40, blockOffsetY: 40, maxHealth: 60};
		var house80Params = {blockOffsetX: 40, blockOffsetY: 40, maxHealth: 70};
		var pondParams = {blockOffsetX: 20, blockOffsetY: 20};
		var m = 0;
		
		//choose one of the six maps
		if(isNaN(whichMap) || whichMap == null) {
			if(this.level <= 2) {
				m = 4;
			} else if(this.level <= 5) {
				m = 5;
			} else if(this.level <= 8) {
				m = 2;
			} else if(this.level <= 11) {
				m = 3;
			} else if(this.level <= 14) {
				m = 1;
			} else if(this.level <= 20) {
				m = 0;
			}
		} else {
			if(whichMap < 6) {
				m = whichMap;	
			}
		}
		
		switch(m) {
			case 0: 
				this.mapName = "The Asphalt Jungle";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheAsphaultJungle.jpg","BG",0,0,900,680);
				this.assetManager.addAsset("map","img","image/TheAsphaultJungle.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheAsphaultJungle.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheAsphaultJungle.jpg","BG-3",900,680,900,680);	
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","HOUSE60_1",120,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","HOUSE60_2",120,180,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","HOUSE60_3",120,320,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","HOUSE60_4",120,460,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","HOUSE80_1",260,40,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","HOUSE80_2",260,200,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","HOUSE80_3",260,360,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","HOUSE80_4",260,520,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_1",420,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_2",540,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_3",620,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_4",700,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_5",420,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_6",500,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_7",580,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_8",700,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_9",420,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_10",580,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_11",700,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_12",420,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_13",580,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_14",700,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_15",1320,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_16",1320,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_17",900,1280,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_18",700,560,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286154448012-5777",130,600,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286154454291-5903",420,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286154459675-3529",540,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286154465603-6679",620,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286154474098-7958",420,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286154481618-6941",580,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286154486474-3948",700,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286154493657-4323",500,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286154520424-6618",700,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286154531207-266",420,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286154535263-4414",580,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286154539615-7542",700,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286154544262-6969",420,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286154548238-4419",580,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286154552798-8879",130,1280,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286154579045-4411",700,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286154589588-4145",510,1040,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286154619178-1706",120,720,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286154623666-7240",120,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286154630690-5267",120,1000,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286154636666-5580",120,1140,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286154644337-3757",260,720,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286154648505-3996",260,880,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286154653217-1447",260,1040,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286154659352-6453",260,1220,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286154669264-3405",420,1240,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286154676791-5788",540,1240,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286154686287-4141",700,1260,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286154831751-6913",540,570,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286154846086-7897",420,570,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286154951288-4625",840,10,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286154971287-3662",1160,40,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286154979382-5460",820,180,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286154985782-753",820,320,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286154989773-645",820,720,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155000741-6956",820,600,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155006061-4509",820,460,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155016604-9827",820,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155024796-9038",820,1000,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155029460-6221",820,1140,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155059290-55",820,1280,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155076113-8527",920,1160,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155090552-3905",920,480,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155102367-658",920,200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155134374-3969",1020,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155138134-5528",1020,180,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155141877-4549",1020,320,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155147125-2555",1020,460,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155153669-88",1020,720,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155161709-6251",1020,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155166180-9996",1020,1000,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155171388-2097",1020,1140,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155175492-5750",1320,570,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286155205442-656",1160,200,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286155210114-5808",1160,360,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286155216898-1692",1160,520,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155229409-9885",1030,600,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286155247424-2007",1160,720,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286155253991-7725",1160,880,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286155260679-3911",1160,1040,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286155265095-3128",1160,1210,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155280982-765",1030,1280,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155299837-6850",1320,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155304261-4102",1440,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155309909-2419",1520,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286155316572-3825",1600,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286155323468-2065",1480,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155328340-3172",1400,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155334507-841",1480,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155348019-9443",1320,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155371449-916",1600,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155375841-6987",1600,300,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155380785-552",1480,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155385882-8852",1600,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286155402456-9442",1430,560,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155414487-8227",1600,570,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155420823-8410",1320,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286155425230-149",1440,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155431190-8509",1520,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155448013-8509",1600,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155459429-4168",1320,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155467324-7581",1400,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155471692-832",1480,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286155475612-4329",1600,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155480340-9404",1320,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155483924-3144",1480,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155488187-5325",1600,980,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286155493235-1501",1320,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286155497611-3038",1600,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286155502131-1898",1480,1110,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286155513826-9266",1320,1240,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286155519746-3936",1440,1240,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286155532105-2189",1600,1260,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155546216-7059",1410,360,60,60,treeParams);
				break;
			case 1: 
				this.mapName = "The Meat Grinder";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheMeatGrinder.jpg","BG",0,0,900,680);
				this.assetManager.addAsset("map","img","image/TheMeatGrinder.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheMeatGrinder.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheMeatGrinder.jpg","BG-3",900,680,900,680);	
				
				//western river
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",380,0,140,140,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",380,180,140,320,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",380,540,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",380,680,140,140,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",380,860,140,320,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",380,1220,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				//central river
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",830,0,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",830,180,140,320,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",830,540,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",830,680,140,140,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",830,860,140,320,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",830,1220,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				//eastern river
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",1280,0,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",1280,180,140,320,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",1280,540,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				this.assetManager.addAsset("static-entity","barrier","image/river-top.png","WATER-0",1280,680,140,140,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-middle.png","WATER-1",1280,860,140,320,{blockOffsetX: 0, blockOffsetY: 20});	
				this.assetManager.addAsset("static-entity","barrier","image/river-bottom.png","WATER-2",1280,1220,140,140,{blockOffsetX: 0, blockOffsetY: 20});
				
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","HOUSE80_1",260,20,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","HOUSE80_2",260,180,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","HOUSE80_3",260,380,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","HOUSE80_4",260,540,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","HOUSE80_5",660,20,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","HOUSE80_6",660,180,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","HOUSE80_7",660,380,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","HOUSE80_8",660,540,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","HOUSE60_1",120,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","HOUSE60_2",120,180,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","HOUSE60_3",120,280,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","HOUSE60_4",120,540,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","HOUSE60_5",520,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","HOUSE60_7",520,280,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","HOUSE60_8",520,540,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-1",160,440,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-2",560,440,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-3",520,180,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155825453-7901",120,650,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155837324-5513",120,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155842036-6021",120,960,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155864138-5527",520,720,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155868954-2499",520,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286155873242-5102",520,960,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286155877523-7761",260,700,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286155882074-4504",260,860,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286155888281-5932",260,1060,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286155893041-6373",660,1060,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286155903233-2603",660,860,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286155907224-7496",660,700,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286155928591-9795",520,1220,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286155934079-3851",120,1220,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286155940927-6454",260,1220,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286155945374-5023",660,1220,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155952406-4484",520,1120,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155955966-6269",160,1120,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286155964045-5979",160,760,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156335561-1512",1020,440,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286156364511-1537",1020,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156368647-3449",1020,180,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286156371863-8767",1020,280,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286156377838-8677",1160,20,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286156382998-4169",1160,180,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286156390725-8323",1160,380,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286156403309-2252",1020,650,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156407901-801",1020,540,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156432219-4115",1060,760,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286156446835-5006",1020,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156456202-8848",1020,960,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286156462770-9720",1160,860,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286156467345-9993",1160,700,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286156472489-6747",1160,540,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286156481673-4979",1160,1060,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286156497992-8090",1420,540,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156502224-316",1420,720,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156509752-710",1420,650,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286156521273-3753",1560,540,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286156526335-2694",1560,700,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286156531622-7086",1560,860,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286156535926-6806",1560,1060,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286156546333-2255",1420,860,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156552973-127",1420,960,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156557925-8091",1410,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156576780-5106",1060,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156580812-9910",1160,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156583491-714",1220,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156586603-2453",1420,1120,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156589811-653",1560,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156598499-205",1420,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156603643-6375",1560,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156607058-7316",1620,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156610562-1292",1620,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156613290-2567",1220,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156616402-3781",1160,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156619530-3650",1060,1300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156623154-2194",1060,1120,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286156655911-1664",1420,40,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286156669343-5549",1420,280,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-yellow.png","STATIC-ENTITY-1286156687142-1135",1560,180,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286156691254-5377",1560,20,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House80-green.png","STATIC-ENTITY-1286156695846-8912",1560,380,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286156700133-793",1420,440,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286156718764-3834",1420,180,100,100,house60Params);
				break;
			case 2: 
				this.mapName = "The Cauldron";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheCauldron.jpg","BG",0,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheCauldron.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheCauldron.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheCauldron.jpg","BG-3",900,680,900,680);	
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_1",120,220,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_2",280,500,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_3",620,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_4",820,390,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-1",260,240,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-2",380,480,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-3",500,140,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-4",820,510,60,60,treeParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x80.png","WATER-0",120,120,100,80,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x80.png","WATER-0",680,570,100,80,pondParams);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167119928-1235",1490,1070,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167126935-8463",1180,1180,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167135878-9106",820,1150,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167142990-768",280,1180,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167151861-9506",180,800,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286167201578-6571",1410,900,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286167210794-1083",1310,900,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167220441-2765",1210,920,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167236105-6168",1180,500,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167240576-315",1490,380,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167247824-7936",1070,120,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167271791-7749",190,710,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167279590-6292",510,930,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167285038-3921",510,1280,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167292070-2456",830,1070,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167296341-1327",960,740,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167298469-7194",1010,800,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167306341-3788",880,140,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167311949-6427",1320,220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167322124-7374",1270,1040,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167324908-890",1140,930,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286167355138-9554",470,220,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286167364002-2474",370,220,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167372025-2516",570,340,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167379897-6212",420,650,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167388336-701",610,1060,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167398664-4777",810,900,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167406975-139",1080,630,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167414143-3003",1010,240,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286167421774-7714",1390,570,60,60,treeParams);
				break;
			case 3: 
				this.mapName = "The Gauntlet";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheGauntlet.jpg","BG-0",0,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheGauntlet.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheGauntlet.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheGauntlet.jpg","BG-3",900,680,900,680);	
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_1",100,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_2",180,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_3",260,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_4",370,20,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_5",570,70,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_6",650,-10,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_7",100,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_8",180,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_9",260,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_10",340,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_11",500,160,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_12",370,310,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_13",500,290,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_14",620,290,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_15",730,290,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_16",500,410,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_17",620,410,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_18",730,410,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_19",230,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_20",310,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_21",390,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_22",100,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_23",180,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_24",260,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-1",320,70,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-2",360,70,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-3",400,70,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-4",500,0,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-5",500,40,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-6",500,80,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-7",110,300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-8",150,300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-9",190,300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-10",110,340,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-11",150,340,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-12",190,340,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-13",110,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-14",150,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-15",190,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-16",110,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-17",150,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-18",320,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-19",360,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-20",400,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-21",280,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-22",320,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-23",360,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-24",400,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-25",650,210,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-26",690,210,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-27",730,210,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-28",650,490,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-29",690,490,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-30",730,490,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167648347-2130",370,690,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167668041-7243",100,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167673193-1145",180,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167677376-2712",260,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167681256-6948",340,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167686400-8819",370,990,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167718495-8807",230,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167722718-8086",310,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167726622-2277",390,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167736597-7153",730,1090,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167741285-2897",730,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167744317-8300",500,1090,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167750013-1205",610,1090,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167754460-6588",610,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167759741-8492",500,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286167789026-1849",500,840,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286167793738-2826",570,750,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286167799154-7802",640,670,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286167815161-2659",1400,570,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286167823777-2695",960,20,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-purple.png","STATIC-ENTITY-1286167834064-604",1250,10,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286167861247-6827",1270,320,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286167877286-9447",1040,300,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286167901572-6903",960,980,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286167913388-6191",880,300,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286168001343-8431",110,980,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168019510-8708",1080,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168029237-2121",1160,40,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168036013-529",1090,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168048612-1949",1000,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168054476-8462",1250,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168058844-1186",1170,170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-blue.png","STATIC-ENTITY-1286168076252-7698",940,680,120,120,house80Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168117433-6952",1400,160,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168122208-7051",1460,70,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168126640-1860",1540,-10,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168131440-8758",1400,290,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168137544-6571",1400,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168141320-5305",1520,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168145463-9763",1520,290,80,80,house40Params);
				//this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168150327-5787",1630,430,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168156063-6935",1620,290,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168177606-8211",1130,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168181864-7283",1210,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168186400-1513",1290,490,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168196188-2022",1080,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168200612-937",1160,720,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168205548-5332",1270,700,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168232794-5678",1000,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168237490-9777",1080,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168241122-7283",1160,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168244658-9145",1240,850,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168251026-8620",1270,1000,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168258545-9374",1130,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168263609-8085",1210,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168267369-4656",1290,1170,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286168279456-4131",1400,1090,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168287824-2073",1400,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168291528-360",1520,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168295256-9603",1610,970,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168300439-5506",1520,1100,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286168307055-2074",1610,1100,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286168330030-4755",1400,840,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286168337509-5507",1460,750,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286168341581-4500",1550,670,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House80-orange.png","STATIC-ENTITY-1286168373379-3721",740,1220,120,120,house80Params);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168411408-6036",410,600,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168414496-3594",370,600,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168418016-7686",330,600,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168455623-9664",500,740,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168458774-2026",500,790,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168480068-1598",500,690,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168490341-9083",400,1080,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168496604-7767",360,1080,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168499260-974",320,1080,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168505492-7542",400,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168509055-755",360,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168511892-825",320,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168517388-311",280,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168524539-6227",160,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168528491-2326",240,1280,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168531771-7879",200,1280,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168583760-4366",510,1170,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168587536-2947",550,1170,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168590696-2905",590,1170,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168597648-5604",920,880,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168600926-6890",880,880,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168605967-1865",840,880,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168610529-9842",800,880,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168630325-6908",730,680,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168633493-1204",730,630,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168636365-9423",730,580,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168648196-5635",920,200,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168651692-6470",880,200,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168654995-5740",840,200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168672298-7058",880,520,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168675594-6313",880,470,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168678179-9917",880,420,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168683169-1302",1300,600,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168686001-6102",1260,600,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168690921-1895",1220,600,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168720442-9400",1300,410,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168725528-9357",1260,410,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168728280-963",1220,410,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168731112-3785",1400,520,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168737410-1665",1440,520,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168740904-2913",1480,520,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168750815-945",1400,1200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168753375-5616",1440,1200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168756559-2369",1480,1200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168763486-2330",850,1030,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168770735-4425",850,1080,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168774102-4362",850,1130,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168784441-3646",850,1180,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168788141-9928",890,1080,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168792173-7061",890,1130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168796341-9354",930,1080,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168800501-2826",930,1130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168803189-4171",970,1080,60,60,treeParams);
				//this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286168806788-7049",970,1130,60,60,treeParams);
				break;
			case 4: 
				this.mapName = "The Turkey Shoot";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheTurkeyShoot.jpg","BG",0,0,900,680);
				this.assetManager.addAsset("map","img","image/TheTurkeyShoot.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheTurkeyShoot.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheTurkeyShoot.jpg","BG-3",900,680,900,680);	
				this.assetManager.addAsset("static-entity","barrier","image/pond100x80.png","WATER-0",150,270,100,80,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x120.png","WATER-1",500,530,100,120,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond140x160.png","WATER-2",520,210,140,160,pondParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-1",170,20,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-2",260,70,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-3",120,100,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-5",170,200,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-6",160,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-7",130,450,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-8",140,550,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-9",220,610,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-10",220,490,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-11",280,410,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-12",280,300,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-13",300,220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-14",330,150,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-15",380,30,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-16",430,180,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-17",400,260,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-18",370,370,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-19",330,480,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-20",340,580,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-21",500,90,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-22",450,340,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-23",460,430,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-25",420,620,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-26",640,40,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-28",560,400,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-29",630,470,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-30",850,290,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-31",740,580,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-32",620,650,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-33",690,370,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-34",670,250,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-36",740,140,60,60,treeParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x120.png","STATIC-ENTITY-1286165110796-5911",150,820,100,120,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x80.png","STATIC-ENTITY-1286165115722-320",530,1100,100,80,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond140x160.png","STATIC-ENTITY-1286165126378-4787",1150,940,140,160,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x80.png","STATIC-ENTITY-1286165134081-5802",920,390,100,80,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x120.png","STATIC-ENTITY-1286165142369-1212",1320,120,100,120,pondParams);
				this.assetManager.addAsset("static-entity","barrier","image/pond100x120.png","STATIC-ENTITY-1286165151728-8727",970,1160,100,120,pondParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165165712-6314",140,720,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165181639-6443",300,760,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165184455-5289",510,720,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165187710-9837",690,780,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165190166-3538",460,850,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165192446-7386",320,880,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165194750-7280",580,850,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165199854-8460",150,970,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165203550-8228",210,1090,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165206574-107",290,1000,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165209493-7873",200,1220,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165212933-4922",310,1280,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165215565-1485",420,1080,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165218037-7695",320,1160,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165229092-6304",520,970,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165232204-4734",670,990,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165234812-2470",490,1250,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165237244-4683",660,1240,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165243076-3378",700,1110,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165245204-2996",770,880,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165247668-4917",820,1230,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165256227-2865",800,1040,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165258643-8788",910,940,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165260987-6029",910,1080,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165263123-191",890,800,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165265931-9483",1580,860,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165275250-4971",1530,960,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165277802-5075",1400,800,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165280114-2997",1310,900,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165282274-6614",1400,990,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165285418-4777",1310,1060,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165287466-5210",1570,1280,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165290586-2744",1510,1140,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165292890-1034",1410,1180,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165295273-3859",1210,780,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165297745-4378",1170,860,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165299977-975",1230,1130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165302257-357",1320,1190,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165304697-4831",1160,1240,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165310977-8707",1040,1050,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165313561-1853",1040,880,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165320042-4600",840,690,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165322472-4140",1020,670,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165324808-6028",1200,590,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165329624-6362",840,410,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165332889-6154",870,530,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165335367-3345",990,550,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165395294-2399",960,100,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165397444-8949",1120,210,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165399508-8104",1110,390,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165402995-2908",1190,70,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165405291-3885",1470,560,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165407772-3962",1320,520,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165409635-7173",1440,120,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165411483-9863",1510,420,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165420747-6720",1310,320,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286165432786-9111",1340,670,60,60,treeParams);
				break;
			case 5: 
				this.mapName = "The Can Opener";
				this.mapGridWidth = 2;
				this.mapGridHeight = 2;
				this.assetManager.addAsset("map","img","image/TheCanOpener.jpg","BG",0,0,900,680);
				this.assetManager.addAsset("map","img","image/TheCanOpener.jpg","BG-1",900,0,900,680);	
				this.assetManager.addAsset("map","img","image/TheCanOpener.jpg","BG-2",0,680,900,680);	
				this.assetManager.addAsset("map","img","image/TheCanOpener.jpg","BG-3",900,680,900,680);	
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_0",100,80,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_1",200,80,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","HOUSE_2",620,440,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","HOUSE_3",720,440,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","HOUSE_4",620,540,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","HOUSE_5",720,540,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-1",660,110,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-2",700,130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-3",640,170,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-4",670,190,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-5",130,500,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-6",170,480,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-7",400,580,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","TREE-8",440,600,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286156989643-1485",100,760,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286156994914-9866",200,760,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286157006753-2112",620,1120,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286157010825-6684",620,1220,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286157015753-2059",720,1120,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286157020760-5419",720,1220,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286157028552-8531",980,740,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House60-green.png","STATIC-ENTITY-1286157034520-7873",1100,740,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286157045487-4313",1620,1120,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286157049863-9891",1520,1120,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286157053823-3140",1520,1220,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286157058662-1234",1620,1220,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-white.png","STATIC-ENTITY-1286157069518-7944",1620,540,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286157073550-8946",1620,440,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-green.png","STATIC-ENTITY-1286157079950-6006",1520,440,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-pink.png","STATIC-ENTITY-1286157083965-651",1520,540,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House40-blue.png","STATIC-ENTITY-1286157100532-2198",1000,80,80,80,house40Params);
				this.assetManager.addAsset("static-entity","static","image/House60-garage.png","STATIC-ENTITY-1286157105308-2180",1100,80,100,100,house60Params);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157128099-412",300,910,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157130643-2110",520,810,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157133554-4517",470,870,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157135874-3124",710,920,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157138586-533",680,670,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157143666-3639",460,1130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157146786-992",410,1190,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157153689-4206",920,1130,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157156681-1516",970,1180,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157158905-2118",1210,1100,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157160817-9417",1270,1150,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157173520-6171",890,410,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157175608-3613",930,430,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157182408-1808",1270,510,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157183912-289",1300,560,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157188320-4360",1380,770,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157190688-3242",1420,820,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157197407-4144",1370,190,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157199511-6064",1420,150,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157201719-6518",1310,50,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157223238-9157",930,670,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157255052-3935",330,150,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157267532-2562",1170,920,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157279659-5715",1080,570,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157299394-5994",1280,380,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157314713-2605",450,370,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157325120-861",990,260,60,60,treeParams);
				this.assetManager.addAsset("static-entity","static","image/Tree40-summer.png","STATIC-ENTITY-1286157330688-2869",900,20,60,60,treeParams);
				break;
		}
	},
	
	startLevel: function() {
		//get the unit assets
		var playerUnitAssets = this.assetManager.getAssets("entity","playerunit");
		var enemyUnitAssets = this.assetManager.getAssets("entity","enemyunit");
		var finalAssets = [];
		var playerStarts;
		var enemyStarts;
		var playerStartRotation;
		var enemyStartRotation;
			
		//define starting locations
		var westSideSpots = [];
		var eastSideSpots = [];
		
		for(var x = 0; x <= 60; x += 60) {
			for(var y = 380; y <= 920; y += 60) {
				westSideSpots.push({x: x,y: y});
				eastSideSpots.push({x: (x + 1680),y: y});
			}
		}
		
		//decide which side units will start on
		if(Math.floor(Math.random() * 2) == 0) {
			this.playerStarts = westSideSpots;
			this.enemyStarts = eastSideSpots;
			this.playerStartRotation = 2;
			this.enemyStartRotation = 6;
			this.playerStartsEast = false;
		} else {
			this.playerStarts = eastSideSpots;
			this.enemyStarts = westSideSpots;
			this.playerStartRotation = 6;
			this.enemyStartRotation = 2;
			this.playerStartsEast = true;
		}
		
		//position player units
		var totalPlayerUnits = this.levels[this.level - 1].PLAYER_UNITS;
		var r,s,i;
		
		for(i = 0; i < totalPlayerUnits; i++) {
			//randomly select a spot
			r = Math.floor(Math.random() * this.playerStarts.length);
			s = this.playerStarts[r];
			this.playerStarts.splice(r,1);			
			playerUnitAssets[i].setPosition(s.x,s.y);
			playerUnitAssets[i].param.rotation = this.playerStartRotation;
			finalAssets.push(playerUnitAssets[i]);
		}
		
		//position enemy units
		var totalEnemyUnits = this.levels[this.level - 1].ENEMY_UNITS;
		
		for(i = 0; i < totalEnemyUnits; i++) {
			//randomly select a spot
			r = Math.floor(Math.random() * this.enemyStarts.length);
			s = this.enemyStarts[r];
			this.enemyStarts.splice(r,1);			
			enemyUnitAssets[i].setPosition(s.x,s.y);
			enemyUnitAssets[i].param.rotation = this.enemyStartRotation;
			finalAssets.push(enemyUnitAssets[i]);
		}
		
		return finalAssets;
	},
	
	startMatch: function(whichStart,totalUnits) {
		//get the unit assets
		var playerUnitAssets = this.assetManager.getAssets("entity","playerunit");
		var enemyUnitAssets = this.assetManager.getAssets("entity","netunit");
		var finalAssets = [];
		var playerStarts;
		var enemyStarts;
		var playerStartRotation;
		var enemyStartRotation;
			
		//define starting locations
		var westSideSpots = [];
		var eastSideSpots = [];
		
		for(var x = 0; x <= 60; x += 60) {
			for(var y = 590; y < 950; y += 60) {
				westSideSpots.push({x: x,y: y});
				eastSideSpots.push({x: (x + 1680),y: y});
			}
		}
		
		if(whichStart == "west") {
			this.playerStarts = westSideSpots;
			this.enemyStarts = eastSideSpots;
			this.playerStartRotation = 2;
			this.enemyStartRotation = 6;
			this.playerStartsEast = false;
		} else {
			this.playerStarts = eastSideSpots;
			this.enemyStarts = westSideSpots;
			this.playerStartRotation = 6;
			this.enemyStartRotation = 2;
			this.playerStartsEast = true;
		}
				
		//position player units
		var totalPlayerUnits = totalUnits;
		var r,s,i;
		
		for(i = 0; i < totalPlayerUnits; i++) {
			s = this.playerStarts[i];	
			playerUnitAssets[i].setPosition(s.x,s.y);
			playerUnitAssets[i].param.rotation = this.playerStartRotation;
			finalAssets.push(playerUnitAssets[i]);
		}
		
		//position enemy units
		var totalEnemyUnits = totalUnits;
		
		for(i = 0; i < totalEnemyUnits; i++) {
			s = this.enemyStarts[i];			
			enemyUnitAssets[i].setPosition(s.x,s.y);
			enemyUnitAssets[i].param.rotation = this.enemyStartRotation;
			finalAssets.push(enemyUnitAssets[i]);
		}
		
		return finalAssets;
	}
});