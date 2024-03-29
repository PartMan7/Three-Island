// ==UserScript==
// @name     Three Island
// @version  1.4.3
// @grant    unsafeWindow
// @author   PartMan
// @match    http://play.pokemonshowdown.com/*
// @match    https://play.pokemonshowdown.com/*
// @match    http://*.psim.us/*
// @match    https://*.psim.us/*
// ==/UserScript==



const WINDOW = unsafeWindow;
if (!WINDOW) return;
const OPTIONS = {
	enabled: '1',
	'show-item': '1',
	'show-tera': '1',
	'import-code': '1'
};
/*

Instead of using a UI, you'll have to simply edit the values in OPTIONS
Values that you can manually configure in it are:
a) enabled: set '0' for disabled, '1' for enabled
b) 'show-item': '0' for disabled, '1' for enabled
c) 'show-tera': '0' for disabled, '1' for enabled, and '2' for enabling
    only when the type is different from the original default tera type
d) 'import-code': '0' to disable, '1' for enabled

*/

if (!OPTIONS.enabled) return;

WINDOW.R3I = true;
const { app, Dex, Storage, BattleStatNames } = WINDOW;
const { error, log } = WINDOW.console;
const storedPastes = {}; // Storing the data that we get from the Paste so we can display it

function deepClone (aObject) {
	if (!aObject) return aObject;

	let v, bObject = WINDOW.Array.isArray(aObject) ? (new WINDOW.Array()) : (new WINDOW.Object());
	for (const k in aObject) {
		v = aObject[k];
		bObject[k] = (typeof v === 'object') ? deepClone(v) : v;
	}

	return bObject;
}

function exportTeam (team) {
	// Copied from the official client's `Dex.exportTeam` function
	// The only difference is that this doesn't throw errors if the set has invalid Hidden Powers
	if (!team) return '';
	if (typeof team === 'string') {
		if (team.indexOf('\n') >= 0) return team;
		team = Storage.unpackTeam(team);
	}
	let text = '';
	for (let i = 0; i < team.length; i++) {
		const curSet = team[i];
		if (!curSet.moves) curSet.moves = [];
		if (curSet.name && curSet.name !== curSet.species) text += `${curSet.name} (${curSet.species})`;
		else text += `${curSet.species}`;
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item) {
			text += ` @ ${curSet.item}`;
		}
		text += '  \n';
		if (curSet.ability) {
			text += `Ability: ${curSet.ability}  \n`;
		}
		if (curSet.level && curSet.level != 100) {
			text += `Level: ${curSet.level}  \n`;
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes  \n';
		}
		if (typeof curSet.happiness === 'number' && curSet.happiness !== 255 && !isNaN(curSet.happiness)) {
			text += `Happiness: ${curSet.happiness}  \n`;
		}
		if (curSet.pokeball) {
			text += `Pokeball: ${curSet.pokeball}  \n`;
		}
		if (curSet.hpType) {
			text += 'Hidden Power: ' + curSet.hpType + '  \n';
		}
		if (curSet.gigantamax) {
			text += 'Gigantamax: Yes  \n';
		}
		if (curSet.teraType) {
			text += `Tera Type: ${curSet.teraType}  \n`;
		}
		let firstEV = true;
		if (curSet.evs) {
			for (const stat in BattleStatNames) {
				if (!curSet.evs[stat]) continue;
				if (firstEV) {
					text += 'EVs: ';
					firstEV = false;
				} else {
					text += ' / ';
				}
				text += `${curSet.evs[stat]} ${BattleStatNames[stat]}`;
			}
		}
		if (!firstEV) {
			text += '  \n';
		}
		if (curSet.nature) {
			text += '' + curSet.nature + ' Nature' + '  \n';
		}
		let firstIV = true;
		if (curSet.ivs) {
			let defaultIvs = true;
			let hpType = false;
			for (let j = 0; j < curSet.moves.length; j++) {
				const move = curSet.moves[j];
				if (move.substr(0, 13) === 'Hidden Power ' && move.substr(0, 14) !== 'Hidden Power [') {
					hpType = move.substr(13);
					if (!Dex.types.isName(hpType)) {
						continue;
					}
					for (const stat in BattleStatNames) {
						if ((curSet.ivs[stat] === undefined ? 31 : curSet.ivs[stat]) !== (Dex.types.get(hpType).HPivs[stat] || 31)) {
							defaultIvs = false;
							break;
						}
					}
				}
			}
			if (defaultIvs && !hpType) {
				for (const stat in BattleStatNames) {
					if (curSet.ivs[stat] !== 31 && curSet.ivs[stat] !== undefined) {
						defaultIvs = false;
						break;
					}
				}
			}
			if (!defaultIvs) {
				for (var stat in BattleStatNames) {
					if (typeof curSet.ivs[stat] === 'undefined' || isNaN(curSet.ivs[stat]) || curSet.ivs[stat] == 31) continue;
					if (firstIV) {
						text += 'IVs: ';
						firstIV = false;
					} else {
						text += ' / ';
					}
					text += `${curSet.ivs[stat]} ${BattleStatNames[stat]}`;
				}
			}
		}
		if (!firstIV) {
			text += '  \n';
		}
		if (curSet.moves) for (var j = 0; j < curSet.moves.length; j++) {
			var move = curSet.moves[j];
			if (move.substr(0, 13) === 'Hidden Power ') {
				move = `Hidden Power [${move.substr(13)}]`;
			}
			if (move) text += `- ${move}  \n`;
		}
		text += '\n';
	}
	return text;
}

