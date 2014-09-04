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
			resizeType = resizeTypeStr.split('x');

		main_view.resizeTabs(Number(resizeType[0]),Number(resizeType[1]));
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
		$('.switch-toggle').removeClass('right-align left-align').addClass(alignment + '-align');
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
	});

})();