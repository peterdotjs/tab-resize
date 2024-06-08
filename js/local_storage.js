/*
* local_storage.js
* localStorage API mirror
*/
(function(){
	/*
	* localStorage object
	* @constructor
	*/
	var localStorage = {
		getAllItems: () => chrome.storage.local.get(),
		getItem: async key => (await chrome.storage.local.get(key))[key],
		setItem: (key, val) => chrome.storage.local.set({[key]: val}),
		removeItem: keys => chrome.storage.local.remove(keys),
	};

	window.chromeLocalStorage = localStorage;

})();


