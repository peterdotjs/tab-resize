// var deferTracking = false;

// chromeLocalStorage.getItem("tracking-opt-out").then((optOut)=> {
// 	if(optOut && optOut === 'true'){
// 		deferTracking = true;
// 	}
// });

function sendTracking(category, label) {
	// if(!deferTracking && ga) {
	// 	ga('send','event', category, 'clicked', label || "na");
	// }
}

// if(!deferTracking) {
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
// 	ga('send', 'pageview', '/index.html');
// }