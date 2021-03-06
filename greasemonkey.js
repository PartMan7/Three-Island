// ==UserScript==
// @name     Three Island
// @version  1.0.2
// @grant    unsafeWindow
// @author   PartMan
// @match    http://play.pokemonshowdown.com/*
// @match    https://play.pokemonshowdown.com/*
// @match    http://*.psim.us/*
// @match    https://*.psim.us/*
// ==/UserScript==



const WINDOW = unsafeWindow;
if (!WINDOW) return;

WINDOW.R3I = true;
const { app, Dex, Storage, BattleStatNames } = WINDOW;
const storedPastes = {}; // Storing the data that we get from the Paste so we can display it

function escapeHTML (str) {
	// Escapes HTML
	if (!str) return '';
	return ('' + str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/\//g, '&#x2f;');
}

function subClone (aObject) {
	if (!aObject) return aObject;

	let v, bObject = Array.isArray(aObject) ? (new WINDOW.Array()) : (new WINDOW.Object());
	for (const k in aObject) {
		v = aObject[k];
		bObject[k] = (typeof v === "object") ? subClone(v) : v;
	}

	return bObject;
}

function exportTeam (team) {
	if (!team) return "";
	if (typeof team === 'string') {
		if (team.indexOf('\n') >= 0) return team;
		team = Storage.unpackTeam(team);
	}
	var text = '';
	for (var i = 0; i < team.length; i++) {
		var curSet = team[i];
		if (curSet.name && curSet.name !== curSet.species) {
			text += '' + curSet.name + ' (' + curSet.species + ')';
		} else {
			text += '' + curSet.species;
		}
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item) {
			text += ' @ ' + curSet.item;
		}
		text += "  \n";
		if (curSet.ability) {
			text += 'Ability: ' + curSet.ability + "  \n";
		}
		if (curSet.level && curSet.level != 100) {
			text += 'Level: ' + curSet.level + "  \n";
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes  \n';
		}
		if (typeof curSet.happiness === 'number' && curSet.happiness !== 255 && !isNaN(curSet.happiness)) {
			text += 'Happiness: ' + curSet.happiness + "  \n";
		}
		if (curSet.pokeball) {
			text += 'Pokeball: ' + curSet.pokeball + "  \n";
		}
		if (curSet.hpType) {
			text += 'Hidden Power: ' + curSet.hpType + "  \n";
		}
		if (curSet.gigantamax) {
			text += 'Gigantamax: Yes  \n';
		}
		var first = true;
		if (curSet.evs) {
			for (var j in BattleStatNames) {
				if (!curSet.evs[j]) continue;
				if (first) {
					text += 'EVs: ';
					first = false;
				} else {
					text += ' / ';
				}
				text += '' + curSet.evs[j] + ' ' + BattleStatNames[j];
			}
		}
		if (!first) {
			text += "  \n";
		}
		if (curSet.nature) {
			text += '' + curSet.nature + ' Nature' + "  \n";
		}
		var first = true;
		if (curSet.ivs) {
			var defaultIvs = true;
			var hpType = false;
			for (var j = 0; j < curSet.moves.length; j++) {
				var move = curSet.moves[j];
				if (move.substr(0, 13) === 'Hidden Power ' && move.substr(0, 14) !== 'Hidden Power [') {
					hpType = move.substr(13);
					if (!Dex.types.isName(hpType)) {
						continue;
					}
					for (var stat in BattleStatNames) {
						if ((curSet.ivs[stat] === undefined ? 31 : curSet.ivs[stat]) !== (Dex.types.get(hpType).HPivs[stat] || 31)) {
							defaultIvs = false;
							break;
						}
					}
				}
			}
			if (defaultIvs && !hpType) {
				for (var stat in BattleStatNames) {
					if (curSet.ivs[stat] !== 31 && curSet.ivs[stat] !== undefined) {
						defaultIvs = false;
						break;
					}
				}
			}
			if (!defaultIvs) {
				for (var stat in BattleStatNames) {
					if (typeof curSet.ivs[stat] === 'undefined' || isNaN(curSet.ivs[stat]) || curSet.ivs[stat] == 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += '' + curSet.ivs[stat] + ' ' + BattleStatNames[stat];
				}
			}
		}
		if (!first) {
			text += "  \n";
		}
		if (curSet.moves) for (var j = 0; j < curSet.moves.length; j++) {
			var move = curSet.moves[j];
			if (move.substr(0, 13) === 'Hidden Power ') {
				move = move.substr(0, 13) + '[' + move.substr(13) + ']';
			}
			if (move) {
				text += '- ' + move + "  \n";
			}
		}
		text += "\n";
	}
	return text;
}

function monString (mon) {
	mon = subClone(mon);
	const arr = new WINDOW.Array();
	arr.push(mon);
	return `<div style="position:relative;height:32px;width:40px;display:inline-block" class="threeisland-set"><span class="picon" style="${escapeHTML(Dex.getPokemonIcon(mon.species))};position:absolute;top:0;left:0"></span><span class="itemicon" style="${escapeHTML(Dex.getItemIcon(mon.item))};transform:scale(0.8);position:absolute;top:15px;left:15px"></span><span class="threeisland-tooltip"><pre>${escapeHTML(exportTeam(arr))}</pre></span></div>`; // HTML-ification!
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
			let floatHTML = '';
			for (let i = 0; i < team.length && i < 24; i++) floatHTML += monString(team[i]); // Access denied if we try to run Array#map
				if (team.length > 24) floatHTML += `...and ${team.length - 1} more`;
			let format = 'gen8';
			const matched = data.notes.match(/[Ff]ormat *(?:[:-] *)?([a-z0-9]+)/);
			if (matched) format = matched[1];
			if (!format.startsWith('gen')) format = 'gen8' + format;
			storedPastes[paste[1]] = { teamString, title: data.title, floatHTML: floatHTML || iconCache, team, format };
			resolve(paste[1]);
		}).catch((err) => {
			console.error(err);
			reject(new Error('Paste link is invalid.'));
		});
	});
}

