chrome.storage.sync.get('enabled').then(async val => {
	if (val.enabled === '') return;
	const s = document.createElement('script');
	s.src = chrome.runtime.getURL('three-island.js');
	s.onload = function () {
		this.remove();
	};
	const ids = ['enabled', 'show-item', 'show-tera'];
	const entries = await Promise.all(ids.map(data => chrome.storage.sync.get(data)));
	const state = entries.reduce((a, b) => ({ ...a, ...b }), {});
	const root = (document.head || document.documentElement);
	root.appendChild(s);
	const stateNode = document.createElement('input');
	stateNode.setAttribute('type', 'hidden');
	stateNode.id = '3I-STATE';
	stateNode.setAttribute('value', JSON.stringify(state));
	root.appendChild(stateNode);
});
