/*
* resize.js
* parent resize object, global variable and object initialization
*/
(function(){
	/*
	* tab resize object
	* @constructor
	*/
	var resize = {

		tabsArray: [],
		currentTab: null,
		numRows: 0,
		numCols: 0,
		width: 0,
		height: 0,
		canvasHeight: 100,
		canvasWidth: 100,
		currentLayouts: null,
		defaultLayouts: {'layoutItems':["1x1","1x2","2x1","2x2"]},
		layoutSprites: {'layoutItems':["1x1","1x2","2x1","2x2","1x3","3x1"]},
		maxSelectorsPerLine: 5,
		maxSelectorContainerWidth: 156,
		maxSelectorContainerHeight: 156,
		singleTab: false,
		main_view: {},
		custom_view: {},
		options: {},
		util: {},
		badgeLimit: 3
	};

	window.resize = resize;

})();