function monHTML (mon) {
	// The HTML for each individual sprite
	mon = deepClone(mon);
	const arr = new WINDOW.Array();
	arr.push(mon);
	const mainNode = document.createElement('div');
	mainNode.style.cssText = 'position:relative;height:32px;width:40px;display:inline-block';
	mainNode.classList.add('threeisland-set');
	const monIcon = document.createElement('span');
	monIcon.style.cssText = `${Dex.getPokemonIcon(mon.species)};position:absolute;top:0;left:0`;
	monIcon.classList.add('picon');
	if (mon.teraType) {
		const species = Dex.species.get(mon.species);
		const nonStdTera = !species || species.types[0] !== mon.teraType;
		if (OPTIONS['show-tera'] === '1' || (OPTIONS['show-tera'] === '2' && nonStdTera)) {
			const teraIcon = document.createElement('span');
			const teraImage = document.createElement('img');
			teraImage.setAttribute('src', `https://play.pokemonshowdown.com/sprites/types/Tera${mon.teraType}.png`);
			teraImage.style.cssText = 'height:15px;width:15px';
			teraIcon.appendChild(teraImage);
			teraIcon.style.cssText = 'position:absolute;top:0;left:0';
			mainNode.appendChild(teraIcon);
		}
	}
	mainNode.appendChild(monIcon); // This is after the Tera icon so that the Pokémon is on top
	if (OPTIONS['show-item'] === '1') {
		// And the item icon is above both of them (though it can only overlap the Pokémon, not the Tera icon)
		const itemIcon = document.createElement('span');
		itemIcon.style.cssText = `${Dex.getItemIcon(mon.item)};transform:scale(0.8);position:absolute;top:15px;left:15px`;
		itemIcon.classList.add('itemicon');
		mainNode.appendChild(itemIcon);
	}
	const exportNode = document.createElement('span');
	exportNode.classList.add('threeisland-tooltip');
	const preNode = document.createElement('pre');
	preNode.innerText = exportTeam(arr);
	exportNode.appendChild(preNode);
	mainNode.appendChild(exportNode);
	return mainNode;
}

function fetchPaste (url) {
	// Gets and stores the data from Pastes that are posted
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
			const pasteHTML = document.createElement('span');
			for (let i = 0; i < team.length && i < 24; i++) pasteHTML.appendChild(monHTML(team[i])); // Access denied if we try to run Array#map
			if (team.length > 24) pasteHTML.appendChild(document.createTextNode(`... and ${team.length - 1} more`));
			let format = 'gen9';
			const matched = data.notes.match(/[Ff]ormat *(?:[:-] *)?([a-z0-9]+)/);
			if (matched) format = matched[1];
			if (!format.startsWith('gen')) format = 'gen9' + format;
			storedPastes[paste[1]] = { teamString, title: data.title, pasteHTML, team, format };
			resolve(paste[1]);
		}).catch((err) => {
			log(`Three Island: Error in loading ${url} (this is completely safe)`, err);
			reject(new Error('Paste link is invalid.'));
		});
	});
}

function addTeam (data) {
	// Store the team in the Teambuilder
	const newTeam = new WINDOW.Object();
	newTeam.name = data.title;
	newTeam.format = data.format;
	newTeam.team = data.teamString;
	newTeam.capacity = data.team.length > 6 ? 24 : 6;
	newTeam.folder = '';
	newTeam.iconCache = Storage.packedTeamIcons(data.teamString);
	Storage.teams.unshift(newTeam);
	if (app.rooms.teambuilder) app.rooms.teambuilder.update();
	Storage.saveTeams();
}

