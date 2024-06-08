/*
* options.js
* handles resize options (single tab, undo resize, default config)
*/

(function(){

	var resize = window.resize;
	var options = {

		/*
		* single tab option
		*/

		/**
		* sets singleTab flag
		* @param {boolean} The hex ID.
		*/
		processSingleTabSelection: function(singleTab) {
			var _singleTab = singleTab ? true : false;
			chromeLocalStorage.setItem('singleTab',_singleTab);
			resize.singleTab = _singleTab;
			document.querySelector('label.single-tab').classList.toggle('selected');
			document.querySelector('body').classList.toggle('single-tab-selected');
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
			chromeLocalStorage.setItem('emptyTab',_emptyTab);
			resize.emptyTab = _emptyTab;
			document.querySelector('label.empty-tab').classList.toggle('selected');
			document.querySelector('body').classList.toggle('empty-tab-not-selected');
		},

		/**
		* sets displayLayer flag
		* @param {boolean} The hex ID.
		*/
		processDisplayLayerSelection: function(displayLayer) {
			var _displayLayer = displayLayer ? true : false;
			chromeLocalStorage.setItem('displayLayer',_displayLayer);
			resize.displayLayer = _displayLayer;
		},

		/**
		* sets aligmment flag
		* @param {String enum} left or right.
		*/
		processAlignmentSelection: function(alignment) {
			chromeLocalStorage.setItem('alignment',alignment);
			resize.alignment = alignment;
			if(alignment === 'right'){
				document.querySelector('body').classList.add('align-right');
			} else {
				document.querySelector('body').classList.remove('align-right');
			}
		},

		/**
		* disabled undo button from user input
		*/
		disableUndoButton: function() {
			resize.lastTab = null;
			chromeLocalStorage.removeItem('lastTab');
			document.querySelector('#undo-layout').classList.add('disabled');
		},

		/**
		* disabled undo button from user input
		*/
		enableUndoButton: function() {
			document.querySelector('#undo-layout').classList.remove('disabled');
		},

		/*
		* default configuration option
		*/

		/**
		* hides the default layout confirmation modal box
		*/
		hideConfirmationModal: function() {
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('.confirmation-modal').classList.add('hidden');
			document.querySelector('.confirmation-modal').style.display = 'none';
		},

		/**
		* shows the default layout confirmation modal box
		*/
		showConfirmationModal: function() {
			document.querySelector('.confirmation-modal').classList.remove('hidden');
			document.querySelector('.confirmation-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the update modal box
		*/
		hideUpdateModal: function() {
			document.querySelector('body').classList.remove('update');
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('#update-modal').style.display = 'none';
			chromeLocalStorage.setItem('update-seen',true);
			chromeLocalStorage.setItem('version','2.3.4');
		},

		/**
		* shows the update modal box
		*/
		showUpdateModal: function() {
			document.querySelector('#update-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the promo modal box
		*/
		hidePromoModal: function() {
			document.querySelector('body').classList.remove('promo');
			document.querySelector('.main-view').classList.remove('inactive');
			document.querySelector('#promo-modal').style.display = 'none';
			chromeLocalStorage.setItem('promo-seen',true);
		},

		/**
		* shows the promo modal box
		*/
		showPromoModal: function() {
			document.querySelector('#promo-modal').style.display = 'block';
			document.querySelector('.main-view').classList.add('inactive');
		},

		/**
		* hides the warning modal box
		*/
		hideWarningModal: function() {
			document.querySelector('body').classList.remove('warning');
			chromeLocalStorage.setItem('warning-seen',true);
		},

		/**
		* shows the warning modal box
		*/
		showWarningModal: function() {
			document.querySelector('#warning-modal').style.display = 'block'; // .trigger('show');
			document.querySelector('.main-view').classList.add('inactive');
		}


	};

	window.resize.options = options;

})();
