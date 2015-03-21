//background.js - background process for tab resize

//update when available rather than needing to wait for chrome to restart
chrome.runtime.onUpdateAvailable.addListener(function(details){
	var curVersion = localStorage.getItem('version');
	if(curVersion < details.version){
		localStorage.setItem('version',details.version);
		chrome.runtime.reload();
	}
});

// var SECONDS_IN_DAY = 86400000;
//
// //run once a day to check for updates
// setInterval(function(){
// 	chrome.runtime.requestUpdateCheck(function(status) {
// 	  if (status === "update_available") {
// 	    console.log("update pending...");
// 	  } else if (status === "no_update") {
// 	    console.log("no update found");
// 	  } else if (status === "throttled") {
// 	    console.log("Oops, I'm asking too frequently - I need to back off.");
// 	  }
// 	});
// },SECONDS_IN_DAY);

var version = localStorage.getItem('version');

if(!localStorage.getItem('updateBadge') || version < '2.3.3'){
	localStorage.setItem('updateBadge',0);
	chrome.browserAction.setBadgeText({text:'NEW'});
	chrome.browserAction.setBadgeBackgroundColor({color:[221, 129, 39, 255]});
}

if(!localStorage.getItem('version')){
	localStorage.setItem('version','2.1.1');
}

var util = {

	/**
	* creates a new window at specific location with the tab input
	* @param {Number} tabId - id of main tab in new window
	* @param {Number} startX - horizontal position of window
	* @param {Number} startY - vertical position of window
	* @param {Number} width - width of window
	* @param {Number} height - height of window
	* @param {boolean} incog - if window is of type incognito
	* @param {function} callback - callback function after window is created
	*/
	createNewWindow: function(tabId, startX, startY, width, height, incog, callback) {
		var objectInfo = {
			left: startX,
			top: startY,
			width: width,
			height: height,
			incognito: incog
		};

		if(tabId){
			if($.isArray(tabId)){
				objectInfo.tabId = tabId[0];
			} else {
				objectInfo.tabId = tabId;
			}
		}

		window.chrome.windows.create(objectInfo,
								function(_windowCb){
									callback(_windowCb, tabId);
								}
		);
	},

	/**
	* iterates through tab array to create layout
	* @param {array} tabsArray array of tab objects to be moved
	* @param {number} startIndex index of selected tab in window
	* @param {number} windowId index of window
	* @param {boolean} singleTab flag of single tab option
	* @param {boolean} incog - if window is of type incognito
	* @param {string} veritical or horizontal for scaled layouts
	*/
	processTabs: function(resize, tabsArray, startIndex, windowId, singleTab, incog, scaledOrientation) {
		var tabId,
			_tabsArray = tabsArray.slice(startIndex),
			index = 0,
			numEmptyWindows = 0,
			tabsLength = _tabsArray.length,
			emptyWindowLimit = (resize.numRows * resize.numCols) - tabsLength,
			that = this,
			leftValue,
			rightValue,
			createNewWindowCB = function(_windowCb,_tabId){
				//only if update storage when tab option is used
				if(!_tabId && resize.emptyTab){
						_tabsArray.push(_windowCb.tabs[0]);
						numEmptyWindows++;
					if(emptyWindowLimit === numEmptyWindows){
						that.updateUndoStorage(resize, _tabsArray);
					}
				} else if(_tabId && $.isArray(_tabId)){ //moving tabs to last window
					chrome.tabs.move(_tabId.slice(1),{
						windowId: _windowCb.id,
						index: 1
					});
				}
			};

		//loop through all row and col options
		for(var y=0; y<resize.numRows; y++){
			for(var x=0; x<resize.numCols; x++){

				if(resize.alignment === 'left'){
					leftValue = (x*resize.width) + resize.offsetX;
				} else {
					leftValue = resize.fullWidth - ((x+1)*resize.width) + resize.offsetX;
				}

				topValue = (y*resize.height) + resize.offsetY;

				// base case we update the current window
				if(x === 0 && y === 0){
					window.chrome.windows.update(_tabsArray[index].windowId,{ left: leftValue,
												top: topValue,
												width: resize.width,
												height: resize.height,
												state: "normal"
											});

					if(singleTab){
						return;
					}
				} else { //otherwise we create a new window
					tabId = _tabsArray[index] ? _tabsArray[index].id : null;

					//when no more tabs avaiable and option to create empty tab is not checked
					if(!tabId && !resize.emptyTab){
						return;
					}

					//splitting the rest of the tabs to the last window created
					if(y === resize.numRows-1 && x === resize.numCols -1 && tabsLength - index > 1){
						tabId = [];
						for(var z = index; z < tabsLength; z++){
							tabId.push(_tabsArray[z].id);
						}
					}

					//check the number of new windows that will be created
					//store the windowId information

					//handling secondary ratio
					if(scaledOrientation){
						if(scaledOrientation === 'horizontal'){
							resize.width = resize.fullWidth - resize.width;
							if(resize.alignment !== 'left'){
								leftValue = resize.offsetX;
							}
						} else {
							resize.height = resize.fullHeight - resize.height;
						}
					}

					that.createNewWindow(tabId, leftValue, topValue, resize.width, resize.height, incog, createNewWindowCB);

				}
				index++;
			}
		}
	},

	/**
	* set storage of last window and tabs being moved
	* @param {object} resize object from foreground
	* @param {number} tabIndex Starting tab index in previous window of first tab
	* @param {number} windowId Id of the previous window object which was modified
	* @param {array} tabsArray Array of tab objects to be moved back to the previous window
	*/
	setUndoStorage: function(resize, tabIndex, windowId, tabsArray, cb) {
		window.chrome.windows.get(windowId,{},function(_windowCb){
			var updateInfo = {	left: _windowCb.left,
								top: _windowCb.top,
								width: _windowCb.width,
								height: _windowCb.height,
								focused: true,
								state: "normal",
								incognito: _windowCb.incognito
							};
			var lastTab = {};
			lastTab.lastWindowInfo = updateInfo;
			lastTab.lastTabIndex = tabIndex;
			lastTab.lastWindowId = windowId;
			var tabsStore = [];
			for(var x=0; x<tabsArray.length; x++){
				tabsStore.push(tabsArray[x].id);
			}
			lastTab.lastTabsArray = tabsStore;
			localStorage.setItem('lastTab',JSON.stringify(lastTab));
			chrome.runtime.sendMessage('enable-undo');
			cb();
		});
	},

	/**
	* set storage of last window and tabs being moved
	* @param {object} resize object from foreground
	* @param {array} tabsArray Array of tab objects to be moved back to the previous window
	*/
	updateUndoStorage: function(resize, tabsArray) {
		var currentLastTab = JSON.parse(localStorage.getItem('lastTab'));
		var tabsStore = [];
		for(var x=0; x<tabsArray.length; x++){
			tabsStore.push(tabsArray[x].id);
		}
		if(currentLastTab){
			currentLastTab.lastTabsArray = tabsStore;
			localStorage.setItem('lastTab',JSON.stringify(currentLastTab));
			chrome.runtime.sendMessage('enable-undo');
		}
	},


	/*
	* undo previous resize option
	*/

	/**
	* undo the previous resize that was selected
	*/
	undoResize: function(resize,callback) {
		var that = this,
			lastTab = localStorage.getItem('lastTab');

		//undo not available
		if(!lastTab){
			return;
		}

		resize.lastTab = JSON.parse(lastTab);
		var tabIndex = resize.lastTab.lastTabIndex;
		var windowId = resize.lastTab.lastWindowId;
		var tabsArray = resize.lastTab.lastTabsArray;

		window.chrome.windows.get(windowId, {}, function(window){
			if(window){
				that.recombineTabs(resize,tabIndex,windowId,tabsArray,callback);
			} else {
				chrome.tabs.query({status: "complete"}, function(tabs){
					var currentExistingTabs = {};
					var newTabsArray = [];
					for(var i=0; i< tabs.length; i++){
						currentExistingTabs[tabs[i].id] = true;
					}
					for(var j = 0; j< tabsArray.length; j++){
						if(currentExistingTabs[tabsArray[j]]){
							newTabsArray.push(tabsArray[j]);
						}
					}
					if(newTabsArray.length !==0){
						chrome.windows.create({tabId: newTabsArray[0]},function(window){
							that.recombineTabs(resize,1,window.id,newTabsArray.slice(1),callback);
						});
					} else {
						if(!resize.isMac){
							alert("Previous tabs were closed.");
						}
						if(callback){
							callback();
						}
					}
				});
			}
		});
	},

	/**
	* recombine the tabs into one window
	* @param {object} resize object passed in for modification
	* @param {number} tabIndex Starting tab index in previous window of first tab
	* @param {number} windowId Id of final window holding recombined tabs
	* @param {array} tabsArray Array of tab objects to be moved back to the previous window
	*/
	recombineTabs: function(resize,tabIndex, windowId, tabsArray, callback) {
		var indexCounter = tabIndex;
		window.chrome.tabs.move(tabsArray,{windowId: windowId, index: indexCounter});
		var updateInfo = resize.lastTab.lastWindowInfo;
		var updateInfoForUpdate = $.extend(true, {}, updateInfo);
		delete updateInfoForUpdate.incognito;
		window.chrome.windows.update(windowId,updateInfoForUpdate);
		if(callback){
			callback();
		}
	},


	//format the displayInfo
	displayInfoFormatter: function(displayInfo,currentWindowInfo){
		var index = 0,
			length = displayInfo.length,
			info,
			displayJSON = { //may need to check for some mirroring property, currently only one monitor is display when mirroring
				displays: [],
				primaryIndex: 0
			};

		for(;index<length;index++){
			info = displayInfo[index];
			info.id = String(index); //setting index of display
			displayJSON.displays.push({
				workArea: info.workArea,
				isEnabled: info.isEnabled,
				id: info.id
			});

			if(currentWindowInfo.left > info.workArea.left && currentWindowInfo.left < info.workArea.left + info.workArea.width && currentWindowInfo.top > info.workArea.top && currentWindowInfo.top < info.workArea.top + info.workArea.height){
				displayJSON.primaryIndex = index;
			}

		}
		return displayJSON;
	}

};

