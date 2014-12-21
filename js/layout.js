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
		*/
		addLayoutMarkup: function(layoutType, prepend) {

			var defaultSprite = "layout-default";

			if(resize.layoutSprites.layoutItems.indexOf(layoutType) !== -1 || layoutType === '1x1'){
				defaultSprite = "layout-" + layoutType;
			}

			var container = $('.resize-container');
			var selectorTemplate = '<li class="resize-selector-container" tabindex="1" role="button"><div class="close-button"></div><div class="layout-title">' + layoutType + '</div><div class="resize-selector ' + defaultSprite + '\" ' + 'data-selector-type=' + '\"'+ layoutType + '\"></div></li>';

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