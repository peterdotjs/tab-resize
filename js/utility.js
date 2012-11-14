/**
* utility.js
* general utility functions used for modal, canvas, etc.
*/
(function(){
	
	var util = {
	
		/**
		* Centers modal on page
		* @param {jQuery object} modal
		*/
		centerModal: function(modal) {
			modal.css({'margin-top':(modal.outerHeight()/2)*-1, 'margin-left':(modal.outerWidth()/2)*-1});
		},
		
		/**
		* reloads page
		*/
		reloadWindow:  function() {
			window.location.reload();
		},
		
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
		* clears the canvas of previous drawing
		*/
		clearCanvas: function() {
			var canvas = $('canvas')[0];
			var context=canvas.getContext("2d");
			context.clearRect(0,0,context.canvas.width,context.canvas.height);
		},
		
		
		/**
		* creates a new window at specific location with the tab input
		* @param {Number} tabId - id of main tab in new window
		* @param {Number} startX - horizontal position of window
		* @param {Number} startY - vertical position of window	
		*/
		createNewWindow: function(tabId, startX, startY, incog) {
			window.chrome.windows.create({tabId: tabId, 
									left: startX, 
									top: startY,
									width: this.width,
									height: this.height,
									incognito: incog}, 
									function(window){
										return window;
									}
			);
		}
	};

	window.resize.util = util;
	
})();