function getResizeParams(command){
	var _command = command.split('-');
	if(command.indexOf('scale') !== -1){
		return {
			primaryRatio: Number(_command[2]),
			secondaryRatio: Number(_command[3]),
			orientation: _command[5]
		};
	} else {
		return {
			rows: Number(_command[2]),
			cols: Number(_command[3])
		};
	}
}

/**
* resizes tabs to the right of selected tab
* @param {object} screenInfo object with hardware screen properties
* @param {number} rows number of rows in resize layout
* @param {number} cols number of columns in resize layout
*/
function resizeTabs(screenInfo,rows,cols) {

	var resize = {};

	resize.numRows = rows;
	resize.numCols = cols;

	/*
	* split width of screen equally depending on number of cells
	* create new window unable to take non integers for width and height
	*/

	initResizePreferences(resize);
	setResizeWidthHeight(resize, screenInfo,resize.numRows,resize.numCols);
	resizeTabHelper(resize, screenInfo);
}

function resizeScaledTabs(screenInfo, primaryRatio, secondaryRatio, orientation){

	var resize = {};

	resize.numRows = (orientation === 'horizontal' ? 1 : 2);
	resize.numCols = (orientation === 'horizontal' ? 2 : 1);

	/*
	* split width of screen equally depending on number of cells
	* create new window unable to take non integers for width and height
	*/

	initResizePreferences(resize);
	setScaledResizeWidthHeight(resize, screenInfo, primaryRatio, secondaryRatio, orientation);
	resizeTabHelper(resize, screenInfo, orientation);

}

