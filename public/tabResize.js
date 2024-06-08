/*
* local_storage.js
* localStorage API mirror
*/
(function(){
	/*
	* localStorage object
	* @constructor
	*/
	var localStorage = {
		getAllItems: () => chrome.storage.local.get(),
		getItem: async key => (await chrome.storage.local.get(key))[key],
		setItem: (key, val) => chrome.storage.local.set({[key]: val}),
		removeItem: keys => chrome.storage.local.remove(keys),
	};

	window.chromeLocalStorage = localStorage;

})();



var deferTracking = false;

chromeLocalStorage.getItem("tracking-opt-out").then((optOut)=> {
	if(optOut && optOut === 'true'){
		deferTracking = true;
	}
});

function sendTracking(category, label) {
	// if(!deferTracking && ga) {
	// 	ga('send','event', category, 'clicked', label || "na");
	// }
}

// if(!deferTracking) {
// 	// Standard Google Universal Analytics code
// 	/* jshint ignore:start */
// 	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// 	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// 	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// 	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
// 	/* jshint ignore:end */
// 	ga('create', 'UA-34217520-2', 'auto');
// 	ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
// 	ga('require', 'displayfeatures');
// 	ga('send', 'pageview', '/index.html');
// }
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
		main_view: {},
		custom_view: {},
		options: {},
		util: {},
		badgeLimit: 2,
		isMac: navigator.platform.toUpperCase().indexOf('MAC')!==-1
	};

	window.resize = resize;

})();

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

