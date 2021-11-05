chrome.storage.sync.get('enabled', val => {
	if (!val.enabled) return;
	const s = document.createElement('script');
	s.src = chrome.runtime.getURL('three-island.js');
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
});