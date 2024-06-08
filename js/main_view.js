/**
* main_view.js
* handles main view - bulk of resize functionality
*/
(function(){

	var resize = window.resize;

	function isEmpty(obj) {
		return Object.keys(obj).length === 0;
	}

	// convert dataset DOMMapString into Object with converted number values
	function processDataSet(dataSet) {
		var newDataSet = Object.assign({}, dataSet);
		for (const property in newDataSet) {
			var propValue = newDataSet[property];
			if (!isNaN(propValue)) {
				newDataSet[property] = Number(propValue);
			}
		}
		return newDataSet;
	}

	var main_view = {

		/**
		* initializes resize popup
		* populates the menu with list of layouts
		*/
		initialize: function() {

			chromeLocalStorage.getItem('layoutItems').then((currentLayouts) => {
				resize.currentLayouts = currentLayouts ? JSON.parse(currentLayouts) : null;
				if(!resize.currentLayouts){
					chromeLocalStorage.setItem('layoutItems',JSON.stringify(resize.defaultLayouts));
					resize.currentLayouts = Object.assign({}, resize.defaultLayouts);
				}
	
				this.populateMainView();
			});

			chromeLocalStorage.getItem('singleTab').then((singleTabValue) => {
				if(singleTabValue && singleTabValue === true){
					document.querySelector('#checkbox-single-tab').checked = true;
					document.querySelector('label.single-tab').classList.add('selected');
					document.querySelector('body').classList.add('single-tab-selected');
					resize.singleTab = true;
				}
			});
			
			//by default empty tab is checked to avoid any confusion
			chromeLocalStorage.getItem('emptyTab').then((emptyTabValue) => {
				if(emptyTabValue === undefined || emptyTabValue === true){
					document.querySelector('#checkbox-empty-tab').checked = true;
					document.querySelector('label.empty-tab').classList.add('selected');
					resize.emptyTab = true;
				} else {
					document.querySelector('body').classList.add('empty-tab-not-selected');
				}
			});

			chromeLocalStorage.getItem('displayLayer').then((displayLayerValue) => {
				if(displayLayerValue === undefined || displayLayerValue === true){
					document.querySelector('.main-view').classList.add('display-selected');
					resize.displayLayer = true;
				}
			});
			
			chromeLocalStorage.getItem('alignment').then((alignmentValue) => {
				if(!alignmentValue){
					resize.alignment = 'left';
				} else {
					resize.alignment = alignmentValue;
					if(resize.alignment !== 'left'){
						document.querySelector('body').classList.add('align-right');
					}
				}

				// const resizeAlignmentEvent = new CustomEvent('click', {detail: ['defer-tracking']});
				// document.querySelector('#' + resize.alignment).dispatchEvent(resizeAlignmentEvent);
				document.querySelector('#' + resize.alignment).checked = true;
			});

			resize.displayUtil.initialize();

			chromeLocalStorage.getItem('lastTab').then((lastTab) => {
				if(lastTab){
					document.querySelector('#undo-layout').classList.remove('disabled');
				}
			});

			chrome.runtime.onMessage.addListener(function(message){
				if(message === 'enable-undo'){
					resize.options.enableUndoButton();
				}
			});

			chromeLocalStorage.getItem('updateBadge').then((updateBadge) => {
				var updateCount = Number(updateBadge);
				chromeLocalStorage.getItem('version').then((version) => {
					var curVersion = version || '',
					isOldVersion = (curVersion < '2.3.4' && curVersion !== '');

					if(!updateCount || isOldVersion){
						updateCount = 0;
						chromeLocalStorage.setItem('updateBadge',0);
						chrome.action.setBadgeText({text:'NEW'});
						chrome.action.setBadgeBackgroundColor({color:[221, 129, 39, 255]});
					}

					if(updateCount < resize.badgeLimit){
						chromeLocalStorage.setItem('updateBadge',++updateCount);
						if(updateCount === resize.badgeLimit){
							chrome.action.setBadgeText({text:''});
						}
					} else {
						chrome.action.setBadgeText({text:''});
					}

					var $body = document.querySelector('body');

					//user has never seen update
					chromeLocalStorage.getItem('update-seen').then((updateSeen) => {
						if(!updateSeen || isOldVersion){
							$body.classList.add('update');
							if(isOldVersion){
								chromeLocalStorage.removeItem('update-seen');
								chromeLocalStorage.getItem('warning-seen').then((warningSeen) => {
									if (!warningSeen) {
										$body.classList.add('warning');
										resize.options.showWarningModal();
									}
								});
							}
							resize.options.showUpdateModal();
						}

						// chromeLocalStorage.getItem('promo-seen').then((promoSeen) => {
						// 	if(updateSeen && updateCount === resize.badgeLimit && !promoSeen){
						// 		$body.classList.add('promo');
						// 		resize.options.showPromoModal();
						// 	}
						// });
					});
				});
			});

			// $(function(){
			// 	resize.util.initSortable();
			// });
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
				document.querySelector('body').width(numSelectors * resize.maxSelectorContainerWidth );
			} else {
				document.querySelector('body').width(resize.maxSelectorsPerLine * resize.maxSelectorContainerWidth );
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
				// need to update
				document.querySelector('body').style.height = (document.querySelector('body').getBoundingClientRect().height - resize.maxSelectorContainerHeight) + 'px';
				document.querySelector('html').style.height = (document.querySelector('html').getBoundingClientRect().height - resize.maxSelectorContainerHeight) + 'px';
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
			var screenInfo =  processDataSet(document.querySelector('.display-entry.selected').dataset);
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

			var screenInfo =  processDataSet(document.querySelector('.display-entry.selected').dataset);
			setScaledResizeWidthHeight(screenInfo,primaryRatio, secondaryRatio, orientation);
			resizeTabHelper(screenInfo,orientation);
		}
	};

	function setScaledResizeWidthHeight(screenInfo, primaryRatio, secondaryRatio, orientation){
		if(!isEmpty(screenInfo)){
			resize.width = (orientation === 'horizontal') ? Math.round(screenInfo.width*0.1*primaryRatio) : screenInfo.width;
			resize.height = (orientation === 'horizontal') ? screenInfo.height : Math.round(screenInfo.height*0.1*primaryRatio);
		} else {
			resize.width = (orientation === 'horizontal') ? Math.round(window.screen.availWidth*0.1*primaryRatio) : window.screen.availWidth;
			resize.height = (orientation === 'horizontal') ? window.screen.availHeight : Math.round(window.screen.availHeight*0.1*primaryRatio);
		}
	}

	function setResizeWidthHeight(screenInfo, rows, cols){
		if(!isEmpty(screenInfo)){
			resize.width = Math.round(screenInfo.width/cols);
			resize.height = Math.round(screenInfo.height/rows);
		} else {
			resize.width = Math.round(window.screen.availWidth/cols);
			resize.height  = Math.round(window.screen.availHeight/rows);
		}
	}

	function resizeTabHelper(screenInfo, scaledOrientation){

		if(!isEmpty(screenInfo)){
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
					async function (tab) {
						resize.currentTab = tab[0];
						var index = resize.currentTab.index;
						if(tab.length > 1){
							resize.tabsArray = tab;
							index = 0;
						}

						var cb = async function(){
							await chrome.runtime.sendMessage({
								type: "processTabs",
								resize: resize,
								tabsArray: resize.tabsArray,
								startIndex: index,
								windowId: resize.currentTab.windowId,
								singleTab: resize.singleTab,
								incog: resize.currentTab.incognito,
								scaledOrientation: scaledOrientation,
							  });
						};
						
						if(resize.singleTab){
							await chrome.runtime.sendMessage({
								type: "setUndoStorage",
								resize: resize,
								tabIndex: resize.currentTab.index,
								windowId: resize.currentTab.windowId,
								tabsArray: resize.tabsArray.slice(index,index + 1)
							  }, cb);


						} else {
							await chrome.runtime.sendMessage({
								type: "setUndoStorage",
								resize: resize,
								tabIndex: resize.currentTab.index,
								windowId: resize.currentTab.windowId,
								tabsArray: resize.tabsArray.slice(index)
							  }, null, cb);
						}

					}
				);
			}
		);
	}

	window.resize.main_view = main_view;

})();