/*
* custom_view.js
* handles custom view menu
*/
(function(){

	function val(el) {
		if (el.options && el.multiple) {
		  return el.options
			.filter((option) => option.selected)
			.map((option) => option.value);
		} else {
		  return el.value;
		}
	}

	var resize = window.resize;

	var custom_view = {

		/**
		* hides custom view menu
		*/
		hideCustomMenu: function() {
			document.querySelector('.custom-view').classList.add('hidden');
			document.querySelector('.main-view').classList.remove('inactive');
			resize.util.clearCanvas();
		},

		/**
		* shows custom view menu
		*/
		showCustomMenu: function() {
			this.clearCustomValues();
			document.querySelector('.layout-option #fixed').click();
			document.querySelector('.main-view').classList.add('inactive');
			document.querySelector('.custom-view').classList.remove('hidden');//.trigger('show');
			// document.querySelector('.custom-view input.row').focus();
		},

		/**
		* clears custom row and col values from input fields
		*/
		clearCustomValues: function(){
			document.querySelector('#numRows').value = '';
			document.querySelector('#numCols').value = '';
			document.querySelector('#input-save').classList.add('disabled');
		},

		/**
		* performs save of new layout
		*/
		handleCustomSave: function(){
			var option = document.querySelector('.custom-view').classList.contains('scaled') ? 'scaled' : 'fixed',
				layoutType;

			if(option === 'fixed'){
				var customRows = document.querySelector('#numRows').value,
					customCols = document.querySelector('#numCols').value;

				this.clearCustomValues();

				if(!Number(customRows) || !Number(customCols) || Number(customRows) < 1 || Number(customCols) < 1){
					//window.alert('Please enter valid input values.');
				} else {
					layoutType = customRows + 'x' + customCols;
					resize.layout.addLayout(layoutType);
					resize.layout.processTabInfo(document.querySelector('.layout-' + layoutType));
					this.hideCustomMenu();
				}				
			} else {
				var orientation = getScaledOrientation(),
					scaledOption = getScaledOption();
				
				layoutType = scaledOption[0] + 'x' + scaledOption[1] + '-scale-' + orientation;
				resize.layout.addLayout(layoutType);
				resize.layout.processTabInfo(document.querySelector('.layout-' + layoutType));
				this.hideCustomMenu();
			}

		},

		/**
		* shows the scaled menu view 
		*/
		showScaledMenu: function(){
			var orientation = getScaledOrientation(),
				option = getScaledOption(),
				canvas=document.getElementById("myCanvas"),
				context=canvas.getContext("2d");

			resize.util.clearCanvas();

			resize.util.drawScaledTable(resize.canvasWidth, resize.canvasHeight, option[0], orientation, context);
		}

	};

	function getScaledOrientation(){
		return document.querySelector('#horizontal-scaled').checked ? 'horizontal' : 'vertical';
	}

	function getScaledOption(){
		return document.querySelector('.scaled-input.selected').textContent.split(':');
	}

	window.resize.custom_view = custom_view;

})();
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
			chromeLocalStorage.setItem('singleTab',_singleTab);
			resize.singleTab = _singleTab;
			document.querySelector('label.single-tab').classList.toggle('selected');
			document.querySelector('body').classList.toggle('single-tab-selected');
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
			chromeLocalStorage.setItem('emptyTab',_emptyTab);
			resize.emptyTab = _emptyTab;
			document.querySelector('label.empty-tab').classList.toggle('selected');
			document.querySelector('body').classList.toggle('empty-tab-not-selected');
		},

		/**
		* sets displayLayer flag
		* @param {boolean} The hex ID.
		*/
		processDisplayLayerSelection: function(displayLayer) {
			debugger;
			var _displayLayer = displayLayer ? true : false;
			chromeLocalStorage.setItem('displayLayer',_displayLayer);
			resize.displayLayer = _displayLayer;
		},

		/**
		* sets aligmment flag
		* @param {String enum} left or right.
		*/
		processAlignmentSelection: function(alignment) {
			chromeLocalStorage.setItem('alignment',alignment);
			resize.alignment = alignment;
			if(alignment === 'right'){
				document.querySelector('body').classList.add('align-right');
			} else {
				document.querySelector('body').classList.remove('align-right');
			}
		},

		/**
		* disabled undo button from user input
		*/
		disableUndoButton: function() {
			resize.lastTab = null;
			chromeLocalStorage.removeItem('lastTab');
			document.querySelector('#undo-layout').classList.add('disabled');
		},

		/**
		* disabled undo button from user input
		*/
		enableUndoButton: function() {
			document.querySelector('#undo-layout').classList.remove('disabled');
		},

		/*
		* default configuration option
		*/

		/**
		* hides the default layout confirmation modal box
		*/
		hideConfirmationModal: function() {
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('.confirmation-modal').classList.add('hidden');
			document.querySelector('.confirmation-modal').style.display = 'none';
		},

		/**
		* shows the default layout confirmation modal box
		*/
		showConfirmationModal: function() {
			document.querySelector('.confirmation-modal').classList.remove('hidden');
			document.querySelector('.confirmation-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the update modal box
		*/
		hideUpdateModal: function() {
			document.querySelector('body').classList.remove('update');
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('#update-modal').style.display = 'none';
			chromeLocalStorage.setItem('update-seen',true);
			chromeLocalStorage.setItem('version','2.3.4');
		},

		/**
		* shows the update modal box
		*/
		showUpdateModal: function() {
			document.querySelector('#update-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the promo modal box
		*/
		hidePromoModal: function() {
			document.querySelector('body').classList.remove('promo');
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('#promo-modal').style.display = 'none';
			chromeLocalStorage.setItem('promo-seen',true);
		},

		/**
		* shows the promo modal box
		*/
		showPromoModal: function() {
			document.querySelector('#promo-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the warning modal box
		*/
		hideWarningModal: function() {
			document.querySelector('body').classList.remove('warning');
			chromeLocalStorage.setItem('warning-seen',true);
		},

		/**
		* shows the warning modal box
		*/
		showWarningModal: function() {
			document.querySelector('#warning-modal').style.display = 'block'; // .trigger('show');
			document.querySelector('.main-view').classList.add('inactive');
		}


	};

	window.resize.options = options;

})();

/*
* layout.js
* adds/removes layout from popup
*/
(function(){

	var resize = window.resize;

	function faviconURL(u) {
		const url = new URL(chrome.runtime.getURL("/_favicon/"));
		url.searchParams.set("pageUrl", u);
		url.searchParams.set("size", "32");
		return url.toString();
	}
	  
	var layout = {

		updateLayoutStore: function(){
			var $layouts = document.querySelector('.resize-selector'),
				length = $layouts.length,
				index = 0,
				currentLayouts = [];	

			for(;index<length;index++){
				currentLayouts.push($layouts.eq(index).getAttribute('data-selector-type'));
			}

			resize.currentLayouts.layoutItems = currentLayouts;
			chromeLocalStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
		},

		/**
		* adds layout to popup
		* @param {string} layoutType Type of layout (ROWxCOL).
		*/
		addLayout: function(layoutType) {
			var layoutList = resize.currentLayouts.layoutItems,
				layoutIndex = layoutList.indexOf(layoutType);

			if(layoutIndex !== -1){
				layoutList.splice(layoutIndex,1);
				this._removeLayoutMarkup(layoutType);
			}

			resize.currentLayouts.layoutItems.unshift(layoutType);
			chromeLocalStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
			this.addLayoutMarkup(layoutType,true);
			resize.util.resetSortable();
		},

		/**
		* adds layout markup to popup
		* @param {string} layoutType Type of layout (ROWxCOL).
		* @param {boolean} prepend Prepend layout to layout container if true, appends if false
		* @param {string} layoutText Label Text for layout - default takes layoutType
		*/
		addLayoutMarkup: function(layoutType, prepend) {

			var defaultSprite = "layout-default",
				layoutText = '';

			if(resize.layoutSprites.layoutItems.indexOf(layoutType) !== -1 || layoutType === '1x1'){
				defaultSprite = "layout-" + layoutType;
			}

			if(layoutType.indexOf('scale') !== -1){
				layoutText = layoutType.split('-')[0].split('x').join(':');
			}

			var container = document.querySelector('.resize-container');
			var selectorTemplate = '<li class="resize-selector-container"><div class="close-button"></div><div class="layout-title">' + (layoutText || layoutType)  + '</div><div class="resize-selector ' + defaultSprite + '\" ' + 'data-selector-type=' + '\"'+ layoutType + '\"></div></li>';
			var divWrapper = document.createElement('div');
			divWrapper.innerHTML = selectorTemplate;

			if(prepend){
				container.prepend(divWrapper);
			} else {
				container.append(divWrapper);
			}
		},

		/**
		* removes the layout from popup
		* @param {string} layoutType Type of layout (ROWxCOL).
		*/
		removeLayout: function(layoutType){
			var layoutList = resize.currentLayouts.layoutItems,
				layoutIndex = layoutList.indexOf(layoutType);

			layoutList.splice(layoutIndex,1);
			chromeLocalStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
			this._removeLayoutMarkup(layoutType);
		},

		/**
		* removes the layout markup from popup
		* @param {string} layoutType Type of layout (ROWxCOL).
		*/
		_removeLayoutMarkup: function(layoutType){
			var layoutSelector = '[data-selector-type="' + layoutType + '"]';
			document.querySelector(layoutSelector).parentNode.remove();
		},

		/**
		* resets to default layouts
		*/
		resetLayout: function() {
			this._removeAllLayouts();
			chromeLocalStorage.setItem('layoutItems',JSON.stringify(resize.defaultLayouts));
			// resize.currentLayouts = $.extend(true,{},resize.defaultLayouts);
			resize.currentLayouts = Object.assign({}, resize.defaultLayouts);
			debugger;
			resize.main_view.populateMainView();
			this.processTabInfo();
			resize.util.resetSortable();
		},

		/**
		* removes all current layouts
		*/
		_removeAllLayouts: function() {
			document.querySelector('.resize-container').replaceChildren();
		},

		processTabInfo: function($layout){
			var tabs = resize.currentWindowTabs;
			var layoutList = Array.from ($layout || document.querySelectorAll('.resize-container .resize-selector-container .resize-selector')),
				length = 0,
				index = 0,
				$curLayout,
				layoutType,
				rows,
				cols,
				innerHtml,
				curTab,
				tabNumber;

			layoutList = layoutList.filter(function($){
				return !$.classList.contains('layout-default');
			});

			length = layoutList.length;

			if(tabs && tabs.length > 0){
				//iterate through the current list of layout options
				for(;index<length;index++){
					innerHtml = '';
					$curLayout = layoutList[index];

					if($curLayout.getAttribute('data-selector-type').indexOf('scale') === -1){
						layoutType = $curLayout.getAttribute('data-selector-type').split('x');
						rows = layoutType[0];
						cols = layoutType[1];
						tabNumber = 1;
						for(var y=0; y<rows; y++){
							for(var x=0; x<cols; x++){
								//add in markup - styles will be added in less
								innerHtml += '<div title="New Tab" class="tab-layer tab-layer-'+ (tabNumber++) + '"><div class="fav-icon"></div></div>';
							}
						}						
					} else {
						innerHtml += '<div title="New Tab" class="tab-layer tab-layer-1"><div class="fav-icon"></div></div>' + '<div title="New Tab" class="tab-layer tab-layer-2"><div class="fav-icon"></div></div>';
					}

					$curLayout.innerHTML = innerHtml;
				}

				//find the selected and add the urls
				for(index=0;index<tabs.length;index++){
					curTab = tabs[index];
					if(curTab.highlighted){
						processSelectedTab(curTab,index,tabs);
						break;
					}
				}
			}
		}
	};

	function processSelectedTab(curTab,index,tabs){
		for(var i=1;index<tabs.length && i<5;index++,i++){
			curTab = tabs[index];
			var tabLayers = document.querySelectorAll('.resize-container .tab-layer-' + i);
			tabLayers.forEach((tabLayer) => {
				tabLayer.classList.add('valid-tab');
			})
		
			for(var j=0;j<tabLayers.length; j++){
				if(curTab.favIconUrl && curTab.favIconUrl.indexOf('chrome://') !== 0){
					var favIcon = tabLayers[j].querySelector('.fav-icon');
					favIcon.style.backgroundImage = 'url("' + faviconURL(curTab.url) + '")';
				}
				tabLayers[j].setAttribute('title',curTab.title);
			}
		}
	}

	window.resize.layout = layout;

})();
/**
* utility.js
* general utility functions used for modal, canvas, etc.
*/

function addEventListener(el, eventName, selector, eventHandler) {
	if (selector) {
	  const wrappedHandler = (e) => {
		if (!e.target) return;
		const el = e.target.closest(selector);
		if (el) {
		  eventHandler.call(el, e);
		}
	  };
	  el.addEventListener(eventName, wrappedHandler);
	  return wrappedHandler;
	} else {
	  const wrappedHandler = (e) => {
		eventHandler.call(el, e);
	  };
	  el.addEventListener(eventName, wrappedHandler);
	  return wrappedHandler;
	}
  }

(function(){

	var util = {

		/**
		* draws a table using canvas
		* @param {Number} width - width of table
		* @param {Number} height - height of table
		* @param {Number} rows - number of rows of table
		* @param {Number} cols - number of cols of table
		* @param {CanvasRenderingContext2D} context - 2D context of canvas object
		*/
		drawTable: function(width, height, rows, cols, context) {

			context.beginPath();

			var xOff = width/cols;
			var yOff = height/rows;

			//draw horizontal lines
			for(var rowIndex = 1; rowIndex < rows; rowIndex++){
				context.moveTo(0,yOff*rowIndex);
				context.lineTo(height,yOff*rowIndex);
			}

			//draw vertical lines
			for(var colIndex = 1; colIndex < cols; colIndex++){
				context.moveTo(xOff*colIndex,0);
				context.lineTo(xOff*colIndex,width);
			}

			context.closePath();
			context.stroke();
		},

		/**
		* draws a scaled table using canvas
		* @param {Number} width - width of table
		* @param {Number} height - height of table
		* @param {Number} scale - percentage of first col/row
		* @param {String} orientation - "vertical" or "horizontal" 
		* @param {CanvasRenderingContext2D} context - 2D context of canvas object
		*/
		drawScaledTable: function(width, height, scale, orientation, context) {

			context.beginPath();

			var offSet = width*(0.1)*scale;

			if(orientation === 'horizontal'){
				context.moveTo(offSet,0);
				context.lineTo(offSet,width);
			} else {
				context.moveTo(0,offSet);
				context.lineTo(height,offSet);
			}

			context.closePath();
			context.stroke();
		},

		/**
		* clears the canvas of previous drawing
		*/
		clearCanvas: function() {
			var canvas = document.querySelector('canvas');
			var context=canvas.getContext("2d");
			context.clearRect(0,0,context.canvas.width,context.canvas.height);
		},


		initSortable: function(){
			document.querySelector('.sortable').sortable().on('sortupdate',function(){
				resize.layout.updateLayoutStore();
				sendTracking('dnd-event','dnd-label');
			});
			sortableInitialized = true;
		},

		resetSortable: function(){
			if(sortableInitialized){
				var $sortable = document.querySelector('.sortable');
				$sortable.sortable('destroy');
				$sortable.sortable();
			}
		},

		addEventListener: addEventListener,
		
	};

	var sortableInitialized = false;

	window.resize.util = util;

})();
/*
* display.js
* handling display event handling and logic
*/
(function(){

	var resize = window.resize,
		scale = 0.15,
		offsetX = 0,
		offsetY = 0,
		defaultWidth = 530,
		defaultHeight = 250,
		$el;


	function displayInfoFormatter(displayInfo,currentWindowInfo){
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
	};


	var displayUtil = {

		initialize: function(){
			if(chrome.system && chrome.system.display){
				resize.display = chrome.system.display;
			} else {
				return;
			}

			$el = document.querySelector('#display-setting-layer');

			resize.util.addEventListener($el,'click','.display-entry',function(evt){
				var $this = evt.target,
					data = {},
					id = Number($this.dataset.id);
					sz = $this.querySelector('.display-meta').textContent;

				data[id] = true;
				$el.querySelectorAll('.display-entry').forEach((entry) => {
					entry.classList.remove('selected');
				});
				$this.classList.add('selected');
				sendTracking('display-select',sz);
			});

			resize.display.getInfo(function(displayInfo){
				chrome.windows.getCurrent({populate:true},function(windowInfo){

					var currentWindowInfo = {
						left: windowInfo.left + windowInfo.width - 100,
						top: windowInfo.top + 100
					};

					var displayJSON = displayInfoFormatter(displayInfo,currentWindowInfo),
						template,
						currentDisplay;

					processAutoFormat(displayJSON);

					for(var i=0; i<displayJSON.displays.length; i++){
						currentDisplay = displayJSON.displays[i];
						template = renderDisplayTemplate(currentDisplay.workArea, currentDisplay.id, displayJSON.primaryIndex === i);
						$el.append(template);
					}
					//need to start building the dom display
					chrome.tabs.query({currentWindow: true, highlighted: true},
						function (tabs) {
							if(tabs.length > 1){
								resize.currentWindowTabs = tabs;
							} else {
								resize.currentWindowTabs = windowInfo.tabs;
							}				
							resize.layout.processTabInfo();
					});
				});
			});
			//event handling for selecting the display
		}
	};

	resize.displayUtil = displayUtil;

	function processAutoFormat(displayJSON){
		var displays = displayJSON.displays;
		var leastLeft = null,
			mostLeft = null,
			leastTop = null,
			mostTop = null,
			totalWidth,
			totalHeight,
			scaleX,
			scaleY,
			index = 0,
			length = displays.length,
			currentDisplay;

		for(;index<length;index++){
			currentDisplay = displays[index].workArea;
			if(leastLeft === null || leastLeft > currentDisplay.left){
				leastLeft = currentDisplay.left;
			}

			if(mostLeft === null || mostLeft < currentDisplay.left + currentDisplay.width){
				mostLeft = currentDisplay.left + currentDisplay.width;
			}

			if(leastTop === null || leastTop > currentDisplay.top){
				leastTop = currentDisplay.top;
			}

			if(mostTop === null || mostTop < currentDisplay.top + currentDisplay.height){
				mostTop = currentDisplay.top + currentDisplay.height;
			}
		}

		totalWidth = mostLeft - leastLeft;
		totalHeight = mostTop - leastTop;

		availableArea = getAvailableArea();

		scaleX = availableArea.width/totalWidth;
		scaleY = availableArea.height/totalHeight;

		scale = (scaleX < scaleY) ? scaleX : scaleY;

		offsetX = (leastLeft !== 0) ? (leastLeft)*-1*scale : 0;
		offsetY = (leastTop !== 0) ? (leastTop)*-1*scale : 0;

		setDisplayHeight(scale,totalHeight);
	}

	function getAvailableArea(){
		var $displayLayer = document.querySelector('#display-setting-layer');
		return {
			width: defaultWidth,
			height: defaultHeight
		};
	}

	function setDisplayHeight(scale,height){
		var $displayLayer = document.querySelector('#display-setting-layer');
		$displayLayer.style.height = scale*height + 'px';
	}

	function renderDisplayTemplate(info, id, isPrimary){
		var $template = document.createElement('div');
		$template.classList.add('display-entry');
		$template.setAttribute('title', 'Please select display to use.');
		$template.innerHTML = '<div class="display-meta"></div></div>';
		
		$template.style.cssText = 
			'top: ' + Number(info.top*scale + offsetY) + 'px; ' +
			'left: ' + Number(info.left*scale + offsetX) + 'px; ' +
			'width: ' + Number(info.width*scale) + 'px; ' +
			'height: ' + Number(info.height*scale) + 'px';		

		for (const property in info) {
			$template.dataset[property] = info[property];
		}

		$template.dataset.id = id;

		$template.querySelector('.display-meta').textContent = info.width + 'x' + info.height;

		if(isPrimary){
			$template.classList.add('selected');
		}

		return $template;
	}

})();
/**
* main.js
* initialization and event handlers
*/
(function(){

	var resize = window.resize,
		main_view = resize.main_view,
		custom_view = resize.custom_view,
		util = resize.util,
		layout = resize.layout,
		options = resize.options,
		displayUtil = resize.displayUtil;

	/*
	* events handlers
	*/

	function ready(fn) {
		if (document.readyState !== 'loading') {
		  fn();
		} else {
		  document.addEventListener('DOMContentLoaded', fn);
		}
	}

	function addEventListener(el, eventName, selector, eventHandler) {
		if (selector) {
		  const wrappedHandler = (e) => {
			if (!e.target) return;
			const el = e.target.closest(selector);
			if (el) {
			  eventHandler.call(el, e);
			}
		  };
		  el.addEventListener(eventName, wrappedHandler);
		  return wrappedHandler;
		} else {
		  const wrappedHandler = (e) => {
			eventHandler.call(el, e);
		  };
		  el.addEventListener(eventName, wrappedHandler);
		  return wrappedHandler;
		}
	  }

	ready(function(){
		main_view.initialize();
	});
	
	addEventListener(document,'click','.resize-selector-container',function(evt){
		evt.stopPropagation();
		var resizeSelector = evt.target.closest('.resize-selector-container').querySelector('.resize-selector'),
			resizeTypeStr = resizeSelector.getAttribute('data-selector-type'),
            isScaled = (resizeTypeStr.indexOf('scale') !== -1),
            scaledResizeType = resizeTypeStr.split('-'),
            resizeType = (isScaled ? scaledResizeType[0]: resizeTypeStr.split('x')),
            orientation = (isScaled ? scaledResizeType[2] : null);

		debugger;

        main_view[isScaled ? 'resizeScaledTabs' : 'resizeTabs'](Number(resizeType[0]),Number(resizeType[1]), orientation);
		sendTracking('resize',resizeTypeStr);

	});

	addEventListener(document,'click','.modal-box', function(evt){
		evt.stopPropagation();
	});

	// fixme
	addEventListener(document.querySelector('.resize-container'),'click','.close-button',function(evt){
		evt.stopPropagation();
		debugger;
		var closeButton = evt.target.closest('.close-button');
		if (closeButton) {
			var resizeType = closeButton.parentNode.querySelector('.resize-selector').getAttribute('data-selector-type');
			layout.removeLayout(resizeType);
			sendTracking('resize-delete',resizeType);
		}
	});
	
	addEventListener(document,'click','#undo-layout', async function(){
		// backJs.util.undoResize(resize,options.disableUndoButton);
		await chrome.runtime.sendMessage({
			type: "undoResize",
			resize: resize,
		  }, null, options.disableUndoButton.bind(this));
		sendTracking('undo','undo');
	});

	document.querySelector('#custom-layout').addEventListener('click', (evt) => {
		evt.stopPropagation();
		custom_view.showCustomMenu();
		sendTracking('custom-layout','open');
	});

	document.querySelector('#default-configuration').addEventListener('click', (evt) => {
		evt.stopPropagation();
		options.showConfirmationModal();
		sendTracking('default-layout','open');
	});
	
	document.querySelector('#confirmation-cancel').addEventListener('click', (evt) => {
		evt.stopPropagation();
		options.hideConfirmationModal();
		sendTracking('default-layout','cancel');
	});
	
	document.querySelector('#confirmation-apply').addEventListener('click', (evt) => {
		evt.stopPropagation();
		layout.resetLayout();
		options.hideConfirmationModal();
		sendTracking('default-layout','apply');
	});
	
	document.querySelector('#input-cancel').addEventListener('click', (evt) => {
		if(!document.querySelector('.custom-view').classList.contains('hidden')){
			custom_view.clearCustomValues();
			custom_view.hideCustomMenu();
			sendTracking('custom-layout','cancel');
		}
	});

	// addEventListener(document,'click','#input-cancel,.main-view',function(evt){
	// 	evt.stopPropagation();
	// 	if(!document.querySelector('.custom-view').classList.contains('hidden')){
	// 		custom_view.clearCustomValues();
	// 		custom_view.hideCustomMenu();
	// 		sendTracking('custom-layout','cancel');
	// 	}
	// });

	document.querySelector('#input-save').addEventListener('click', (evt) => {
		evt.stopPropagation();
		custom_view.handleCustomSave();
		sendTracking('custom-layout','apply');
	});

	addEventListener(document,'click','body',function(evt){
		if(evt.target.closest('.custom-view')) {
			return;
		}

		if(!document.querySelector('.custom-view').classList.contains('hidden')){
			util.clearCanvas();
			custom_view.hideCustomMenu();
			sendTracking('custom-layout','cancel-layer');
		}
		if(!document.querySelector('.confirmation-modal').classList.contains('hidden')){
			options.hideConfirmationModal();
			sendTracking('default-layout','cancel-layer');
		}
	});
	
	addEventListener(document,'keyup','#numRows, #numCols',function(evt){

		var canvas=document.getElementById("myCanvas");
		var context=canvas.getContext("2d");

		var numRows = Number(document.querySelector('#numRows').value);
		var numCols = Number(document.querySelector('#numCols').value);

		util.clearCanvas();

		if(numRows && numRows > 0 && numCols && numCols > 0){

			if(numRows > resize.canvasHeight/4){
				numRows = resize.canvasHeight/4;
			}

			if(numCols > resize.canvasWidth/4){
				numCols = resize.canvasWidth/4;
			}

			util.drawTable(resize.canvasWidth, resize.canvasHeight, numRows, numCols, context);
			document.querySelector('#input-save').classList.remove('disabled');
		} else {
			var $this = evt.target,
				val = Number($this.value);

			if(val === 0 || isNaN(val)){
				$this.value = '';
				document.querySelector('#input-save').classList.add('disabled');
			}
		}
	});

	document.querySelector('#checkbox-single-tab').addEventListener('change', (evt) => {
		evt.stopPropagation();
		var checked = evt.target.checked;
		options.processSingleTabSelection(checked);
		sendTracking('single-tab',checked ? "checked" : "unchecked");
	});
	
	document.querySelector('#checkbox-empty-tab').addEventListener('change', (evt) => {
		evt.stopPropagation();
		var checked = evt.target.checked;
		options.processEmptyTabSelection(checked);
		sendTracking('empty-tab',checked ? "checked" : "unchecked");
	});
	
	document.querySelector('#display-setting').addEventListener('click', (evt) => {
		evt.stopPropagation();
		var $display = document.querySelector('.main-view'),
			isDisplayed;

		$display.classList.toggle('display-selected');
		isDisplayed = $display.classList.contains('display-selected');
		debugger;
		options.processDisplayLayerSelection(isDisplayed);
		sendTracking('display-settings',isDisplayed ? "opened" : "closed");
	});
	
	document.querySelectorAll('#display-setting-layer .switch-toggle input').forEach((input)=> {
		input.addEventListener('click', (evt, deferTracking) => {
			evt.stopPropagation();
			var alignment = evt.target.getAttribute('id');
			var $toggle = document.querySelector('#display-setting-layer .switch-toggle')
			$toggle.classList.remove('right-align','left-align');
			$toggle.classList.add(alignment + '-align');
			options.processAlignmentSelection(alignment);
			if(!deferTracking){
				sendTracking('alignment',alignment);
			}
		});
	})

	document.querySelector('#update-apply').addEventListener('click', (evt) => {
		options.hideUpdateModal();
	});

	// document.querySelector('#promo-apply').addEventListener('click', (evt) => {
	// 	evt.stopPropagation();
	// 	options.hidePromoModal();
	// });

	document.querySelector('#warning-apply').addEventListener('click', (evt) => {
		evt.stopPropagation();
		options.hideWarningModal();
	});
	
	addEventListener(document,'click','.track-me a',function(evt){
		evt.stopPropagation();
		var $this = evt.target;
		if($this.classList.contains('rate-it')){
			sendTracking('info-links','rate-it');
		} else if ($this.classList.contains('options')) {
			sendTracking('info-links','options');
		} else if ($this.classList.contains('author')) {
			sendTracking('info-links','author');
		} else {
			sendTracking('info-links','keyboard-shortcuts');
		}
	});
	
	addEventListener(document,'click','a.keyboard-shortcuts', function(){
		chrome.tabs.create({url:'chrome://extensions/configureCommands'});
	});
	
	addEventListener(document,'click','.custom-view .switch-toggle.layout-option input', function(evt){
		evt.stopPropagation();
		var option = evt.target.getAttribute('id'),
			changed = false,
			$customView = document.querySelector('.custom-view');

		if(option === 'scaled' && !$customView.classList.contains('scaled') || option !== 'scaled' && $customView.classList.contains('scaled')){
			changed = true;
		}

		$customView.classList[(option === 'scaled') ? 'add' : 'remove']('scaled');

		if(changed){
			util.clearCanvas();
			custom_view.clearCustomValues();
			if(option === 'scaled'){
				custom_view.showScaledMenu();
			}
			sendTracking('custom-layout',option);
		}

	});
	
	addEventListener(document,'click', '.custom-view .scaled-input', function(evt){
		var $this = evt.target;
		document.querySelector('.custom-view .scaled-input').classList.remove('selected');
		$this.classList.add('selected');
		custom_view.showScaledMenu();
		sendTracking('custom-layout',$this.value);
	});
	
	addEventListener(document,'click','.custom-view .switch-toggle.scaled-layout-orientation input', function(evt){
		custom_view.showScaledMenu();
		sendTracking('custom-layout',evt.target.getAttribute('id'));
	});

})();
