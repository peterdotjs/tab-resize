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
		},
		
		/**
		* shows custom view menu
		*/	
		showCustomMenu: function() {
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
		},

		/**
		* performs save of new layout
		*/	
		handleCustomSave: function(){
			var customRows = $('#numRows').val();
			var customCols = $('#numCols').val();
			
			this.clearCustomValues();
			
			if(!Number(customRows) || !Number(customCols) || Number(customRows) < 1 || Number(customCols) < 1){
				window.alert('Please enter valid input values.');
			} else {
				var layoutType = customRows + 'x' + customCols;
				resize.layout.addLayout(layoutType);
				this.hideCustomMenu();
				resize.main_view.initWindowWidth();
				resize.util.reloadWindow();
			}
		}

	};
	
	window.resize.custom_view = custom_view;
	
})();