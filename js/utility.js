/**
* utility.js
* general utility functions used for modal, canvas, etc.
*/

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

(function(){

	var util = {

		/**
		* draws a table using canvas
		* @param {Number} width - width of table
		* @param {Number} height - height of table
		* @param {Number} rows - number of rows of table
		* @param {Number} cols - number of cols of table
		* @param {CanvasRenderingContext2D} context - 2D context of canvas object
		*/
		drawTable: function(width, height, rows, cols, context) {

			context.beginPath();

			var xOff = width/cols;
			var yOff = height/rows;

			//draw horizontal lines
			for(var rowIndex = 1; rowIndex < rows; rowIndex++){
				context.moveTo(0,yOff*rowIndex);
				context.lineTo(height,yOff*rowIndex);
			}

			//draw vertical lines
			for(var colIndex = 1; colIndex < cols; colIndex++){
				context.moveTo(xOff*colIndex,0);
				context.lineTo(xOff*colIndex,width);
			}

			context.closePath();
			context.stroke();
		},

		/**
		* draws a scaled table using canvas
		* @param {Number} width - width of table
		* @param {Number} height - height of table
		* @param {Number} scale - percentage of first col/row
		* @param {String} orientation - "vertical" or "horizontal" 
		* @param {CanvasRenderingContext2D} context - 2D context of canvas object
		*/
		drawScaledTable: function(width, height, scale, orientation, context) {

			context.beginPath();

			var offSet = width*(0.1)*scale;

			if(orientation === 'horizontal'){
				context.moveTo(offSet,0);
				context.lineTo(offSet,width);
			} else {
				context.moveTo(0,offSet);
				context.lineTo(height,offSet);
			}

			context.closePath();
			context.stroke();
		},

		/**
		* clears the canvas of previous drawing
		*/
		clearCanvas: function() {
			var canvas = document.querySelector('canvas');
			var context=canvas.getContext("2d");
			context.clearRect(0,0,context.canvas.width,context.canvas.height);
		},


		initSortable: function(){
			document.querySelector('.sortable').sortable().on('sortupdate',function(){
				resize.layout.updateLayoutStore();
				sendTracking('dnd-event','dnd-label');
			});
			sortableInitialized = true;
		},

		resetSortable: function(){
			if(sortableInitialized){
				var $sortable = document.querySelector('.sortable');
				$sortable.sortable('destroy');
				$sortable.sortable();
			}
		},

		addEventListener: addEventListener,
		
	};

	var sortableInitialized = false;

	window.resize.util = util;

})();