function setScaledResizeWidthHeight(resize, screenInfo, primaryRatio, secondaryRatio, orientation){
	if(!$.isEmptyObject(screenInfo)){
		resize.width = (orientation === 'horizontal') ? Math.round(screenInfo.width*0.1*primaryRatio) : screenInfo.width;
		resize.height = (orientation === 'horizontal') ? screenInfo.height : Math.round(screenInfo.height*0.1*primaryRatio);
	} else {
		resize.width = (orientation === 'horizontal') ? Math.round(window.screen.availWidth*0.1*primaryRatio) : window.screen.availWidth;
		resize.height = (orientation === 'horizontal') ? window.screen.availHeight : Math.round(window.screen.availHeight*0.1*primaryRatio);
	}
}

function setResizeWidthHeight(resize, screenInfo, rows, cols){
	if(!$.isEmptyObject(screenInfo)){
		resize.width = Math.round(screenInfo.width/cols);
		resize.height = Math.round(screenInfo.height/rows);
	} else {
		resize.width = Math.round(window.screen.availWidth/cols);
		resize.height  = Math.round(window.screen.availHeight/rows);
	}
}

function resizeTabHelper(resize, screenInfo, scaledOrientation){

	if(!$.isEmptyObject(screenInfo)){
		resize.offsetX = screenInfo.left;
		resize.offsetY = screenInfo.top;
		resize.fullWidth = screenInfo.width;
		resize.fullHeight = screenInfo.height;
	} else {
		resize.offsetX = 0;
		resize.offsetY = 0;
		resize.fullWidth = window.screen.availWidth;
		resize.fullHeight = window.screen.availHeight;
	}

	window.chrome.tabs.query({currentWindow: true},
		function (tabs) {
			resize.tabsArray = tabs;
			window.chrome.tabs.query({currentWindow: true, highlighted: true},
				function (tab) {
					resize.currentTab = tab[0];
					var index = resize.currentTab.index;
					if(tab.length > 1){
						resize.tabsArray = tab;
						index = 0;
					}

					var cb = function(){
							return util.processTabs(resize, resize.tabsArray, index, resize.currentTab.windowId, resize.singleTab, resize.currentTab.incognito, scaledOrientation);
					};
					if(resize.singleTab){
						util.setUndoStorage(resize,resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(index,index + 1), cb);
					} else {
						util.setUndoStorage(resize,resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(index), cb);
					}

				}
			);
		}
	);
}

