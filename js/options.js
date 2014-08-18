/*
* options.js
* handles resize options (single tab, undo resize, default config)
*/
(function(){

	var resize = window.resize;
	var options = {

		/*
		* single tab option
		*/

		/**
		* sets singleTab flag
		* @param {boolean} The hex ID.
		*/
		processSingleTabSelection: function(singleTab) {
			var _singleTab = singleTab ? true : false;
			localStorage.setItem('singleTab',_singleTab);
			resize.singleTab = _singleTab;
			$('label.single-tab').toggleClass('selected');
			$('body').toggleClass('single-tab-selected');
		},

		/*
		* empty tab option
		*/

		/**
		* sets emptyTab flag
		* @param {boolean} The hex ID.
		*/
		processEmptyTabSelection: function(emptyTab) {
			var _emptyTab = emptyTab ? true : false;
			localStorage.setItem('emptyTab',_emptyTab);
			resize.emptyTab = _emptyTab;
			$('label.empty-tab').toggleClass('selected');
			$('body').toggleClass('empty-tab-not-selected');
		},

		/**
		* sets displayLayer flag
		* @param {boolean} The hex ID.
		*/
		processDisplayLayerSelection: function(displayLayer) {
			var _displayLayer = displayLayer ? true : false;
			localStorage.setItem('displayLayer',_displayLayer);
			resize.displayLayer = _displayLayer;
		},

		/**
		* sets aligmment flag
		* @param {String enum} left or right.
		*/
		processAlignmentSelection: function(alignment) {
			localStorage.setItem('alignment',alignment);
			resize.alignment = alignment;
			if(alignment === 'right'){
				$('body').addClass('align-right');
			} else {
				$('body').removeClass('align-right');
			}
		},

		/*
		* undo previous resize option
		*/

		/**
		* undo the previous resize that was selected
		*/
		undoResize: function() {
			var that = this;
			resize.lastTab = JSON.parse(localStorage.getItem('lastTab'));
			var tabIndex = resize.lastTab.lastTabIndex;
			var windowId = resize.lastTab.lastWindowId;
			var tabsArray = resize.lastTab.lastTabsArray;

			window.chrome.windows.get(windowId, {}, function(window){
				if(window){
					that.recombineTabs(tabIndex,windowId,tabsArray);
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
								that.recombineTabs(1,window.id,newTabsArray.slice(1));
							});
						} else {
							alert("Previous tabs were closed.");
							that.disableUndoButton();
						}
					});
				}
			});
		},

		/**
		* recombine the tabs into one window
		* @param {number} tabIndex Starting tab index in previous window of first tab
		* @param {number} windowId Id of final window holding recombined tabs
		* @param {array} tabsArray Array of tab objects to be moved back to the previous window
		*/
		recombineTabs: function(tabIndex, windowId, tabsArray) {
			var indexCounter = tabIndex;
			// for(var index=0; index<tabsArray.length; index++){
			// 	window.chrome.tabs.move(tabsArray[index],{windowId: windowId, index: indexCounter});
			// 	indexCounter++;
			// }
			window.chrome.tabs.move(tabsArray,{windowId: windowId, index: indexCounter});
			var updateInfo = resize.lastTab.lastWindowInfo;
			var updateInfoForUpdate = $.extend(true, {}, updateInfo);
			delete updateInfoForUpdate.incognito;
			window.chrome.windows.update(windowId,updateInfoForUpdate);
			this.disableUndoButton();
		},

		/**
		* disabled undo button from user input
		*/
		disableUndoButton: function() {
			resize.lastTab = null;
			localStorage.removeItem('lastTab');
			$('#undo-layout').addClass('disabled');
		},

		/**
		* disabled undo button from user input
		*/
		enableUndoButton: function() {
			$('#undo-layout').removeClass('disabled');
		},

		/*
		* default configuration option
		*/

		/**
		* hides the default layout confirmation modal box
		*/
		hideConfirmationModal: function() {
			$('.main-view').removeClass('inactive');
			$('.confirmation-modal').addClass('hidden');
		},

		/**
		* shows the default layout confirmation modal box
		*/
		showConfirmationModal: function() {
			$('.confirmation-modal').removeClass('hidden').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the default layout confirmation modal box
		*/
		hideUpdateModal: function() {
			$('body').removeClass('update');
			$('.main-view').removeClass('inactive');
			localStorage.setItem('update-seen',true);
		},

		/**
		* shows the default layout confirmation modal box
		*/
		showUpdateModal: function() {
			$('#update-modal').trigger('show');
			$('.main-view').addClass('inactive');
		}

	};

	window.resize.options = options;

})();