function loadPaste (url) {
	// Adds the team to the storage + teambuilder
	return new Promise((resolve, reject) => {
		if (!url) return reject(new Error('No URL'));
		const paste = url.match(/pokepast\.es\/([a-zA-Z0-9]+)/);
		if (!paste) reject(new Error('Invalid paste'));
		if (paste[1] === 'constructor') return reject(new Error('Well someone tried to screw me up'));
		if (storedPastes[paste[1]]) return resolve(storedPastes[paste[1]]);
		else return fetchPaste(url).then(data => resolve(storedPastes[data]));
	}).then(data => addTeam(data)).catch(error);
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

function runCheck (ftd, isPM) {
	// Format chat messages with valid PokePaste links
	if (!ftd) return;
	if (ftd.nodeName !== 'A') return [...ftd.childNodes].forEach(node => runCheck(node, isPM));
	// If the node isn't a link, check if any of its children are links (eg: italicized text)
	if (/^(?:https?:\/\/)?pokepast\.es\/[a-zA-Z0-9]+$/.test(ftd.href)) {
		const link = ftd.href;
		fetchPaste(link).then(ref => {
			const data = storedPastes[ref];
			const tooltip = document.createElement('span');
			if (isPM) tooltip.classList.add('threeisland-pm');
			const tooltipInner = document.createElement('center');
			tooltipInner.classList.add('threeisland-images');
			tooltipInner.appendChild(data.pasteHTML.cloneNode(true));
			tooltip.appendChild(tooltipInner);
			tooltip.classList.add('threeisland-tooltip');
			const button = document.createElement('button');
			button.addEventListener('click', e => {
				loadPaste(link);
				if (e.target.nodeName === 'BUTTON') e.preventDefault(); // Don't redirect if they clicked the Import button
			});
			tooltip.addEventListener('click', e => {
				if (e.target.nodeName === 'PRE') {
					// They clicked the set; we copy this to clipboard!
					e.preventDefault();
					const set = e.target.innerText;
					const dark = document.getElementsByTagName('html')[0]?.classList.contains('dark');
					WINDOW.navigator?.clipboard?.writeText(set)?.catch(() => {});
					e.target.style['background-color'] = dark ? '#3d454e' : '#c1c8c8';
					setTimeout(() => e.target.style['background-color'] = dark ? '#0d151e' : '#e1e8e8', 1010);
				}
			});
			button.appendChild(document.createTextNode('Import'));
			tooltip.appendChild(button);
			ftd.classList.add('threeisland-link');
			if (isPM) ftd.classList.add('threeisland-pm');
			ftd.appendChild(tooltip);
		}).catch(err => log(`Three Island: `, err));
	}
}

function runCodeCheck (details, isPM) {
	// Format !code blocks with valid teams
	if (!details) return;
	// Generate the text content of the !code message
	const summaryContent = details.childNodes[0].innerHTML;
	const textContentWithTags = `${summaryContent}<br>${[...details.childNodes].slice(1).map(mapNodeToContent).join('')}`;
	const textContent = textContentWithTags.replace(/<br>/g, '\n').replace(/<wbr>/g, '');
	if (textContent.includes('Ability: ')) {
		// Probably a set!
		// We let the user decide because I'm lazy
		try {
			const team = Storage.importTeam(textContent);
			const importButton = document.createElement('button');
			importButton.addEventListener('click', e => {
				addTeam({
					title: `Untitled ${Storage.teams.length + 1}`,
					teamString: Storage.packTeam(team),
					team,
					format: 'gen9'
				});
				if (e.target.nodeName === 'BUTTON') e.preventDefault(); // Don't expand/collapse if they clicked the Import button
			});
			importButton.innerText = 'Import';
			details.childNodes[0].insertBefore(document.createElement('br'), details.childNodes[0].childNodes[0]);
			details.childNodes[0].insertBefore(document.createElement('br'), details.childNodes[0].childNodes[0]);
			details.childNodes[0].insertBefore(importButton, details.childNodes[0].childNodes[0]);
		} catch (e) {}
	}
}

function mapNodeToContent (node) {
	// Function to convert HTML nodes into their text counterparts
	if (node.nodeName === 'BR') return '\n';
	if (node.nodeName === 'WBR') return '';
	return node.textContent;
}

function checkMessageElement (msg, isPM) {
	// Check the message to see if it has relevant 'nodes' (either a chat message with a link or a !code block)
	if (!msg.classList.contains('chat')) return;
	if (msg.childNodes[0]?.nodeName === 'DIV') {
		// Check for a !code block
		if (OPTIONS['import-code'] !== '1') return;
		const infobox = msg.childNodes[0];
		if (!infobox.classList.contains('infobox')) return;
		const details = infobox.childNodes[0];
		if (details?.nodeName !== 'DETAILS') return; // A 'short' code (one that isn't expandable) can't have a team
		return runCodeCheck(details, isPM);
	}
	let nodeIndex = msg.childNodes[0]?.nodeName === 'SMALL' ? 2 : 1;
	if (!msg.childNodes[nodeIndex]) return; // If we're inside chat formatting, the child nodes won't exist
	if (msg.childNodes[nodeIndex].nodeName === '#text') nodeIndex++;
	const chat = msg.childNodes[nodeIndex];
	if (!chat) return;
	if (chat.nodeName === 'EM' || chat.classList.contains('message-pm')) {
		// Check for the Poképaste links in the 'content' portion of the message
		for (const ftd of chat.children) runCheck(ftd, isPM);
	}
}

function watchRoom (node, spc) {
	// Run the check function above on every messagebox that appears in chat
	const observerW = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			for (const msg of mutation.addedNodes) checkMessageElement(msg);
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
		for (const msg of chatNode.children) checkMessageElement(msg);
		observerW.observe(chatNode, { childList: true });
	} else log(`Three Island: ran into a weird chatroom`, node, chatNode, spc);
	return observerW;
}


