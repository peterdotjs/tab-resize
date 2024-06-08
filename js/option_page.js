(function(){
	// chromeLocalStorage.getItem("tracking-opt-out").then((currentOptOut)=> {
	// 	if(currentOptOut && currentOptOut === 'true'){
	// 		document.querySelector('#tracking-opt-out').setAttribute('checked',true);
	// 	}
	// });

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
	

	var $body = document.querySelector('body');

	addEventListener($body,'click','#tracking-opt-out',function(){
		var checked = $(this).getAttribute('checked');
		sendTracking('options-link', checked ? "opt-out-true" : "opt-out-false");
		// chromeLocalStorage.setItem("tracking-opt-out",checked ? "true" : "false");
	});
	
	addEventListener(body,'click', '#keyboard-shortcut-link', function(){
		sendTracking('options-link','keyboard-shortcut');
		chrome.tabs.create({url:'chrome://extensions/configureCommands'});
	});
	
	addEventListener(body,'click', '#buy-coffee', function(){
		sendTracking('options-link','buy-coffee');
	});
	
	addEventListener(body,'click', '#subscribing', function(){
		sendTracking('options-link','subscribing');
	});

	function sendTracking(category, label) {
		// if((!currentOptOut || currentOptOut === 'false') && ga) {
		// 	ga('send','event', category, 'clicked', label || "na");
		// }
	}

	// if(!currentOptOut || currentOptOut === 'false') {
	// 	// Standard Google Universal Analytics code
	// 	/* jshint ignore:start */
	// 	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	// 	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	// 	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	// 	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
	// 	/* jshint ignore:end */
	// 	ga('create', 'UA-34217520-2', 'auto');
	// 	ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
	// 	ga('require', 'displayfeatures');
	// }

})();
