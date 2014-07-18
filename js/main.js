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
		$doc = $(document);
	
	/*
	* events handlers
	*/
	
	$doc.ready(function(){
		main_view.initialize();
	}).on('click','.resize-selector-container',function(){
		var resizeSelector = $(this).children('.resize-selector');
		var resizeType = resizeSelector.attr('data-selector-type').split('x');
		layout.addLayout(resizeSelector.attr('data-selector-type'));
		main_view.resizeTabs(Number(resizeType[0]),Number(resizeType[1]));
	}).on('show','.modal-box', function(evt){
		evt.stopPropagation();
		util.centerModal($(this));
	}).on('click','.modal-box', function(evt){
		evt.stopPropagation();
	}).on('click','.close-button',function(evt){
		evt.stopPropagation();
		layout.removeLayout($(this).siblings('.resize-selector').attr('data-selector-type'));
		main_view.initWindowWidth();
		main_view.checkWindowHeight();
	}).on('click','#undo-layout',function(){
		options.undoResize();
	}).on('click','#custom-layout',function(evt){
		evt.stopPropagation();
		custom_view.showCustomMenu();
	}).on('click','#default-configuration',function(evt){
		evt.stopPropagation();
		options.showConfirmationModal();
	}).on('click','#confirmation-cancel',function(){
		options.hideConfirmationModal();
	}).on('click','#confirmation-apply',function(){
		layout.resetLayout();
		util.reloadWindow();
	}).on('click','#input-cancel,.main-view',function(){
		if(!$('.custom-view').hasClass('hidden')){
			custom_view.clearCustomValues();
			util.clearCanvas();
			custom_view.hideCustomMenu();
		}
	}).on('click','#input-save',function(){
		custom_view.handleCustomSave();
	}).on('click','body',function(){
		if(!$('.custom-view').hasClass('hidden')){
			util.clearCanvas();
			custom_view.hideCustomMenu();
		}
		if(!$('.confirmation-modal').hasClass('hidden')){
			options.hideConfirmationModal();
		}
	}).on('click','#custom-layout',function(evt){
		evt.stopPropagation();
		custom_view.showCustomMenu();
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
		}	
	}).on('change','#checkbox-single-tab', function(){
		if($(this).attr('checked')){
			options.processSingleTabSelection(true);
		} else {
			options.processSingleTabSelection(false);
		}
	});

})();