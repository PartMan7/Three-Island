const toggle = document.getElementById('three-island-switch');

toggle.addEventListener('change', event => {
	const value = event.target.checked;
	browser.storage.sync.set({ enabled: value ? 'true' : '' }).catch(console.error);
});

window.addEventListener('DOMContentLoaded', () => {
	browser.storage.sync.get('enabled').then(val => {
		toggle.checked = val.enabled !== '';
	});
});
