/*

	Build script for Three Island
	Three Island has four versions:

	a) Greasemonkey userscript
	b) Tampermonkey userscript
	c) Firefox (Mozilla Add-ons)
	d) Chrome store extension

	All of these have their own niche code, so instead of separately maintaining four versions, I'm maintaining one
	and compiling it to the other formats instead. Type `npm run build` to run this script.

*/

const fs = require('fs-extra');
const path = require('path');
const zip = require('zip-promise');

async function build () {

	const manifest = {
		name: 'Three Island',
		version: 0,
		manifest_version: 0,
		description: 'A {BROWSER} extension for Pokemon Showdown that offers a seamless Poképaste experience.',
		homepage_url: 'https://github.com/PartMan7/Three-Island',
		icons: {
			'48': 'icons/three-island-48.png',
			'96': 'icons/three-island-96.png',
			'128': 'icons/three-island-128.png'
		},
		permissions: [
			'storage',
			'*://play.pokemonshowdown.com/*',
			'*://*.psim.us/*',
			'*://pokepast.es/**'
		],
		host_permissions: [],
		action: {
			default_icon: 'icons/three-island-48.png',
			default_title: 'Three Island',
			default_popup: 'popup/popup.html'
		},
		content_scripts: [{
			matches: ['*://play.pokemonshowdown.com/*', '*://*.psim.us/*'],
			js: ['three-island.js']
		}]
	};

	const package = require('./package.json');
	manifest.version = package.version

	const firefoxManifest = Object.assign({}, manifest);
	const chromeManifest = Object.assign({}, manifest);

	firefoxManifest.manifest_version = 2;
	firefoxManifest.description = firefoxManifest.description.replace(/{BROWSER}/g, 'Firefox');
	delete firefoxManifest.host_permissions;
	firefoxManifest.browser_action = firefoxManifest.action;
	delete firefoxManifest.action;
	firefoxManifest.browser_specific_settings = { gecko: { id: '{8cf2534c-9c6c-6ec3-526b-d9a154f042f2}' } };

	chromeManifest.manifest_version = 3;
	chromeManifest.description = chromeManifest.description.replace(/{BROWSER}/g, 'Chrome');
	chromeManifest.host_permissions.push(...chromeManifest.permissions.splice(1, 3));
	chromeManifest.content_scripts[0].js = ['syringe.js'];
	chromeManifest.web_accessible_resources = [{ resources: ['three-island.js'], matches: ['<all_urls>'] }];

	const firefoxPath = path.join(__dirname, 'dist', 'firefox');
	const chromePath = path.join(__dirname, 'dist', 'chrome');
	const scriptPath = path.join(__dirname, 'dist', 'scripts');

	await fs.emptyDir(firefoxPath);
	await fs.emptyDir(chromePath);
	await fs.emptyDir(scriptPath);

	await fs.copy(path.join(__dirname, 'icons'), path.join(firefoxPath, 'unpacked', 'icons'));
	await fs.copy(path.join(__dirname, 'icons'), path.join(chromePath, 'unpacked', 'icons'));

	await fs.copy(path.join(__dirname, 'popup'), path.join(firefoxPath, 'unpacked', 'popup'));
	await fs.copy(path.join(__dirname, 'popup'), path.join(chromePath, 'unpacked', 'popup'));

	await fs.move(path.join(firefoxPath, 'unpacked', 'popup', 'popup-firefox.js'), path.join(firefoxPath, 'unpacked', 'popup', 'popup.js'));
	await fs.remove(path.join(firefoxPath, 'unpacked', 'popup', 'popup-chrome.js'));

	await fs.move(path.join(chromePath, 'unpacked', 'popup', 'popup-chrome.js'), path.join(chromePath, 'unpacked', 'popup', 'popup.js'));
	await fs.remove(path.join(chromePath, 'unpacked', 'popup', 'popup-firefox.js'));

	await fs.writeFile(path.join(firefoxPath, 'unpacked', 'manifest.json'), JSON.stringify(firefoxManifest, null, '\t') + '\n');
	await fs.writeFile(path.join(chromePath, 'unpacked', 'manifest.json'), JSON.stringify(chromeManifest, null, '\t') + '\n');

	await fs.copy(path.join(__dirname, 'src', 'syringe.js'), path.join(chromePath, 'unpacked', 'syringe.js'));


	const header = (await fs.readFile(path.join(__dirname, 'src', 'header.js'), 'utf8')).replace(/{VERSION}/g, package.version);
	const CSS = (await fs.readFile(path.join(__dirname, 'src', 'showdown.css'), 'utf8')).split('\n').map(line => line ? `\t${line}` : line).join('\n');
	const ThreeIsland = (await fs.readFile(path.join(__dirname, 'src', 'three-island.js'), 'utf8')).replace(/{CSS}/g, CSS);

	const firefoxScript = header + await fs.readFile(path.join(__dirname, 'src', 'firefox.js'), 'utf8');
	const chromeScript = header + await fs.readFile(path.join(__dirname, 'src', 'chrome.js'), 'utf8');

	const indentedThreeIsland = ThreeIsland.split('\n').map(line => line ? `\t${line}` : line).join('\n');

	await fs.writeFile(path.join(firefoxPath, 'unpacked', 'three-island.js'), firefoxScript.replace(/{THREE-ISLAND}/g, indentedThreeIsland));
	await fs.writeFile(path.join(chromePath, 'unpacked', 'three-island.js'), chromeScript.replace(/{THREE-ISLAND}/g, indentedThreeIsland));

	await fs.writeFile(path.join(scriptPath, 'greasemonkey.js'), `${header}\nconst WINDOW = unsafeWindow;\nif (!WINDOW) return;\n\n${ThreeIsland}`);
	await fs.writeFile(path.join(scriptPath, 'tampermonkey.js'), `${header}\nconst WINDOW = unsafeWindow;\nif (!WINDOW) return;\n\n${ThreeIsland}`);
	// Greasemonkey and Tampermonkey both use identical scripts

	// Create archives
	await zip.folder(path.join(firefoxPath, 'unpacked'), path.join(firefoxPath, 'three-island.xpi'));
	await zip.folder(path.join(chromePath, 'unpacked'), path.join(chromePath, 'three-island.zip'));

	const readme = await fs.readFile(path.join(__dirname, 'README.md'), 'utf8');
	const [, month, date, year] = new Date().toDateString().split(' ');
	const dateStr = `${~~date}${{ '1': 'st', '2': 'nd' }[date.slice(-1)] || 'th'} ${month}, ${year}`;
	await fs.writeFile(path.join(__dirname, 'README.md'), readme.replace(/(?<=%20published&message=).*?(?=&)/g, dateStr.replace(/ /g, '%20')));

}

const initTime = process.uptime();
build().then(() => {
	console.log(`Completed build in ${process.uptime() - initTime}s`);
}).catch(err => {
	console.log(`Fatal error during build:`);
	console.error(err);
});
