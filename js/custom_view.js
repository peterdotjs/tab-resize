/*
* custom_view.js
* handles custom view menu
*/
(function(){

	function val(el) {
		if (el.options && el.multiple) {
		  return el.options
			.filter((option) => option.selected)
			.map((option) => option.value);
		} else {
		  return el.value;
		}
	}

	var resize = window.resize;

	var custom_view = {

		/**
		* hides custom view menu
		*/
		hideCustomMenu: function() {
			document.querySelector('.custom-view').classList.add('hidden');
			document.querySelector('.main-view').classList.remove('inactive');
			resize.util.clearCanvas();
		},

		/**
		* shows custom view menu
		*/
		showCustomMenu: function() {
			this.clearCustomValues();
			document.querySelector('.layout-option #fixed').click();
			document.querySelector('.main-view').classList.add('inactive');
			document.querySelector('.custom-view').classList.remove('hidden');//.trigger('show');
			// document.querySelector('.custom-view input.row').focus();
		},

		/**
		* clears custom row and col values from input fields
		*/
		clearCustomValues: function(){
			document.querySelector('#numRows').value = '';
			document.querySelector('#numCols').value = '';
			document.querySelector('#input-save').classList.add('disabled');
		},

		/**
		* performs save of new layout
		*/
		handleCustomSave: function(){
			var option = document.querySelector('.custom-view').classList.contains('scaled') ? 'scaled' : 'fixed',
				layoutType;

			if(option === 'fixed'){
				var customRows = document.querySelector('#numRows').value,
					customCols = document.querySelector('#numCols').value;

				this.clearCustomValues();

				if(!Number(customRows) || !Number(customCols) || Number(customRows) < 1 || Number(customCols) < 1){
					//window.alert('Please enter valid input values.');
				} else {
					layoutType = customRows + 'x' + customCols;
					resize.layout.addLayout(layoutType);
					resize.layout.processTabInfo(document.querySelector('.layout-' + layoutType));
					this.hideCustomMenu();
				}				
			} else {
				var orientation = getScaledOrientation(),
					scaledOption = getScaledOption();
				
				layoutType = scaledOption[0] + 'x' + scaledOption[1] + '-scale-' + orientation;
				resize.layout.addLayout(layoutType);
				resize.layout.processTabInfo(document.querySelector('.layout-' + layoutType));
				this.hideCustomMenu();
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
		return document.querySelector('#horizontal-scaled').checked ? 'horizontal' : 'vertical';
	}

	function getScaledOption(){
		return document.querySelector('.scaled-input.selected').textContent.split(':');
	}

	window.resize.custom_view = custom_view;

})();