Object.entries(app.rooms).forEach(([room, data]) => {
	// Load all rooms on connecting
	const val = validRoom(room);
	if (!val) return;
	const node = data.el;
	const observerR = watchRoom(node, val);
	rooms[room] = { node, observerR };
});

const observer = new MutationObserver(mutations => {
	// Keep an eye out for rooms we're joining / leaving
	mutations.forEach(mutation => {
		for (const node of mutation.addedNodes) {
			const roomRoom = node.id;
			if (!roomRoom) continue; // Room couldn't be loaded
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
			rooms[id]?.observer?.disconnect();
			delete rooms[id];
		}
	});
});
observer.observe(document.querySelector('body'), { childList: true });

const observerPM = new MutationObserver(mutations => {
	// The above, but for users in your PMs instead
	mutations.forEach(mutation => {
		for (const node of mutation.addedNodes) {
			const user = node.getAttribute('data-userid');
			if (!user) continue;
			const observerB = new MutationObserver(mutations => {
				mutations.forEach(mutation => {
					for (const msg of mutation.addedNodes) checkMessageElement(msg, true);
				});
			});
			const chatNode = node.children[1]?.children[1];
			if (chatNode) {
				for (const msg of chatNode.children) checkMessageElement(msg, true);
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

function addCSS (css) {
	// And finally we make it look pretty
	let head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) return;
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerText = css;
	head.appendChild(style);
}

const CSS = `
	.threeisland-link {
		position: relative;
		display: inline-block;
		border-bottom: 1px dotted black;
		background-color: rgba(200, 200, 250, 0.5);
		padding: 0 5px;
		border-radius: 3px;
	}

	.dark .threeisland-link {
		background-color: rgba(100, 100, 200, 0.5);
	}

	.threeisland-link > .threeisland-tooltip {
		visibility: hidden;
		background-color: #e1e8e8;
		color: #000;
		text-align: center;
		padding: 5px;
		border-radius: 6px;
		border: 1px solid #999;
		position: absolute;
		z-index: 1;
		width: 250px;
		bottom: 100%;
		left: 50%;
		margin-left: -50%;
	}

	.dark .threeisland-link > .threeisland-tooltip {
		background-color: #0d151e;
		color: #ddd;
	}

	.threeisland-link:hover > .threeisland-tooltip {
		visibility: visible;
	}

	.threeisland-images {
		width: 250px;
		min-width: 250px;
		max-width: 250px;
		min-height: 30px;
	}

	.threeisland-tooltip.threeisland-pm {
		min-width: 200px;
		max-width: 200px;
		width: 200px;
		display: flex;
	}

	.threeisland-tooltip.threeisland-pm > center {
		min-width: 150px;
		max-width: 150px;
		width: 150px;
	}

	.threeisland-images > span {
		float: none !important;
	}


	.threeisland-set {
		position: relative;
		display: inline-block;
	}

	.threeisland-set > .threeisland-tooltip {
		visibility: hidden;
		background-color: #e1e8e8;
		color: #000;
		text-align: center;
		padding: 5px 10px 5px;
		border-radius: 6px;
		border: 1px solid #999;
		position: absolute;
		z-index: 1;
		width: 250px;
		bottom: 100%;
		left: 50%;
		margin-left: -50%;
	}

	.dark .threeisland-set > .threeisland-tooltip {
		background-color: #0d151e;
		color: #ddd;
	}

	.threeisland-set:hover > .threeisland-tooltip {
		visibility: visible;
	}

	.threeisland-tooltip > pre {
		text-align: left;
		white-space: pre-wrap;
		overflow-y: scroll;
		transition: background-color 500ms ease;
	}
`;

addCSS(CSS);
