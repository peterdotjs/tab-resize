(function($){
	$('body').on('click','#tracking-opt-out',function(){
		var checked = $(this).attr('checked');
		localStorage.setItem("tracking-opt-out",checked ? "true" : "false");
	});
})(window.jQuery);