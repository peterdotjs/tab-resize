var optOut = localStorage.getItem("tracking-opt-out"),
	deferTracking = false;

if(optOut && optOut === 'true'){
	deferTracking = true;
}

function sendTracking(category, label) {
	if(!deferTracking && ga) {
		ga('send','event', category, 'clicked', label || "na");
	}
}

if(!deferTracking) {
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
	ga('send', 'pageview', '/index.html');
}
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
		badgeLimit: 7,
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

			if(!updateCount){
				localStorage.setItem('updateBadge',0);
				chrome.browserAction.setBadgeText({text:'NEW'});
				chrome.browserAction.setBadgeBackgroundColor({color:[221, 129, 39, 255]});
			}

			if(updateCount < resize.badgeLimit){
				localStorage.setItem('updateBadge',++updateCount);
				if(updateCount === resize.badgeLimit){
					chrome.browserAction.setBadgeText({text:''});
				}
			}

			var curVersion = localStorage.getItem('version') || '',
				isOldVersion = (curVersion < '2.2.0' && curVersion !== '');
			
			var $body = $('body');

			//user has never seen update
			if(!localStorage.getItem('update-seen') || isOldVersion){
				$body.addClass('update');
				if(isOldVersion){
					localStorage.removeItem('update-seen');
				} else if (!localStorage.getItem('warning-seen')) {
					$body.addClass('warning');
					resize.options.showWarningModal();
				}
				resize.options.showUpdateModal();
			}

			if(localStorage.getItem('update-seen') && updateCount === resize.badgeLimit && !localStorage.getItem('promo-seen')){
				$body.addClass('promo');
				resize.options.showPromoModal();
			}

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
								return backJs.util.processTabs(resize, resize.tabsArray, index, resize.currentTab.windowId, resize.singleTab, resize.currentTab.incognito, scaledOrientation);
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
/*
* custom_view.js
* handles custom view menu
*/
(function(){

	var resize = window.resize;

	var custom_view = {

		/**
		* hides custom view menu
		*/
		hideCustomMenu: function() {
			$('.custom-view').addClass('hidden');
			$('.main-view').removeClass('inactive');
			resize.util.clearCanvas();
		},

		/**
		* shows custom view menu
		*/
		showCustomMenu: function() {
			this.clearCustomValues();
			$('.layout-option #fixed').trigger('click');
			$('.main-view').addClass('inactive');
			$('.custom-view').removeClass('hidden').trigger('show');
			$('.custom-view input.row').focus();
		},

		/**
		* clears custom row and col values from input fields
		*/
		clearCustomValues: function(){
			$('#numRows').val('');
			$('#numCols').val('');
			$('#input-save').addClass('disabled');
		},

		/**
		* performs save of new layout
		*/
		handleCustomSave: function(){
			var option = $('.custom-view').hasClass('scaled') ? 'scaled' : 'fixed',
				layoutType;

			if(option === 'fixed'){
				var customRows = $('#numRows').val(),
					customCols = $('#numCols').val();

				this.clearCustomValues();

				if(!Number(customRows) || !Number(customCols) || Number(customRows) < 1 || Number(customCols) < 1){
					//window.alert('Please enter valid input values.');
				} else {
					layoutType = customRows + 'x' + customCols;
					resize.layout.addLayout(layoutType);
					resize.layout.processTabInfo($('.layout-' + layoutType));
					this.hideCustomMenu();
				}				
			} else {
				var orientation = getScaledOrientation(),
					scaledOption = getScaledOption();
				
				layoutType = scaledOption[0] + 'x' + scaledOption[1] + '-scale-' + orientation;
				resize.layout.addLayout(layoutType);
				resize.layout.processTabInfo($('.layout-' + layoutType));
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
		return $('#horizontal-scaled').attr('checked') ? 'horizontal' : 'vertical';
	}

	function getScaledOption(){
		return $('.scaled-input.selected').text().split(':');
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
							if(!resize.isMac){
								alert("Previous tabs were closed.");
							}
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
		* hides the update modal box
		*/
		hideUpdateModal: function() {
			$('body').removeClass('update');
			$('.main-view').removeClass('inactive');
			localStorage.setItem('update-seen',true);
			localStorage.setItem('version','2.2.0');
		},

		/**
		* shows the update modal box
		*/
		showUpdateModal: function() {
			$('#update-modal').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the promo modal box
		*/
		hidePromoModal: function() {
			$('body').removeClass('promo');
			$('.main-view').removeClass('inactive');
			localStorage.setItem('promo-seen',true);
		},

		/**
		* shows the promo modal box
		*/
		showPromoModal: function() {
			$('#promo-modal').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the warning modal box
		*/
		hideWarningModal: function() {
			$('body').removeClass('warning');
			localStorage.setItem('warning-seen',true);
		},

		/**
		* shows the warning modal box
		*/
		showWarningModal: function() {
			$('#warning-modal').trigger('show');
			$('.main-view').addClass('inactive');
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

	var layout = {

		updateLayoutStore: function(){
			var $layouts = $('.resize-selector'),
				length = $layouts.length,
				index = 0,
				currentLayouts = [];	

			for(;index<length;index++){
				currentLayouts.push($layouts.eq(index).attr('data-selector-type'));
			}

			resize.currentLayouts.layoutItems = currentLayouts;
			localStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
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
			localStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
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

			var container = $('.resize-container');
			var selectorTemplate = '<li class="resize-selector-container"><div class="close-button"></div><div class="layout-title">' + (layoutText || layoutType)  + '</div><div class="resize-selector ' + defaultSprite + '\" ' + 'data-selector-type=' + '\"'+ layoutType + '\"></div></li>';

			if(prepend){
				container.prepend(selectorTemplate);
			} else {
				container.append(selectorTemplate);
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
			localStorage.setItem('layoutItems',JSON.stringify(resize.currentLayouts));
			this._removeLayoutMarkup(layoutType);
		},

		/**
		* removes the layout markup from popup
		* @param {string} layoutType Type of layout (ROWxCOL).
		*/
		_removeLayoutMarkup: function(layoutType){
			var layoutSelector = '[data-selector-type="' + layoutType + '"]';
			$(layoutSelector).parent().remove();
		},

		/**
		* resets to default layouts
		*/
		resetLayout: function() {
			this._removeAllLayouts();
			localStorage.setItem('layoutItems',JSON.stringify(resize.defaultLayouts));
			resize.currentLayouts = $.extend(true,{},resize.defaultLayouts);
			resize.main_view.populateMainView();
			this.processTabInfo();
			resize.util.resetSortable();
		},

		/**
		* removes all current layouts
		*/
		_removeAllLayouts: function() {
			$('.resize-container').children().remove();
		},

		processTabInfo: function($layout){
			var tabs = resize.currentWindowTabs;
			var layoutList = $layout || $('.resize-container').find('.resize-selector-container .resize-selector'),
				length = 0,
				index = 0,
				$curLayout,
				layoutType,
				rows,
				cols,
				innerHtml,
				curTab,
				tabNumber;

			layoutList = layoutList.filter(function(){
				return !$(this).hasClass('layout-default');
			});

			length = layoutList.length;

			if(tabs && tabs.length > 0){
				//iterate through the current list of layout options
				for(;index<length;index++){
					innerHtml = '';
					$curLayout = layoutList.eq(index);

					if($curLayout.attr('data-selector-type').indexOf('scale') === -1){
						layoutType = $curLayout.attr('data-selector-type').split('x');
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

					$curLayout.html(innerHtml);
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
			var tabLayers = $('.resize-container').find('.tab-layer-' + i);
			tabLayers.addClass('valid-tab');
			for(var j=0;j<tabLayers.length; j++){
				if(curTab.favIconUrl && curTab.favIconUrl.indexOf('chrome://') !== 0){
					tabLayers.eq(j).find('.fav-icon').css('background-image','url("' + curTab.favIconUrl + '")');
				}
				tabLayers.eq(j).attr('title',curTab.title);
			}
		}
	}

	window.resize.layout = layout;

})();
/**
* utility.js
* general utility functions used for modal, canvas, etc.
*/
(function(){

	var util = {

		/**
		* Centers modal on page
		* @param {jQuery object} modal
		*/
		centerModal: function(modal) {
			modal.css({'margin-top':(modal.outerHeight()/2)*-1, 'margin-left':(modal.outerWidth()/2)*-1});
		},

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
			var canvas = $('canvas')[0];
			var context=canvas.getContext("2d");
			context.clearRect(0,0,context.canvas.width,context.canvas.height);
		},


		initSortable: function(){
			$('.sortable').sortable().on('sortupdate',function(){
				resize.layout.updateLayoutStore();
				sendTracking('dnd-event','dnd-label');
			});
			sortableInitialized = true;
		},

		resetSortable: function(){
			if(sortableInitialized){
				var $sortable = $('.sortable');
				$sortable.sortable('destroy');
				$sortable.sortable();
			}
		}

	};

	var sortableInitialized = false;

	window.resize.util = util;

})();
/*
* display.js
* handling display event handling and logic
*/
(function($){

	var resize = window.resize,
		scale = 0.15,
		offsetX = 0,
		offsetY = 0,
		defaultWidth = 530,
		defaultHeight = 250,
		$el;

	var displayUtil = {

		initialize: function(){
			if(chrome.system && chrome.system.display){
				resize.display = chrome.system.display;
			} else {
				return;
			}

			$el = $('#display-setting-layer');

			$el.on('click','.display-entry',function(evt){
				var $this = $(this),
					data = {},
					id = $this.data('id'),
					sz = $this.find('.display-meta').text();

				data[id] = true;
				$el.find('.display-entry').removeClass('selected');
				$this.addClass('selected');
				sendTracking('display-select',sz);
			});

			resize.display.getInfo(function(displayInfo){
				chrome.windows.getCurrent({populate:true},function(windowInfo){

					var currentWindowInfo = {
						left: windowInfo.left + windowInfo.width - 100,
						top: windowInfo.top + 100
					};

					var displayJSON = backJs.util.displayInfoFormatter(displayInfo,currentWindowInfo),
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
		var $displayLayer = $('#display-setting-layer');
		return {
			width: defaultWidth,
			height: defaultHeight
		};
	}

	function setDisplayHeight(scale,height){
		var $displayLayer = $('#display-setting-layer');
		$displayLayer.height(scale*height);
	}

	function renderDisplayTemplate(info, id, isPrimary){
		var $template = $('<div class="display-entry" title="Please select display to use."><div class="display-meta"></div></div>');
			$template.css({
				top: info.top*scale + offsetY,
				left: info.left*scale + offsetX,
				width: info.width*scale,
				height: info.height*scale
			}).data($.extend({id:id},info));

			$template.find('.display-meta').text(info.width + 'x' + info.height);

		if(isPrimary){
			$template.addClass('selected');
		}

		return $template;
	}

})(window.jQuery);
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
		displayUtil = resize.displayUtil,
		$doc = $(document);

	/*
	* events handlers
	*/

	$doc.ready(function(){
		main_view.initialize();
	}).on('click','.resize-selector-container',function(){
		var resizeSelector = $(this).children('.resize-selector'),
			resizeTypeStr = resizeSelector.attr('data-selector-type'),
            isScaled = (resizeTypeStr.indexOf('scale') !== -1),
            scaledResizeType = resizeTypeStr.split('-'),
            resizeType = (isScaled ? scaledResizeType[0]: resizeTypeStr.split('x')),
            orientation = (isScaled ? scaledResizeType[2] : null);
         
        main_view[isScaled ? 'resizeScaledTabs' : 'resizeTabs'](Number(resizeType[0]),Number(resizeType[1]), orientation);
		sendTracking('resize',resizeTypeStr);
		
	}).on('show','.modal-box', function(evt){
		evt.stopPropagation();
		util.centerModal($(this));
	}).on('click','.modal-box', function(evt){
		evt.stopPropagation();
	}).on('click','.close-button',function(evt){
		evt.stopPropagation();
		var resizeType = $(this).siblings('.resize-selector').attr('data-selector-type');
		layout.removeLayout(resizeType);
		sendTracking('resize-delete',resizeType);
	}).on('click','#undo-layout',function(){
		options.undoResize();
		sendTracking('undo','undo');
	}).on('click','#custom-layout',function(evt){
		evt.stopPropagation();
		custom_view.showCustomMenu();
		sendTracking('custom-layout','open');
	}).on('click','#default-configuration',function(evt){
		evt.stopPropagation();
		options.showConfirmationModal();
		sendTracking('default-layout','open');
	}).on('click','#confirmation-cancel',function(){
		options.hideConfirmationModal();
		sendTracking('default-layout','cancel');
	}).on('click','#confirmation-apply',function(){
		layout.resetLayout();
		options.hideConfirmationModal();
		sendTracking('default-layout','apply');
	}).on('click','#input-cancel,.main-view',function(){
		if(!$('.custom-view').hasClass('hidden')){
			custom_view.clearCustomValues();
			custom_view.hideCustomMenu();
			sendTracking('custom-layout','cancel');
		}
	}).on('click','#input-save',function(){
		custom_view.handleCustomSave();
		sendTracking('custom-layout','apply');
	}).on('click','body',function(){
		if(!$('.custom-view').hasClass('hidden')){
			util.clearCanvas();
			custom_view.hideCustomMenu();
			sendTracking('custom-layout','cancel-layer');
		}
		if(!$('.confirmation-modal').hasClass('hidden')){
			options.hideConfirmationModal();
			sendTracking('default-layout','cancel-layer');
		}
	}).on('keyup','#numRows, #numCols',function(evt){
		evt.stopPropagation();

		var canvas=document.getElementById("myCanvas");
		var context=canvas.getContext("2d");

		var numRows = Number($('#numRows').attr('value'));
		var numCols = Number($('#numCols').attr('value'));

		util.clearCanvas();

		if(numRows && numRows > 0 && numCols && numCols > 0){

			if(numRows > resize.canvasHeight/4){
				numRows = resize.canvasHeight/4;
			}

			if(numCols > resize.canvasWidth/4){
				numCols = resize.canvasWidth/4;
			}

			util.drawTable(resize.canvasWidth, resize.canvasHeight, numRows, numCols, context);
			$('#input-save').removeClass('disabled');
		} else {
			var $this = $(this),
				val = Number($this.attr('value'));

			if(val === 0 || isNaN(val)){
				$this.attr('value','');
				$('#input-save').addClass('disabled');
			}
		}
	}).on('change','#checkbox-single-tab', function(){
		var checked = $(this).attr('checked');
		options.processSingleTabSelection(checked);
		sendTracking('single-tab',checked ? "checked" : "unchecked");
	}).on('change','#checkbox-empty-tab', function(){
		var checked = $(this).attr('checked');
		options.processEmptyTabSelection(checked);
		sendTracking('empty-tab',checked ? "checked" : "unchecked");
	}).on('click','#display-setting', function(){
		var $display = $('.main-view'),
			isDisplayed;

		$display.toggleClass('display-selected');
		isDisplayed = $display.hasClass('display-selected');
		options.processDisplayLayerSelection(isDisplayed);
		sendTracking('display-settings',isDisplayed ? "opened" : "closed");
	}).on('click','#display-setting-layer .switch-toggle input',function(evt,deferTracking){
		var alignment = $(this).attr('id');
		$('#display-setting-layer .switch-toggle').removeClass('right-align left-align').addClass(alignment + '-align');
		options.processAlignmentSelection(alignment);
		if(!deferTracking){
			sendTracking('alignment',alignment);
		}
	}).on('click','#update-apply',function(){
		options.hideUpdateModal();
	}).on('click','#promo-apply',function(){
		options.hidePromoModal();
	}).on('click','#warning-apply',function(){
		options.hideWarningModal();
	}).on('click','.signature a',function(){
		if($(this).hasClass('rate-it')){
			sendTracking('info-links','rate-it');
		} else {
			sendTracking('info-links','author');
		}
	}).on('click','a.keyboard-shortcuts', function(){
		chrome.tabs.create({url:'chrome://extensions/configureCommands'});
	}).on('click','.custom-view .switch-toggle.layout-option input', function(){
		var option = $(this).attr('id'),
			changed = false,
			$customView = $('.custom-view');

		if(option === 'scaled' && !$customView.hasClass('scaled') || option !== 'scaled' && $customView.hasClass('scaled')){
			changed = true;
		}
			
		$customView[(option === 'scaled') ? 'addClass' : 'removeClass']('scaled');

		if(changed){
			util.clearCanvas();
			custom_view.clearCustomValues();
			if(option === 'scaled'){
				custom_view.showScaledMenu();		
			}
		}

	}).on('click', '.custom-view .scaled-input', function(){
		var $this = $(this);
		$('.custom-view .scaled-input').removeClass('selected');
		$this.addClass('selected');
		custom_view.showScaledMenu();
	}).on('click','.custom-view .switch-toggle.scaled-layout-orientation input', function(){
		custom_view.showScaledMenu();
	});

})();