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
					id = $this.dataset.id;
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

		$template.dataset = {
			id,
			...info,
		};

		$template.querySelector('.display-meta').textContent = info.width + 'x' + info.height;

		if(isPrimary){
			$template.classList.add('selected');
		}

		return $template;
	}

})(window.jQuery);