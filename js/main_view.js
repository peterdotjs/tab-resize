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
				localStorage.setItem('layoutItems',JSON.stringify(resize.defaultLayouts));
				resize.currentLayouts = $.extend(true,{},resize.defaultLayouts);
			}
			//this.initWindowWidth();
			this._populateMainView();

			var singleTabValue = localStorage.getItem('singleTab');
			if(singleTabValue && singleTabValue === 'true'){
				$('#checkbox-single-tab').attr('checked',true);
				$('label.single-tab').addClass('selected');
				resize.singleTab = true;
			}

			var emptyTabValue = localStorage.getItem('emptyTab');
			if(emptyTabValue && emptyTabValue === 'true'){
				$('#checkbox-empty-tab').attr('checked',true);
				$('label.empty-tab').addClass('selected');
				resize.emptyTab = true;
			}

			var displayLayerValue = localStorage.getItem('displayLayer');
			if(!displayLayerValue || displayLayerValue === 'true'){
				$('#display-setting').removeClass('hidden-layer');
				$('#display-setting-layer').removeClass('hidden');
				$('.main-view').addClass('display-selected');
				resize.displayLayerValue = true;
			}

			resize.displayUtil.initialize();

			if(localStorage.getItem('lastTab')){
				$('#undo-layout').removeClass('disabled');
			}

			window.backJs = chrome.extension.getBackgroundPage();

			chrome.runtime.onMessage.addListener(function(message){
				if(message === 'enable-undo'){
					resize.options.enableUndoButton();
				}
			});
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
		* TODO: Fix for display layer case
		* adjusts the popup height accordingly as layout elements are removed
		*/
		checkWindowHeight: function() {
			debugger;
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

			var data = $('.display-entry.selected').data();

			if(!$.isEmptyObject(data)){
				resize.width = Math.round(data.width/resize.numCols);
				resize.height = Math.round(data.height/resize.numRows);
				resize.offsetX = data.left;
				resize.offsetY = data.top;
			} else {
				resize.width = Math.round(window.screen.availWidth/resize.numCols);
				resize.height  = Math.round(window.screen.availHeight/resize.numRows);
				resize.offsetX = 0;
				resize.offsetY = 0;
			}

			var that = this;
			window.chrome.tabs.query({currentWindow: true},
				function (tabs) {
					resize.tabsArray = tabs;
						window.chrome.tabs.query({currentWindow: true, active: true},
							function (tab) {
								resize.currentTab = tab[0];
								if(resize.singleTab){
									backJs.util.setUndoStorage(resize,resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(resize.currentTab.index,resize.currentTab.index + 1));
								} else {
									backJs.util.setUndoStorage(resize, resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(resize.currentTab.index));
								}
								backJs.util.processTabs(resize, resize.tabsArray, resize.currentTab.index, resize.currentTab.windowId, resize.singleTab, resize.currentTab.incognito);
							}
						);
				}
			);
		}
	};

	window.resize.main_view = main_view;

})();