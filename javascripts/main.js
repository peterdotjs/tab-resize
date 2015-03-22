(function($){

  var isChrome = (chrome && chrome.webstore),
      isOpera = (opr && opr.addons);

  var chromeInstallBtn = $('install-button-chrome'),
      operaInstalBtn = $('install-button-opera');

  if(isChrome){
    chromeInstallBtn
      .attr({
        role:'button',
        href:'javascript;:',
        onclick:'chrome.webstore.install()'
      });
  } else if(isOpera){
    operaInstalBtn
      .attr({
        role:'button',
        href:'javascript;:',
        onclick:"opr.addons.installExtension('lfdlpjohbjaibcdopbbbkclkagnaemop')"
      });
  }
})(window.jQuery);
