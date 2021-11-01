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
			const team = Storage.importTeam(data.paste);
			const teamString = Storage.packTeam(team);
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
const pms = {};

function validRoom (room) {
	if (room.startsWith('room-')) room = room.substr(5);
	if (room === '') return '';
	if (room.startsWith('battle-')) return 'battle';
	if (['battles', 'ladder', 'rooms', 'teambuilder'].includes(room)) return false; // Client special rooms
	if (room.includes('-') && !room.startsWith('groupchat-')) return false; // Server special rooms
	return true;
}

function runCheck (ftd, pm) {
	if (!ftd) return;
	if (ftd.nodeName !== 'A') return;
	if (/^(?:https?:\/\/)?pokepast\.es\/[a-zA-Z0-9]+$/.test(ftd.href)) {
		const link = ftd.href;
		fetchPaste(link).then(ref => {
			const data = storedPastes[ref];
			const tooltip = document.createElement('span');
			if (pm) tooltip.classList.add('threeisland-pm');
			const innerHTML = `<center class="threeisland-images">${data.iconCache}</center>`;
			tooltip.innerHTML = innerHTML + (pm ? '' : '<br/>');
			tooltip.classList.add('threeisland-tooltip');
			const button = document.createElement('button');
			button.addEventListener('click', e => {
				addTeam(link);
				if (e.target.nodeName === 'BUTTON') e.preventDefault();
			});
			button.innerHTML = 'Import';
			tooltip.appendChild(button);
			ftd.classList.add('threeisland-link');
			if (pm) ftd.classList.add('threeisland-pm');
			ftd.appendChild(tooltip);
		}).catch(() => {});
	}
}

function watchRoom (node, spc) {
	const observerW = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			for (const msg of mutation.addedNodes) {
				if (!msg.classList.contains('chat')) continue;
				const chat = msg.childNodes[msg.childNodes[0].nodeName === 'SMALL' ? 3 : 2];
				if (!chat || chat.nodeName !== 'EM') continue;
				for (const ftd of chat.children) runCheck(ftd);
			}
		});
	});
	let chatNode;
	switch (spc) {
		case 'battle': {
			chatNode = Array.from(Array.from(node.children).find(element => {
				return element.classList.contains('battle-log');
			}).children).find(element => {
				return element.classList.contains('message-log');
			});
			break;
		}
		default: chatNode = node.childNodes[1].childNodes[0];
	}
	if (chatNode) {
		for (const msg of chatNode.children) {
			if (!msg.classList.contains('chat')) continue;
			const chat = msg.childNodes[msg.childNodes[0].nodeName === 'SMALL' ? 3 : 2];
			if (!chat || chat.nodeName !== 'EM') continue;
			for (const ftd of chat.children) runCheck(ftd);
		}
		observerW.observe(chatNode, { childList: true });
	}
	else console.log(node, chatNode, spc);
	return observerW;
}

Object.entries(app.rooms).forEach(([room, data]) => {
	const val = validRoom(room);
	if (!val) return;
	const node = data.el;
	const observerR = watchRoom(node, val);
	rooms[room] = { node, observerR };
});

const observer = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		for (const node of mutation.addedNodes) {
			const roomRoom = node.id;
			if (!roomRoom.startsWith('room-')) continue;
			const room = roomRoom.substr(5);
			const val = validRoom(room);
			if (!val) continue;
			const observerA = watchRoom(node, val);
			rooms[room] = { node, observer: observerA };
		}
		for (const node of mutation.removedNodes) {
			if (!node.id.startsWith('room-')) continue;
			const id = node.id.substr(5);
			rooms[id]?.observer.disconnect();
			delete rooms[id];
		}
	});
});
observer.observe(document.querySelector('body'), { childList: true });

const observerPM = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		for (const node of mutation.addedNodes) {
			const user = node.getAttribute('data-userid');
			if (!user) continue;
			const observerB = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					for (const msg of mutation.addedNodes) {
						if (!msg.classList.contains('chat')) continue;
						const chat = msg.childNodes[msg.childNodes[0].nodeName === 'SMALL' ? 3 : 2];
						if (!chat || chat.nodeName !== 'EM') continue;
						for (const ftd of chat.children) runCheck(ftd, true);
					}
				});
			});
			const chatNode = node.children[1]?.children[1];
			if (chatNode) {
				for (const msg of chatNode.children) {
					if (!msg.classList.contains('chat')) continue;
					const chat = msg.childNodes[msg.childNodes[0].nodeName === 'SMALL' ? 3 : 2];
					if (!chat || chat.nodeName !== 'EM') continue;
					for (const ftd of chat.children) runCheck(ftd, true);
				}
				observerB.observe(chatNode, { childList: true });
			}
			pms[user] = { node, observer: observerB };
		}
		for (const node of mutation.removedNodes) {
			const user = node.getAttribute('data-userid');
			pms[user]?.observer.disconnect();
			delete pms[user];
		}
	});
});
observerPM.observe(document.querySelector('.pmbox'), { childList: true });

/* Adding CSS */

function addCSS (css) {
	let head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) return;
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

const vCSS = {
	a: '250px',
	b: '200px',
	c: '150px'
};

addCSS(`.threeisland-link { position: relative; display: inline-block; border-bottom: 1px dotted black; background-color: rgba(100, 100, 200, 0.5); padding: 0 5px; border-radius: 3px;} .threeisland-link .threeisland-tooltip { visibility: hidden; background-color: #0d151e; color: #ddd; text-align: center; padding: 5px; border-radius: 6px; border: 1px solid #999; position: absolute; z-index: 1;  width: ${vCSS.a}; bottom: 100%; left: 50%; margin-left: -50%;} .threeisland-link:hover .threeisland-tooltip { visibility: visible;} .threeisland-images { width: ${vCSS.a}; min-width: ${vCSS.a}; max-width: ${vCSS.a}; min-height: 30px;} .threeisland-tooltip.threeisland-pm { min-width: ${vCSS.b}; max-width: ${vCSS.b}; width: ${vCSS.b}; display: flex;} .threeisland-tooltip.threeisland-pm > center { min-width: ${vCSS.c}; max-width: ${vCSS.c}; width: ${vCSS.c};} .threeisland-images > span { float: none !important;}`);

/* End */