function initResizePreferences(resize){
	var singleTabValue = localStorage.getItem('singleTab');
	if(singleTabValue && singleTabValue === 'true'){
		resize.singleTab = true;
	}

	var emptyTabValue = localStorage.getItem('emptyTab');
	if(!emptyTabValue || emptyTabValue === 'true'){
		resize.emptyTab = true;
	}

	var alignmentValue = localStorage.getItem('alignment');
	if(!alignmentValue){
		resize.alignment = 'left';
	} else {
		resize.alignment = alignmentValue;
	}
}

function disableUndoButton(resize){
	resize.lastTab = null;
	localStorage.removeItem('lastTab');
}

function sendTracking(category, label) {
	var optOut = localStorage.getItem("tracking-opt-out"),
		deferTracking = false;

	if(optOut && optOut === 'true'){
		deferTracking = true;
	}

	if(!deferTracking && ga) {
		ga('send','event', category, 'clicked', label || "na");
	}
}

// Standard Google Universal Analytics code
/* jshint ignore:start */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
/* jshint ignore:end */
ga('create', 'UA-34217520-2', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');

chrome.commands.onCommand.addListener(function callback(command) {

	if(command.indexOf('tab-resize') === -1){
		return;
	}

	if(command.indexOf('undo') !== -1){
		var resize = {};
		util.undoResize(resize,function(){
			disableUndoButton(resize);
		});
		sendTracking('undo','undo-shortcut');
		return;
	}

	if(chrome.system && chrome.system.display){
		chrome.system.display.getInfo(function(displayInfo){
			chrome.windows.getCurrent(function(windowInfo){

				var currentWindowInfo = {
					left: windowInfo.left + windowInfo.width - 100,
					top: windowInfo.top + 100
				};

				var displayJSON = util.displayInfoFormatter(displayInfo,currentWindowInfo),
					isScaled = command.indexOf('scale') !== -1,
					resizeParams = getResizeParams(command);

				sendTracking('keyboard-shortcut',command);

				if(isScaled){
					resizeScaledTabs(displayJSON.displays[displayJSON.primaryIndex].workArea, resizeParams.primaryRatio, resizeParams.secondaryRatio, resizeParams.orientation);
				} else {
					resizeTabs(displayJSON.displays[displayJSON.primaryIndex].workArea,resizeParams.rows,resizeParams.cols);
				}
			});
		});
	}
});
