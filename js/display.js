/*
* display.js
* handling display event handling and logic
*/
(function($){

	var resize = window.resize,
		scale = 0.15,
		$el;

	var displayUtil = {

		initialize: function(){
			if(chrome.system && chrome.system.display){
				resize.display = chrome.system.display;
			} else {
				return;
			}

			$el = $('#display-setting-layer');

			resize.display.getInfo(function(displayInfo){
				var displayJSON = processInfo(displayInfo);
				var template;

				for(var i=0; i<displayJSON.displays.length; i++){
					template = renderDisplayTemplate(displayJSON.displays[i].workArea);

					$el.append(template);
				}
				//need to start building the dom display
			});

			//event handling for selecting the display
			//
		}
	};

	resize.displayUtil = displayUtil;

	//format the displayInfo
	function processInfo(displayInfo){
		var index = 0,
			length = displayInfo.length,
			info,
			displayJSON = { //may need to check for some mirroring property, currently only one monitor is display when mirroring
				displays: [],
				primaryIndex: 0
			};

		for(;index<length;index++){
			info = displayInfo[index];
			displayJSON.displays.push({
				workArea: info.workArea,
				isEnabled: info.isEnabled
			});
			if(info.isPrimary){
				displayJSON.primaryIndex = index;
			}
		}
		return displayJSON;
	}

	function renderDisplayTemplate(info){
		var $template = $('<div class="display-entry"></div>');
			$template.css({
				top: info.top*scale,
				left: info.left*scale,
				width: info.width*scale,
				height: info.height*scale
			}).data(info);

		return $template;
	}

})(window.jQuery);