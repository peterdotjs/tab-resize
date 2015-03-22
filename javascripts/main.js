(function($){

  var isChrome = (window.chrome && window.chrome.webstore),
      isOpera = (window.opr && window.opr.addons);

  var chromeInstallBtn = $('#install-button-chrome'),
      operaInstalBtn = $('#install-button-opera');

  if(isChrome){
    chromeInstallBtn
      .attr({
        role:'button',
        href:'#'
      });

    chromeInstallBtn.on('click',function(evt){
      evt.preventDefault();
      chrome.webstore.install();
    });

  } else if(isOpera){
    operaInstalBtn
      .attr({
        role:'button',
        href:'#'
      });

    operaInstalBtn.on('click',function(evt){
      evt.preventDefault();
      opr.addons.installExtension('lfdlpjohbjaibcdopbbbkclkagnaemop');
    });
  }
})(window.jQuery);
