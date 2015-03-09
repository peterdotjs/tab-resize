(function($){
	var currentOptOut = localStorage.getItem("tracking-opt-out");

	if(currentOptOut && currentOptOut === 'true'){
		$('#tracking-opt-out').attr('checked',true);
	}

	$('body').on('click','#tracking-opt-out',function(){
		var checked = $(this).attr('checked');
		localStorage.setItem("tracking-opt-out",checked ? "true" : "false");
	}).on('click', '#keyboard-shortcut-link', function(){
		chrome.tabs.create({url:'chrome://extensions/configureCommands'});
	}).on('click', '#water-charity', function(){
		sendTracking('options-link','water.org');
	}).on('click', '#other-charity', function(){
		sendTracking('options-link','other-charity');
	});

	function sendTracking(category, label) {
		if((!currentOptOut || currentOptOut === 'false') && ga) {
			ga('send','event', category, 'clicked', label || "na");
		}
	}

	if(!currentOptOut || currentOptOut === 'false') {
		// Standard Google Universal Analytics code
		/* jshint ignore:start */
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here
		/* jshint ignore:end */
		ga('create', 'UA-34217520-2', 'auto');
		ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
		ga('require', 'displayfeatures');
	}

})(window.jQuery);
