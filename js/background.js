

if(localStorage){
	var updateBadge = localStorage.getItem('updateBadge');
	if(!updateBadge){
		localStorage.setItem('updateBadge',0)
		chrome.browserAction.setBadgeText({text:'new'})
	}
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
		window.chrome.windows.create({tabId: tabId,
								left: startX,
								top: startY,
								width: width,
								height: height,
								incognito: incog},
								function(_windowCb){
									callback(_windowCb);
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
			emptyWindowLimit = (resize.numRows * resize.numCols) - _tabsArray.length,
			that = this,
			leftValue,
			rightValue;

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
					window.chrome.windows.update(_tabsArray[index].windowId,{ left: leftValue,
																		top: rightValue,
																		width: resize.width,
																		height: resize.height});

					if(singleTab){
						return;
					}
				} else { //otherwise we create a new window
					tabId = _tabsArray[index] ? _tabsArray[index].id : null;
					//when no more tabs avaiable and option to create empty tab is not checked
					if(!tabId && !resize.emptyTab){
						return;
					}

					//check the number of new windows that will be created
					//store the windowId information
					that.createNewWindow(tabId, leftValue, rightValue, resize.width, resize.height, incog, function(_windowCb){
						//only if update storage when tab option is used
						if(!tabId && resize.emptyTab){
							_tabsArray.push(_windowCb.tabs[0]);
							numEmptyWindows++;
							if(emptyWindowLimit === numEmptyWindows){
								that.updateUndoStorage(resize, windowId, _tabsArray);
							}

						}
					});
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
	setUndoStorage: function(resize, tabIndex, windowId, tabsArray) {
		window.chrome.windows.get(windowId,{},function(_windowCb){
			var updateInfo = {left: _windowCb.left,
								top: _windowCb.top,
								width: _windowCb.width,
								height: _windowCb.height,
								focused: true,
								//state: _windowCb.state, //removing as should not specify state when using left top width or height
								incognito: _windowCb.incognito};
			var lastTab = {};
			lastTab.lastWindowInfo = updateInfo;
			lastTab.lastTabIndex = tabIndex;
			lastTab.lastWindowId = windowId;
			var tabsStore = [];
			for(var x=0; x<tabsArray.length && x<(resize.numRows * resize.numCols); x++){
				tabsStore.push(tabsArray[x].id);
			}
			lastTab.lastTabsArray = tabsStore;
			localStorage.setItem('lastTab',JSON.stringify(lastTab));
			chrome.runtime.sendMessage('enable-undo');
		});
	},

	/**
	* set storage of last window and tabs being moved
	* @param {object} resize object from foreground
	* @param {number} windowId Id of the previous window object which was modified
	* @param {array} tabsArray Array of tab objects to be moved back to the previous window
	*/
	updateUndoStorage: function(resize, windowId, tabsArray) {
		window.chrome.windows.get(windowId,{},function(_windowCb){
			var currentLastTab = JSON.parse(localStorage.getItem('lastTab'));
			var lastTab = currentLastTab;
			var tabsStore = [];
			for(var x=0; x<tabsArray.length && x<(resize.numRows * resize.numCols); x++){
				tabsStore.push(tabsArray[x].id);
			}
			lastTab.lastTabsArray = tabsStore;
			localStorage.setItem('lastTab',JSON.stringify(lastTab));
			chrome.runtime.sendMessage('enable-undo');
		});
	}
};