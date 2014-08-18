//background.js - background process for tab resize

if(!localStorage.getItem('updateBadge')){
	localStorage.setItem('updateBadge',0);
	chrome.browserAction.setBadgeText({text:'NEW'});
	chrome.browserAction.setBadgeBackgroundColor({color:[221, 129, 39, 255]});
}

if(!localStorage.getItem('version')){
	localStorage.setItem('version','2.0');
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
	*/
	processTabs: function(resize, tabsArray, startIndex, windowId, singleTab, incog) {
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

				rightValue = (y*resize.height) + resize.offsetY;

				// base case we update the current window
				if(x === 0 && y === 0){
					if(resize.numRows === 1 && resize.numCols === 1 && !resize.isMac){
						window.chrome.windows.update(_tabsArray[index].windowId,{ state: "maximized" });
					} else {
						window.chrome.windows.update(_tabsArray[index].windowId,{ left: leftValue,
													top: rightValue,
													width: resize.width,
													height: resize.height,
													state: "normal"
												});
					}

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
					that.createNewWindow(tabId, leftValue, rightValue, resize.width, resize.height, incog, createNewWindowCB);
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
			var updateInfo = (_windowCb.state === 'maximized' && !resize.isMac) ? {focused: true,
								state: "maximized",
								incognito: _windowCb.incognito} : {left: _windowCb.left,
								top: _windowCb.top,
								width: _windowCb.width,
								height: _windowCb.height,
								focused: true,
								state: "normal",
								incognito: _windowCb.incognito};
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
	}
};