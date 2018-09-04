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
		layoutSprites: {'layoutItems':["1x1","1x2","2x1","2x2","1x3","3x1","6x4-scale-horizontal","7x3-scale-horizontal", "6x4-scale-vertical", "7x3-scale-vertical"]},
		maxSelectorsPerLine: 5,
		maxSelectorContainerWidth: 156,
		maxSelectorContainerHeight: 156,
		singleTab: false,
		dismissAfter: false,
		main_view: {},
		custom_view: {},
		options: {},
		util: {},
		badgeLimit: 2,
		isMac: navigator.platform.toUpperCase().indexOf('MAC')!==-1
	};

	window.resize = resize;

	/*
	* add listener for close request from background to close the foreground (default_popup)
	*/
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.close === "foreground") {
				sendResponse({success: true});
				window.close();
			}
	});

})();
