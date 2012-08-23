/**
* main_view.js
* handles main view - bulk of resize functionality
*/
(function(){
	
	var resize = window.resize;
	
	var main_view = {

		/**
		* initializes resize popup 
		* populates the menu with list of layouts
		*/	
		initialize: function() {
			resize.currentLayouts = JSON.parse(localStorage.getItem('layoutItems'));
			if(!resize.currentLayouts){
				resize.storage.setItem('layoutItems',JSON.stringify(resize.defaultLayouts));
				resize.currentLayouts = $.extend(true,{},resize.defaultLayouts);
			}
			this.initWindowWidth();
			this._populateMainView();
			
			var singleTabValue = resize.storage.getItem('singleTab');
			if(singleTabValue && singleTabValue === 'true'){
				$('#checkbox-single-tab').attr('checked',true);
				resize.singleTab = true;
			}
			
			if(resize.storage.getItem('lastTab')){
				$('#undo-layout').removeClass('disabled');
			}
		},	

		/**
		* populate main view with local storage data
		*/			
		_populateMainView: function() {
			for(var x=0; x<resize.currentLayouts.layoutItems.length; x++){
				resize.layout.addLayoutMarkup(resize.currentLayouts.layoutItems[x],false);
			}
		},

		/**
		* initializes popup width depending on number of layout elements
		*/			
		initWindowWidth: function() {
			var numSelectors = resize.currentLayouts.layoutItems.length;
			if(numSelectors < resize.maxSelectorsPerLine){
				$('body').width(numSelectors * resize.maxSelectorContainerWidth );		
			} else {
				$('body').width(resize.maxSelectorsPerLine * resize.maxSelectorContainerWidth );
			}
		},
	
		/**
		* adjusts the popup height accordingly as layout elements are removed
		*/	
		checkWindowHeight: function() {
			var numSelectors = resize.currentLayouts.layoutItems.length;
			var removedRow = numSelectors % resize.maxSelectorsPerLine;
			if(numSelectors >=5 && removedRow === 0){
				$('body').height($('body').height() - resize.maxSelectorContainerHeight);		
				$('html').height($('html').height() - resize.maxSelectorContainerHeight);	
			}
		},
	
		/**
		* resizes tabs to the right of selected tab
		* @param {number} rows number of rows in resize layout
		* @param {number} cols number of columns in resize layout
		*/	
		resizeTabs: function(rows,cols) {
		
			resize.numRows = rows;
			resize.numCols = cols;
			
			/*
			* split width of screen equally depending on number of cells
			* create new window unable to take non integers for width and height
			*/
			resize.width = Math.round(window.screen.availWidth/resize.numCols);
			resize.height  = Math.round(window.screen.availHeight/resize.numRows);	
			var that = this;
			window.chrome.tabs.query({currentWindow: true}, 
				function (tabs) {
					resize.tabsArray = tabs;
						window.chrome.tabs.query({currentWindow: true, active: true}, 
							function (tab) {
								resize.currentTab = tab[0];
								if(resize.singleTab){
									that._setUndoStorage(resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(resize.currentTab.index,resize.currentTab.index + 1));
								} else {
									that._setUndoStorage(resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(resize.currentTab.index));
								}
								that._processTabs(resize.tabsArray, resize.currentTab.index, resize.singleTab);
							}
						);
				}
			);	
		},
	
		/**
		* iterates through tab array to create layout
		* @param {array} tabsArray array of tab objects to be moved
		* @param {number} startIndex index of selected tab in window
		* @param {boolean} singleTab flag of single tab option
		*/	
		_processTabs: function(tabsArray, startIndex, singleTab) {

			var tabIndex = startIndex;
			var endOfArray = singleTab;
			
			for(var y=0; y<resize.numRows; y++){
				for(var x=0; x<resize.numCols; x++){
					if(x === 0 && y === 0){
						window.chrome.windows.update(tabsArray[tabIndex].windowId,{ left: x*resize.width, 
																			top: y*resize.height,
																			width: resize.width,
																			height: resize.height});
					} else {
						resize.util.createNewWindow(tabsArray[tabIndex].id, x*resize.width, y*resize.height );
					}
					tabIndex ++;
					if(tabIndex === tabsArray.length){
						endOfArray = true;
					}
					if(endOfArray){
						return;
					}	
				}
			}			
		},
	
		/**
		* set storage of last window and tabs being moved
		* @param {number} tabIndex Starting tab index in previous window of first tab 
		* @param {number} windowId Id of the previous window object which was modified
		* @param {array} tabsArray Array of tab objects to be moved back to the previous window
		*/
		_setUndoStorage: function(tabIndex,windowId, tabsArray) {
			window.chrome.windows.get(windowId,{},function(window){
				var updateInfo = {left: window.left,
									top: window.top,
									width: window.width,
									height: window.height,
									focused: true,
									state: window.state};
				var lastTab = {};
				lastTab.lastWindowInfo = updateInfo;
				lastTab.lastTabIndex = tabIndex;
				lastTab.lastWindowId = windowId;
				var tabsStore = [];
				for(var x=0; x<tabsArray.length && x<(resize.numRows * resize.numCols); x++){
					tabsStore.push(tabsArray[x].id);
				}
				lastTab.lastTabsArray = tabsStore;
				resize.storage.setItem('lastTab',JSON.stringify(lastTab));
				$('#undo-layout').removeClass('disabled');
			});
		}
	};
	
	window.resize.main_view = main_view;
	
})();