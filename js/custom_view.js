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
			var option = $('.custom-view').hasClass('scaled') ? 'scaled' : 'fixed';

			if(option === 'fixed'){
				var customRows = $('#numRows').val(),
					customCols = $('#numCols').val();

				this.clearCustomValues();

				if(!Number(customRows) || !Number(customCols) || Number(customRows) < 1 || Number(customCols) < 1){
					//window.alert('Please enter valid input values.');
				} else {
					var layoutType = customRows + 'x' + customCols;
					resize.layout.addLayout(layoutType);
					resize.layout.processTabInfo($('.layout-' + layoutType));
					this.hideCustomMenu();
				}				
			} else {
				var orientation = getScaledOrientation(),
					option = getScaledOption();
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