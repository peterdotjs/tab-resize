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

			this.populateMainView();

			var dismissAfterValue = localStorage.getItem('dismissAfter');
			if(dismissAfterValue && dismissAfterValue === 'true'){
				$('#checkbox-dismiss-after').attr('checked',true);
				$('label.dismiss-after').addClass('selected');
				$('body').addClass('dismiss-after-selected');
				resize.dismissAfter = true;
			}

			var singleTabValue = localStorage.getItem('singleTab');
			if(singleTabValue && singleTabValue === 'true'){
				$('#checkbox-single-tab').attr('checked',true);
				$('label.single-tab').addClass('selected');
				$('body').addClass('single-tab-selected');
				resize.singleTab = true;
			}

			//by default empty tab is checked to avoid any confusion
			var emptyTabValue = localStorage.getItem('emptyTab');
			if(!emptyTabValue || emptyTabValue === 'true'){
				$('#checkbox-empty-tab').attr('checked',true);
				$('label.empty-tab').addClass('selected');
				resize.emptyTab = true;
			} else {
				$('body').addClass('empty-tab-not-selected');
			}

			var displayLayerValue = localStorage.getItem('displayLayer');
			if(!displayLayerValue || displayLayerValue === 'true'){
				$('.main-view').addClass('display-selected');
				resize.displayLayer = true;
			}

			var alignmentValue = localStorage.getItem('alignment');
			if(!alignmentValue){
				resize.alignment = 'left';
			} else {
				resize.alignment = alignmentValue;
				if(resize.alignment !== 'left'){
					$('body').addClass('align-right');
				}
			}
			$('#' + resize.alignment).trigger('click',['defer-tracking']);


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

			var updateCount = Number(localStorage.getItem('updateBadge'));

			var curVersion = localStorage.getItem('version') || '',
					isOldVersion = (curVersion < '2.3.4' && curVersion !== '');

			if(!updateCount || isOldVersion){
				updateCount = 0;
				localStorage.setItem('updateBadge',0);
				chrome.browserAction.setBadgeText({text:'NEW'});
				chrome.browserAction.setBadgeBackgroundColor({color:[221, 129, 39, 255]});
			}

			if(updateCount < resize.badgeLimit){
				localStorage.setItem('updateBadge',++updateCount);
				if(updateCount === resize.badgeLimit){
					chrome.browserAction.setBadgeText({text:''});
				}
			} else {
				chrome.browserAction.setBadgeText({text:''});
			}

			var $body = $('body');

			//user has never seen update
			if(!localStorage.getItem('update-seen') || isOldVersion){
				$body.addClass('update');
				if(isOldVersion){
					localStorage.removeItem('update-seen');
					if (!localStorage.getItem('warning-seen')) {
						$body.addClass('warning');
						resize.options.showWarningModal();
					}
				}
				resize.options.showUpdateModal();
			}

			// if(localStorage.getItem('update-seen') && updateCount === resize.badgeLimit && !localStorage.getItem('promo-seen')){
			// 	$body.addClass('promo');
			// 	resize.options.showPromoModal();
			// }

			$(function(){
				resize.util.initSortable();
			});
		},

		/**
		* populate main view with local storage data
		*/
		populateMainView: function() {
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

			var screenInfo = $('.display-entry.selected').data();
			setResizeWidthHeight(screenInfo,resize.numRows,resize.numCols);
			resizeTabHelper(screenInfo);
		},

		/**
		* resizes tabs to the right of selected tab
		* @param {number} primaryRatio ratio of the first tab
		* @param {number} secondaryRatio ratio of second tab
		* @param {string} orientation - veritcal or horizontal
		*/
		resizeScaledTabs: function(primaryRatio, secondaryRatio, orientation){

			resize.numRows = (orientation === 'horizontal' ? 1 : 2);
			resize.numCols = (orientation === 'horizontal' ? 2 : 1);

			/*
			* split width of screen based on the primary and secondary ratios
			*/

			var screenInfo = $('.display-entry.selected').data();
			setScaledResizeWidthHeight(screenInfo,primaryRatio, secondaryRatio, orientation);
			resizeTabHelper(screenInfo,orientation);
		}
	};

	function setScaledResizeWidthHeight(screenInfo, primaryRatio, secondaryRatio, orientation){
		if(!$.isEmptyObject(screenInfo)){
			resize.width = (orientation === 'horizontal') ? Math.round(screenInfo.width*0.1*primaryRatio) : screenInfo.width;
			resize.height = (orientation === 'horizontal') ? screenInfo.height : Math.round(screenInfo.height*0.1*primaryRatio);
		} else {
			resize.width = (orientation === 'horizontal') ? Math.round(window.screen.availWidth*0.1*primaryRatio) : window.screen.availWidth;
			resize.height = (orientation === 'horizontal') ? window.screen.availHeight : Math.round(window.screen.availHeight*0.1*primaryRatio);
		}
	}

	function setResizeWidthHeight(screenInfo, rows, cols){
		if(!$.isEmptyObject(screenInfo)){
			resize.width = Math.round(screenInfo.width/cols);
			resize.height = Math.round(screenInfo.height/rows);
		} else {
			resize.width = Math.round(window.screen.availWidth/cols);
			resize.height  = Math.round(window.screen.availHeight/rows);
		}
	}

	function resizeTabHelper(screenInfo, scaledOrientation){

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
								return backJs.util.processTabs(resize, resize.tabsArray, index, resize.currentTab.windowId, resize.singleTab, resize.dismissAfter, resize.currentTab.incognito, scaledOrientation);
						};
						if(resize.singleTab){
							backJs.util.setUndoStorage(resize,resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(index,index + 1), cb);
						} else {
							backJs.util.setUndoStorage(resize,resize.currentTab.index,resize.currentTab.windowId, resize.tabsArray.slice(index), cb);
						}

					}
				);
			}
		);
	}

	window.resize.main_view = main_view;

})();
