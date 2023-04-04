browser.storage.sync.get('enabled').then(val => {
	if (val.enabled === '') return;

	const WINDOW = window.wrappedJSObject;
	if (!WINDOW) return; // This only works in Firefox

{THREE-ISLAND}
}).catch(console.error);
