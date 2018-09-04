/*
* options.js
* handles resize options (single tab, undo resize, default config)
*/
(function(){

	var resize = window.resize;
	var options = {

		/*
		* dismiss after select layout option
		*/

		/**
		* sets dismissAfter flag
		* @param {boolean} The hex ID.
		*/
		processDismissAfterSelection: function(dismissAfter) {
			console.log('dismiss after');
			var _dismissAfter = dismissAfter ? true : false;
			localStorage.setItem('dismissAfter',_dismissAfter);
			resize.dismissAfter = _dismissAfter;
			$('label.dismiss-after').toggleClass('selected');
			$('body').toggleClass('dismiss-after-selected');
		},

		/*
		* single tab option
		*/

		/**
		* sets singleTab flag
		* @param {boolean} The hex ID.
		*/
		processSingleTabSelection: function(singleTab) {
			var _singleTab = singleTab ? true : false;
			localStorage.setItem('singleTab',_singleTab);
			resize.singleTab = _singleTab;
			$('label.single-tab').toggleClass('selected');
			$('body').toggleClass('single-tab-selected');
		},

		/*
		* empty tab option
		*/

		/**
		* sets emptyTab flag
		* @param {boolean} The hex ID.
		*/
		processEmptyTabSelection: function(emptyTab) {
			var _emptyTab = emptyTab ? true : false;
			localStorage.setItem('emptyTab',_emptyTab);
			resize.emptyTab = _emptyTab;
			$('label.empty-tab').toggleClass('selected');
			$('body').toggleClass('empty-tab-not-selected');
		},

		/**
		* sets displayLayer flag
		* @param {boolean} The hex ID.
		*/
		processDisplayLayerSelection: function(displayLayer) {
			var _displayLayer = displayLayer ? true : false;
			localStorage.setItem('displayLayer',_displayLayer);
			resize.displayLayer = _displayLayer;
		},

		/**
		* sets aligmment flag
		* @param {String enum} left or right.
		*/
		processAlignmentSelection: function(alignment) {
			localStorage.setItem('alignment',alignment);
			resize.alignment = alignment;
			if(alignment === 'right'){
				$('body').addClass('align-right');
			} else {
				$('body').removeClass('align-right');
			}
		},

		/**
		* disabled undo button from user input
		*/
		disableUndoButton: function() {
			resize.lastTab = null;
			localStorage.removeItem('lastTab');
			$('#undo-layout').addClass('disabled');
		},

		/**
		* disabled undo button from user input
		*/
		enableUndoButton: function() {
			$('#undo-layout').removeClass('disabled');
		},

		/*
		* default configuration option
		*/

		/**
		* hides the default layout confirmation modal box
		*/
		hideConfirmationModal: function() {
			$('.main-view').removeClass('inactive');
			$('.confirmation-modal').addClass('hidden');
		},

		/**
		* shows the default layout confirmation modal box
		*/
		showConfirmationModal: function() {
			$('.confirmation-modal').removeClass('hidden').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the update modal box
		*/
		hideUpdateModal: function() {
			$('body').removeClass('update');
			$('.main-view').removeClass('inactive');
			localStorage.setItem('update-seen',true);
			localStorage.setItem('version','2.3.4');
		},

		/**
		* shows the update modal box
		*/
		showUpdateModal: function() {
			$('#update-modal').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the promo modal box
		*/
		hidePromoModal: function() {
			$('body').removeClass('promo');
			$('.main-view').removeClass('inactive');
			localStorage.setItem('promo-seen',true);
		},

		/**
		* shows the promo modal box
		*/
		showPromoModal: function() {
			$('#promo-modal').trigger('show');
			$('.main-view').addClass('inactive');
		},

		/**
		* hides the warning modal box
		*/
		hideWarningModal: function() {
			$('body').removeClass('warning');
			localStorage.setItem('warning-seen',true);
		},

		/**
		* shows the warning modal box
		*/
		showWarningModal: function() {
			$('#warning-modal').trigger('show');
			$('.main-view').addClass('inactive');
		}


	};

	window.resize.options = options;

})();
