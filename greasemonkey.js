// ==UserScript==
// @name     Three Island
// @version  1.0.0
// @grant    unsafeWindow
// @author   PartMan
// @match    http://play.pokemonshowdown.com/*
// @match    https://play.pokemonshowdown.com/*
// @match    http://*.psim.us/*
// @match    https://*.psim.us/*
// ==/UserScript==

const app = unsafeWindow.app;
const Storage = unsafeWindow.Storage;

const storedPastes = {};

function fetchPaste (url) {
	return new Promise((resolve, reject) => {
		if (!url) return reject(new Error('No URL'));
		const paste = url.match(/pokepast\.es\/([a-zA-Z0-9]+)/);
		if (!paste) reject(new Error('Invalid paste'));
		if (paste[1] === 'constructor') return reject(new Error('Well someone tried to screw me up'));
		if (storedPastes[paste[1]]) return resolve(paste[1]);
		const jsonLink = `https://pokepast.es/${paste[1]}/json`;
		fetch(jsonLink).then(res => res.json()).then(data => {
			const teamString = Storage.packTeam(Storage.importTeam(data.paste));
			const iconCache = Storage.packedTeamIcons(teamString);
			storedPastes[paste[1]] = { teamString, iconCache, title: data.title };
			resolve(paste[1]);
		}).catch(err => {
			reject(new Error('Paste link is invalid.'));
		});
	});
}

function addTeam (url) {
	return new Promise((resolve, reject) => {
		if (!url) return reject(new Error('No URL'));
		const paste = url.match(/pokepast\.es\/([a-zA-Z0-9]+)/);
		if (!paste) reject(new Error('Invalid paste'));
		if (paste[1] === 'constructor') return reject(new Error('Well someone tried to screw me up'));
		if (storedPastes[paste[1]]) return resolve(storedPastes[paste[1]]);
		else return fetchPaste(url).then(data => resolve(storedPastes[data]));
	}).catch(console.error).then(data => {
		const newTeam = new unsafeWindow.Object();
		newTeam.name = data.title;
		newTeam.format = 'gen8';
		newTeam.team = data.teamString;
		newTeam.capacity = 6;
		newTeam.folder = '';
		newTeam.iconCache = data.iconCache;
		Storage.teams.unshift(newTeam);
		if (app.rooms.teambuilder) app.rooms.teambuilder.update();
		Storage.saveTeams();
	});
}

// Watching rooms

const rooms = {};

function validRoom (room) {
	if (!room.length) return false; // ''
	if (['battles', 'ladder', 'rooms', 'teambuilder'].includes(room)) return false; // Client special rooms
	if (room.includes('-')) {
		if (!room.startsWith('groupchat-') && !room.startsWith('battle-')) return false; // Server special rooms
	}
	return true;
}

function watchRoom (node) {
	const observer = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			for (const msg of mutation.addedNodes) {
				if (!msg.classList.contains('chat')) continue;
				const chat = msg.childNodes[msg.childNodes[0].nodeName === 'SMALL' ? 3 : 2];
				if (!chat || chat.nodeName !== 'EM') continue;
				for (const ftd of chat.children) {
					if (ftd.nodeName !== 'A') continue;
					if (/^(?:https?:\/\/)?pokepast\.es\/[a-zA-Z0-9]+$/.test(ftd.href)) {
						const link = ftd.href;
						fetchPaste(link).then(ref => {
							const data = storedPastes[ref];
							const tooltip = document.createElement('span');
							tooltip.innerHTML = `<center class="threeisland-images">${data.iconCache}</center><br/>`;
							tooltip.classList.add('threeisland-tooltip');
							const button = document.createElement('button');
							button.addEventListener('click', e => {
								addTeam(link);
								if (e.target.nodeName === 'BUTTON') e.preventDefault();
							});
							button.innerHTML = 'Import';
							tooltip.appendChild(button);
							ftd.classList.add('threeisland-link');
							ftd.appendChild(tooltip);
						}).catch(() => {});
					}
				}
			}
		});
	});
	observer.observe(node.childNodes[1].childNodes[0], { childList: true });
	return observer;
}

Object.entries(app.rooms).forEach(([room, data]) => {
	if (!validRoom(room)) return;
	const node = data.el;
	const observer = watchRoom(node);
	rooms[room] = { node, observer };
});

const observer = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		if (mutation.addedNodes.length) {
			for (const node of mutation.addedNodes) {
				const roomRoom = node.id;
				if (!roomRoom.startsWith('room-')) continue;
				const room = roomRoom.substr(5);
				if (!validRoom(room)) continue;
				const observer = watchRoom(node);
				rooms[room] = { node, observer };
			}
		}
		if (mutation.removedNodes) {
			for (const node of mutation.removedNodes) {
				if (!node.id.startsWith('room-')) continue;
				delete rooms[node.id.substr(5)];
			}
		}
	});
});

observer.observe(document.querySelector('body'), { childList: true });

/*
* Adding CSS
*/

function addCSS (css) {
	let head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) return;
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

addCSS(`.threeisland-link { position: relative; display: inline-block; border-bottom: 1px dotted black; background-color: rgba(100, 100, 200, 0.5); padding: 0 5px; border-radius: 3px;} .threeisland-link .threeisland-tooltip { visibility: hidden; background-color: #0d151e; color: #ddd; text-align: center; padding: 5px; border-radius: 6px; border: 1px solid #999; position: absolute; z-index: 1;  width: 250px; bottom: 100%; left: 50%; margin-left: -50%;} .threeisland-link:hover .threeisland-tooltip { visibility: visible;} .threeisland-images { width: 250px; min-width: 250px; max-width: 250px; min-height: 30px;} .threeisland-images > span { float: none !important;}`);
