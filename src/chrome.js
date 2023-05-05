function ThreeIsland () {
	const WINDOW = window;
	if (!WINDOW || WINDOW.R3I) return;
	const OPTIONS = JSON.parse(document.getElementById('3I-STATE').getAttribute('value'));
	if (OPTIONS.enabled !== '1') return;

{THREE-ISLAND}
}

try {
	ThreeIsland();
} catch (err) {
	console.error(err);
}