function addTeam (url) {
	// Adds the team to the storage + teambuilder
	return new Promise((resolve, reject) => {
		if (!url) return reject(new Error('No URL'));
		const paste = url.match(/pokepast\.es\/([a-zA-Z0-9]+)/);
		if (!paste) reject(new Error('Invalid paste'));
		if (paste[1] === 'constructor') return reject(new Error('Well someone tried to screw me up'));
		if (storedPastes[paste[1]]) return resolve(storedPastes[paste[1]]);
		else return fetchPaste(url).then(data => resolve(storedPastes[data]));
	}).catch(console.error).then(data => {
		const newTeam = new WINDOW.Object();
		newTeam.name = data.title;
		newTeam.format = data.format;
		newTeam.team = data.teamString;
		newTeam.capacity = data.team.length > 6 ? 24 : 6;
		newTeam.folder = '';
		newTeam.iconCache = Storage.packedTeamIcons(data.teamString);;
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
	// format chat messages with valid PokePaste links
	if (!ftd) return;
	if (ftd.nodeName !== 'A') return;
	if (/^(?:https?:\/\/)?pokepast\.es\/[a-zA-Z0-9]+$/.test(ftd.href)) {
		const link = ftd.href;
		fetchPaste(link).then(ref => {
			const data = storedPastes[ref];
			const tooltip = document.createElement('span');
			if (pm) tooltip.classList.add('threeisland-pm');
			const innerHTML = `<center class="threeisland-images">${data.floatHTML}</center>`;
			tooltip.innerHTML = innerHTML + (pm ? '' : '<br/>');
			tooltip.classList.add('threeisland-tooltip');
			const button = document.createElement('button');
			button.addEventListener('click', e => {
				addTeam(link);
				if (e.target.nodeName === 'BUTTON') e.preventDefault(); // Don't redirect if they clicked the 'Import button'
			});
			tooltip.addEventListener('click', e => {
				if (e.target.nodeName === 'PRE') {
					// They clicked the set; we copy this to clipboard!
					e.preventDefault();
					const set = e.target.textContent;
					const dark = document.getElementsByTagName('html')[0]?.classList.contains('dark');
					WINDOW.navigator?.clipboard?.writeText(set)?.catch(() => {});
					e.target.style['background-color'] = dark ? '#3d454e' : '#c1c8c8';
					setTimeout(() => e.target.style['background-color'] = dark ? '#0d151e' : '#e1e8e8', 1010);
				}
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
	// Run the check function above on every messagebox that appears in chat
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
	// The above, but for users in your PMs instead
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

function addCSS (css) {
	// And finally we make it look pretty
	let head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) return;
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

const CSS = `.threeisland-link {
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
}`;

addCSS(CSS);