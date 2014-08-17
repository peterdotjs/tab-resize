(function($){
	var currentOptOut = localStorage.getItem("tracking-opt-out");

	if(currentOptOut && currentOptOut === 'true'){
		$('#tracking-opt-out').attr('checked',true);
	}

	$('body').on('click','#tracking-opt-out',function(){
		var checked = $(this).attr('checked');
		localStorage.setItem("tracking-opt-out",checked ? "true" : "false");
	});

})(window.jQuery);