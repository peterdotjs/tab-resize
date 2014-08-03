var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-34217520-2']);
_gaq.push(['_trackPageview']);

function sendTracking(category, label) {
	_gaq.push(['_trackEvent', category, 'clicked', label || "na"]);
};

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();