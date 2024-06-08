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