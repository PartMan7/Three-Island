((async () => {
	const WINDOW = window.wrappedJSObject;
	if (!WINDOW) return; // This only works in Firefox

	const ids = ['enabled', 'show-item', 'show-tera'];
	const entries = await Promise.all(ids.map(data => browser.storage.sync.get(data)));
	const OPTIONS = entries.reduce((a, b) => ({ ...a, ...b }), {});

	if (OPTIONS.enabled !== '1') return;

{THREE-ISLAND}
})()).catch(console.error);
