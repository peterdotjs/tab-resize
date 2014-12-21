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