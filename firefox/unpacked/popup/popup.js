const toggle = document.getElementById('three-island-switch');

toggle.addEventListener('change', event => {
	const value = event.target.checked;
	console.log(event);
	browser.storage.sync.set({ enabled: value ? 'true' : '' }).catch(console.error);
});

window.addEventListener('DOMContentLoaded', () => {
	browser.storage.sync.get('enabled').then(val => {
		toggle.checked = Boolean(val.enabled);
	});
});