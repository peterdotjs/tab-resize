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

        main_view[isScaled ? 'resizeScaledTabs' : 'resizeTabs'](Number(resizeType[0]),Number(resizeType[1]), orientation);
		sendTracking('resize',resizeTypeStr);

	});

	addEventListener(document,'click','.modal-box', function(evt){
		evt.stopPropagation();
	});

	// fixme
	addEventListener(document.querySelector('.resize-container'),'click','.close-button',function(evt){
		evt.stopPropagation();
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
		document.querySelectorAll('.custom-view .scaled-input').forEach((input) => {
			input.classList.remove('selected');
		});
		$this.classList.add('selected');
		custom_view.showScaledMenu();
		sendTracking('custom-layout',$this.value);
	});
	
	addEventListener(document,'click','.custom-view .switch-toggle.scaled-layout-orientation input', function(evt){
		custom_view.showScaledMenu();
		sendTracking('custom-layout',evt.target.getAttribute('id'));
	});

})();
