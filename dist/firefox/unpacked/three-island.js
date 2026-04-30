((async () => {
	const WINDOW = window.wrappedJSObject;
	if (!WINDOW) return; // This only works in Firefox

	const ids = ['enabled', 'show-item', 'show-tera', 'import-code'];
	const entries = await Promise.all(ids.map(data => browser.storage.sync.get(data)));
	const OPTIONS = entries.reduce((a, b) => ({ ...a, ...b }), {});

	if (OPTIONS.enabled !== '1') return;

	WINDOW.R3I = true;
	const { app, PS, Dex, Storage, BattleStatNames } = WINDOW; // PS on rewrite client, app on original
	const { error, log } = WINDOW.console;
	const generatedPasteHTML = {}; // Storing the data that we get from the Paste so we can display it

	function deepClone(aObject) {
	  if (!aObject) return aObject;

	  let v,
	    bObject = WINDOW.Array.isArray(aObject)
	      ? new WINDOW.Array()
	      : new WINDOW.Object();
	  for (const k in aObject) {
	    v = aObject[k];
	    bObject[k] = typeof v === 'object' ? deepClone(v) : v;
	  }

	  return bObject;
	}

	// Copied from the old client
		function packTeam(team) {
		  var buf = '';
		  if (!team) return '';

		  var hasHP;
		  for (var i = 0; i < team.length; i++) {
		    var set = team[i];
		    if (buf) buf += ']';

		    // name
		    buf += set.name || set.species;

		    // species
		    var id = toID(set.species);
		    buf += '|' + (toID(set.name || set.species) === id ? '' : id);

		    // item
		    buf += '|' + toID(set.item);

		    // ability
		    buf += '|' + toID(set.ability);

		    // moves
		    buf += '|';
		    if (set.moves)
		      for (var j = 0; j < set.moves.length; j++) {
		        var moveid = toID(set.moves[j]);
		        if (j && !moveid) continue;
		        buf += (j ? ',' : '') + moveid;
		        if (moveid.substr(0, 11) === 'hiddenpower' && moveid.length > 11)
		          hasHP = true;
		      }

		    // nature
		    buf += '|' + (set.nature || '');

		    // evs
		    var evs = '|';
		    if (set.evs) {
		      evs =
		        '|' +
		        (set.evs['hp'] || '') +
		        ',' +
		        (set.evs['atk'] || '') +
		        ',' +
		        (set.evs['def'] || '') +
		        ',' +
		        (set.evs['spa'] || '') +
		        ',' +
		        (set.evs['spd'] || '') +
		        ',' +
		        (set.evs['spe'] || '');
		    }
		    if (evs === '|,,,,,') {
		      buf += '|';
		      // doing it this way means packTeam doesn't need to be past-gen aware
		      if (set.evs['hp'] === 0) buf += '0';
		    } else {
		      buf += evs;
		    }

		    // gender
		    if (set.gender) {
		      buf += '|' + set.gender;
		    } else {
		      buf += '|';
		    }

		    // ivs
		    var ivs = '|';
		    if (set.ivs) {
		      ivs =
		        '|' +
		        (set.ivs['hp'] === 31 || set.ivs['hp'] === undefined
		          ? ''
		          : set.ivs['hp']) +
		        ',' +
		        (set.ivs['atk'] === 31 || set.ivs['atk'] === undefined
		          ? ''
		          : set.ivs['atk']) +
		        ',' +
		        (set.ivs['def'] === 31 || set.ivs['def'] === undefined
		          ? ''
		          : set.ivs['def']) +
		        ',' +
		        (set.ivs['spa'] === 31 || set.ivs['spa'] === undefined
		          ? ''
		          : set.ivs['spa']) +
		        ',' +
		        (set.ivs['spd'] === 31 || set.ivs['spd'] === undefined
		          ? ''
		          : set.ivs['spd']) +
		        ',' +
		        (set.ivs['spe'] === 31 || set.ivs['spe'] === undefined
		          ? ''
		          : set.ivs['spe']);
		    }
		    if (ivs === '|,,,,,') {
		      buf += '|';
		    } else {
		      buf += ivs;
		    }

		    // shiny
		    if (set.shiny) {
		      buf += '|S';
		    } else {
		      buf += '|';
		    }

		    // level
		    if (set.level && set.level !== 100) {
		      buf += '|' + set.level;
		    } else {
		      buf += '|';
		    }

		    // happiness
		    if (set.happiness !== undefined && set.happiness !== 255) {
		      buf += '|' + set.happiness;
		    } else {
		      buf += '|';
		    }

		    if (
		      set.pokeball ||
		      (set.hpType && !hasHP) ||
		      set.gigantamax ||
		      (set.dynamaxLevel !== undefined && set.dynamaxLevel !== 10) ||
		      set.teraType
		    ) {
		      buf += ',' + (set.hpType || '');
		      buf += ',' + toID(set.pokeball);
		      buf += ',' + (set.gigantamax ? 'G' : '');
		      buf +=
		        ',' +
		        (set.dynamaxLevel !== undefined && set.dynamaxLevel !== 10
		          ? set.dynamaxLevel
		          : '');
		      buf += ',' + (set.teraType || '');
		    }
		  }

		  return buf;
		}

		function unpackTeam(buf) {
		  if (!buf) return [];

		  var team = [];
		  var i = 0,
		    j = 0;

		  while (true) {
		    var set = {};
		    team.push(set);

		    // name
		    j = buf.indexOf('|', i);
		    set.name = buf.substring(i, j);
		    i = j + 1;

		    // species
		    j = buf.indexOf('|', i);
		    var species = Dex.species.get(buf.substring(i, j) || set.name);
		    set.species = species.name;
		    i = j + 1;

		    // item
		    j = buf.indexOf('|', i);
		    set.item = Dex.items.get(buf.substring(i, j)).name;
		    i = j + 1;

		    // ability
		    j = buf.indexOf('|', i);
		    var ability = Dex.abilities.get(buf.substring(i, j)).name;
		    set.ability =
		      species.abilities && ability in { '': 1, 0: 1, 1: 1, H: 1 }
		        ? species.abilities[ability || '0']
		        : ability;
		    i = j + 1;

		    // moves
		    j = buf.indexOf('|', i);
		    set.moves = buf
		      .substring(i, j)
		      .split(',')
		      .map(function (moveid) {
		        return Dex.moves.get(moveid).name;
		      });
		    i = j + 1;

		    // nature
		    j = buf.indexOf('|', i);
		    set.nature = buf.substring(i, j);
		    if (set.nature === 'undefined') set.nature = undefined;
		    if (set.nature) {
		      // BattleNatures is case sensitive, so if we don't do this
		      // sometimes stuff breaks. goody.
		      set.nature = set.nature.charAt(0).toUpperCase() + set.nature.slice(1);
		    }
		    i = j + 1;

		    // evs
		    j = buf.indexOf('|', i);
		    if (j !== i) {
		      var evstring = buf.substring(i, j);
		      if (evstring.length > 5) {
		        var evs = evstring.split(',');
		        set.evs = {
		          hp: Number(evs[0]) || 0,
		          atk: Number(evs[1]) || 0,
		          def: Number(evs[2]) || 0,
		          spa: Number(evs[3]) || 0,
		          spd: Number(evs[4]) || 0,
		          spe: Number(evs[5]) || 0,
		        };
		      } else if (evstring === '0') {
		        set.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		      }
		    }
		    i = j + 1;

		    // gender
		    j = buf.indexOf('|', i);
		    if (i !== j) set.gender = buf.substring(i, j);
		    i = j + 1;

		    // ivs
		    j = buf.indexOf('|', i);
		    if (j !== i) {
		      var ivs = buf.substring(i, j).split(',');
		      set.ivs = {
		        hp: ivs[0] === '' ? 31 : Number(ivs[0]),
		        atk: ivs[1] === '' ? 31 : Number(ivs[1]),
		        def: ivs[2] === '' ? 31 : Number(ivs[2]),
		        spa: ivs[3] === '' ? 31 : Number(ivs[3]),
		        spd: ivs[4] === '' ? 31 : Number(ivs[4]),
		        spe: ivs[5] === '' ? 31 : Number(ivs[5]),
		      };
		    }
		    i = j + 1;

		    // shiny
		    j = buf.indexOf('|', i);
		    if (i !== j) set.shiny = true;
		    i = j + 1;

		    // level
		    j = buf.indexOf('|', i);
		    if (i !== j) set.level = parseInt(buf.substring(i, j), 10);
		    i = j + 1;

		    // happiness
		    j = buf.indexOf(']', i);
		    var misc = undefined;
		    if (j < 0) {
		      if (i < buf.length) misc = buf.substring(i).split(',', 6);
		    } else {
		      if (i !== j) misc = buf.substring(i, j).split(',', 6);
		    }
		    if (misc) {
		      set.happiness = misc[0] ? Number(misc[0]) : 255;
		      set.hpType = misc[1];
		      set.pokeball = misc[2];
		      set.gigantamax = !!misc[3];
		      set.dynamaxLevel = misc[4] ? Number(misc[4]) : 10;
		      set.teraType = misc[5];
		    }
		    if (j < 0 || buf.indexOf('|', j) < 0) break;
		    i = j + 1;
		  }

		  return team;
		}

		function importTeam(buffer, teams) {
		  var text = buffer.split('\n');
		  var team = teams ? null : [];
		  var curSet = null;
		  if (text.length === 1 || (text.length === 2 && !text[1])) {
		    return unpackTeam(text[0]);
		  }
		  for (var i = 0; i < text.length; i++) {
		    var line = $.trim(text[i]);
		    if (line === '' || line === '---') {
		      curSet = null;
		    } else if (line.substr(0, 3) === '===' && teams) {
		      team = [];
		      line = $.trim(line.substr(3, line.length - 6));
		      var format = 'gen9';
		      var capacity = 6;
		      var bracketIndex = line.indexOf(']');
		      if (bracketIndex >= 0) {
		        format = line.substr(1, bracketIndex - 1);
		        if (format && format.slice(0, 3) !== 'gen') format = 'gen6' + format;
		        if (format && format.endsWith('-box')) {
		          format = format.slice(0, -4);
		          capacity = 24;
		        }
		        line = $.trim(line.substr(bracketIndex + 1));
		      }
		      if (teams.length && typeof teams[teams.length - 1].team !== 'string') {
		        teams[teams.length - 1].team = packTeam(teams[teams.length - 1].team);
		      }
		      var slashIndex = line.lastIndexOf('/');
		      var folder = '';
		      if (slashIndex > 0) {
		        folder = line.slice(0, slashIndex);
		        line = line.slice(slashIndex + 1);
		      }
		      teams.push({
		        name: line,
		        format: format,
		        gen: parseInt(format[3], 10) || 6,
		        team: team,
		        capacity: capacity,
		        folder: folder,
		        iconCache: '',
		      });
		    } else if (line.includes('|')) {
		      // packed format
		      curSet = null;
		      teams.push(
		        IS_REWRITE_CLIENT
		          ? PS.teams.unpackLine(line)
		          : Storage.unpackLine(line),
		      );
		    } else if (!curSet) {
		      curSet = { name: '', species: '', gender: '' };
		      team.push(curSet);
		      var atIndex = line.lastIndexOf(' @ ');
		      if (atIndex !== -1) {
		        curSet.item = line.substr(atIndex + 3);
		        if (toID(curSet.item) === 'noitem') curSet.item = '';
		        line = line.substr(0, atIndex);
		      }
		      if (line.substr(line.length - 4) === ' (M)') {
		        curSet.gender = 'M';
		        line = line.substr(0, line.length - 4);
		      }
		      if (line.substr(line.length - 4) === ' (F)') {
		        curSet.gender = 'F';
		        line = line.substr(0, line.length - 4);
		      }
		      var parenIndex = line.lastIndexOf(' (');
		      if (line.substr(line.length - 1) === ')' && parenIndex !== -1) {
		        line = line.substr(0, line.length - 1);
		        curSet.species = Dex.species.get(line.substr(parenIndex + 2)).name;
		        line = line.substr(0, parenIndex);
		        curSet.name = line;
		      } else {
		        curSet.species = Dex.species.get(line).name;
		        curSet.name = '';
		      }
		    } else if (line.substr(0, 7) === 'Trait: ') {
		      line = line.substr(7);
		      curSet.ability = line;
		    } else if (line.substr(0, 9) === 'Ability: ') {
		      line = line.substr(9);
		      curSet.ability = line;
		    } else if (line === 'Shiny: Yes') {
		      curSet.shiny = true;
		    } else if (line.substr(0, 7) === 'Level: ') {
		      line = line.substr(7);
		      curSet.level = +line;
		    } else if (line.substr(0, 11) === 'Happiness: ') {
		      line = line.substr(11);
		      curSet.happiness = +line;
		    } else if (line.substr(0, 10) === 'Pokeball: ') {
		      line = line.substr(10);
		      curSet.pokeball = line;
		    } else if (line.substr(0, 14) === 'Hidden Power: ') {
		      line = line.substr(14);
		      curSet.hpType = line;
		    } else if (line.substr(0, 11) === 'Tera Type: ') {
		      line = line.substr(11);
		      curSet.teraType = line;
		    } else if (line.substr(0, 15) === 'Dynamax Level: ') {
		      line = line.substr(15);
		      curSet.dynamaxLevel = +line;
		    } else if (line === 'Gigantamax: Yes') {
		      curSet.gigantamax = true;
		    } else if (line.substr(0, 5) === 'EVs: ') {
		      line = line.substr(5);
		      var evLines = line.split('/');
		      curSet.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
		      for (var j = 0; j < evLines.length; j++) {
		        var evLine = $.trim(evLines[j]);
		        var spaceIndex = evLine.indexOf(' ');
		        if (spaceIndex === -1) continue;
		        var statid = BattleStatIDs[evLine.substr(spaceIndex + 1)];
		        var statval = parseInt(evLine.substr(0, spaceIndex), 10);
		        if (!statid) continue;
		        curSet.evs[statid] = statval;
		      }
		    } else if (line.substr(0, 5) === 'IVs: ') {
		      line = line.substr(5);
		      var ivLines = line.split(' / ');
		      curSet.ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
		      for (var j = 0; j < ivLines.length; j++) {
		        var ivLine = ivLines[j];
		        var spaceIndex = ivLine.indexOf(' ');
		        if (spaceIndex === -1) continue;
		        var statid = BattleStatIDs[ivLine.substr(spaceIndex + 1)];
		        var statval = parseInt(ivLine.substr(0, spaceIndex), 10);
		        if (!statid) continue;
		        if (isNaN(statval)) statval = 31;
		        curSet.ivs[statid] = statval;
		      }
		    } else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
		      var natureIndex = line.indexOf(' Nature');
		      if (natureIndex === -1) natureIndex = line.indexOf(' nature');
		      if (natureIndex === -1) continue;
		      line = line.substr(0, natureIndex);
		      if (line !== 'undefined') curSet.nature = line;
		    } else if (line.substr(0, 1) === '-' || line.substr(0, 1) === '~') {
		      line = line.substr(1);
		      if (line.substr(0, 1) === ' ') line = line.substr(1);
		      if (!curSet.moves) curSet.moves = [];
		      if (line.substr(0, 14) === 'Hidden Power [') {
		        var hptype = line.substr(14, line.length - 15);
		        line = 'Hidden Power ' + hptype;
		        var type = Dex.types.get(hptype);
		        if (!curSet.ivs && type) {
		          curSet.ivs = {};
		          for (var stat in type.HPivs) {
		            curSet.ivs[stat] = type.HPivs[stat];
		          }
		        }
		      }
		      if (line === 'Frustration' && curSet.happiness === undefined) {
		        curSet.happiness = 0;
		      }
		      curSet.moves.push(line);
		    }
		  }
		  if (
		    teams &&
		    teams.length &&
		    typeof teams[teams.length - 1].team !== 'string'
		  ) {
		    teams[teams.length - 1].team = packTeam(teams[teams.length - 1].team);
		  }
		  return team;
		}

		function exportTeam(team) {
		  if (!team) return '';
		  if (typeof team === 'string') {
		    if (team.indexOf('\n') >= 0) return team;
		    team = unpackTeam(team);
		  }
		  let text = '';
		  for (let i = 0; i < team.length; i++) {
		    const curSet = team[i];
		    if (!curSet.moves) curSet.moves = [];
		    if (curSet.name && curSet.name !== curSet.species)
		      text += `${curSet.name} (${curSet.species})`;
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
		    if (
		      typeof curSet.happiness === 'number' &&
		      curSet.happiness !== 255 &&
		      !isNaN(curSet.happiness)
		    ) {
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
		        if (
		          move.substr(0, 13) === 'Hidden Power ' &&
		          move.substr(0, 14) !== 'Hidden Power ['
		        ) {
		          hpType = move.substr(13);
		          if (!Dex.types.isName(hpType)) {
		            continue;
		          }
		          for (const stat in BattleStatNames) {
		            if (
		              (curSet.ivs[stat] === undefined ? 31 : curSet.ivs[stat]) !==
		              (Dex.types.get(hpType).HPivs[stat] || 31)
		            ) {
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
		          if (
		            typeof curSet.ivs[stat] === 'undefined' ||
		            isNaN(curSet.ivs[stat]) ||
		            curSet.ivs[stat] == 31
		          )
		            continue;
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
		    if (curSet.moves)
		      for (var j = 0; j < curSet.moves.length; j++) {
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


	// ==============================

	function monHTML(mon) {
	  // The HTML for each individual sprite
	  mon = deepClone(mon);
	  const arr = new WINDOW.Array();
	  arr.push(mon);
	  const mainNode = document.createElement('div');
	  mainNode.classList.add('threeisland-set');
	  const monIcon = document.createElement('span');
	  monIcon.style.cssText = `${Dex.getPokemonIcon(mon.species)};position:absolute;top:0;left:0`;
	  monIcon.classList.add('picon');
	  if (mon.teraType) {
	    const species = Dex.species.get(mon.species);
	    const nonStdTera = !species || species.types[0] !== mon.teraType;
	    if (
	      OPTIONS['show-tera'] === '1' ||
	      (OPTIONS['show-tera'] === '2' && nonStdTera)
	    ) {
	      const teraIcon = document.createElement('span');
	      const teraImage = document.createElement('img');
	      teraImage.setAttribute(
	        'src',
	        `https://play.pokemonshowdown.com/sprites/types/Tera${mon.teraType}.png`,
	      );
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

	function fetchPaste(url) {
	  // Gets and stores the data from Pastes that are posted
	  return new Promise((resolve, reject) => {
	    if (!url) return reject(new Error('No URL'));
	    let pattern;
	    switch (true) {
	      case !!(pattern = url.match(/pokepast\.es\/([a-zA-Z0-9]+)/)): {
	        if (pattern[1] === 'constructor')
	          return reject(new Error('Well someone tried to screw me up'));
	        const cacheKey = `pokepast.es:${pattern[1]}`;
	        if (generatedPasteHTML[cacheKey]) return resolve(cacheKey);
	        const jsonLink = `https://pokepast.es/${pattern[1]}/json`;
	        fetch(jsonLink)
	          .then((res) => res.json())
	          .then((data) => {
	            const team = importTeam(data.paste);
	            const teamString = packTeam(team);
	            const pasteHTML = document.createElement('span');
	            for (let i = 0; i < team.length && i < 24; i++)
	              pasteHTML.appendChild(monHTML(team[i])); // Access denied if we try to run Array#map
	            if (team.length > 24)
	              pasteHTML.appendChild(
	                document.createTextNode(`... and ${team.length - 1} more`),
	              );
	            let format = 'gen9';
	            const matched = data.notes.match(
	              /[Ff]ormat *(?:[:-] *)?([a-z0-9]+)/,
	            );
	            if (matched) format = matched[1];
	            if (!format.startsWith('gen')) format = 'gen9' + format;
	            generatedPasteHTML[cacheKey] = {
	              teamString,
	              title: data.title,
	              pasteHTML,
	              team,
	              format,
	            };
	            resolve(cacheKey);
	          })
	          .catch((err) => {
	            log(
	              `Three Island: Error in loading ${url} (this is completely safe)`,
	              err,
	            );
	            reject(new Error('Paste link is invalid.'));
	          });
	        break;
	      }
	      case !!(pattern = url.match(/crob\.at\/([a-zA-Z0-9]+)/)): {
	        if (pattern[1] === 'constructor')
	          return reject(new Error('Well someone tried to screw me up'));
	        const cacheKey = `crob.at:${pattern[1]}`;
	        if (generatedPasteHTML[cacheKey]) return resolve(cacheKey);
	        const jsonLink = `https://crob.at/api/team/${pattern[1]}`;
	        fetch(jsonLink)
	          .then((res) => res.json())
	          .then((data) => {
	            const pasteHTML = document.createElement('span');
	            const teams = (data.teams || []).map((t) => {
	              const team = importTeam(t.paste);
	              return {
	                team,
	                teamString: packTeam(team),
	                format: t.format || 'gen9',
	              };
	            });

	            const SHOWN_TEAMS = 3;

	            teams.forEach((team, i) => {
	              if (i < SHOWN_TEAMS) {
	                if (i > 0) pasteHTML.appendChild(document.createElement('hr'));
	                const teamDiv = document.createElement('div');
	                for (let j = 0; j < team.team.length && j < 24; j++)
	                  teamDiv.appendChild(monHTML(team.team[j]));
	                if (team.team.length > 24)
	                  teamDiv.appendChild(
	                    document.createTextNode(
	                      `... and ${team.team.length - 1} more`,
	                    ),
	                  );
	                pasteHTML.appendChild(teamDiv);
	              }
	            });

	            if (teams.length > SHOWN_TEAMS) {
	              pasteHTML.appendChild(document.createElement('hr'));
	              const moreText = document.createElement('div');
	              moreText.style.textAlign = 'center';
	              moreText.innerText = `... and ${teams.length - 3} more teams`;
	              pasteHTML.appendChild(moreText);
	            }

	            generatedPasteHTML[cacheKey] = {
	              teamString: teams[0]?.teamString,
	              title: data.name,
	              pasteHTML,
	              team: teams[0]?.team,
	              format: teams[0]?.format,
	              teams,
	            };
	            resolve(cacheKey);
	          })
	          .catch((err) => {
	            log(
	              `Three Island: Error in loading ${url} (this is completely safe)`,
	              err,
	            );
	            reject(new Error('Paste link is invalid.'));
	          });
	        break;
	      }
	      default:
	        reject(new Error('Invalid paste'));
	    }
	  });
	}

	function addTeam(data) {
	  // Store the team in the Teambuilder
	  const teamsToAdd = data.teams || [
	    {
	      teamString: data.teamString,
	      format: data.format,
	      team: data.team,
	    },
	  ];

	  if (IS_REWRITE_CLIENT) {
	    teamsToAdd.forEach((t, i) => {
	      const newTeam = new WINDOW.Object();
	      newTeam.name =
	        teamsToAdd.length > 1 ? `${data.title} (${i + 1})` : data.title;
	      newTeam.key = PS.teams.getKey(newTeam.name);
	      newTeam.format = t.format;
	      newTeam.packedTeam = t.teamString;
	      newTeam.isBox = t.team.length > 6;
	      newTeam.folder = '';
	      newTeam.iconCache = null;
	      PS.teams.unshift(newTeam);
	    });

	    PS.teams.update();
	    PS.teams.save();
	  } else {
	    teamsToAdd.forEach((t, i) => {
	      const newTeam = new WINDOW.Object();
	      newTeam.name =
	        teamsToAdd.length > 1 ? `${data.title} (${i + 1})` : data.title;
	      newTeam.format = t.format;
	      newTeam.team = t.teamString;
	      newTeam.capacity = t.team.length > 6 ? 24 : 6;
	      newTeam.folder = '';
	      newTeam.iconCache = Storage.packedTeamIcons(t.teamString);
	      Storage.teams.unshift(newTeam);
	    });

	    if (app.rooms.teambuilder) app.rooms.teambuilder.update();
	    Storage.saveTeams();
	  }
	}

	function loadPaste(url) {
	  // Adds the team to the storage + teambuilder
	  return new Promise((resolve, reject) => {
	    if (!url) return reject(new Error('No URL'));
	    let paste;
	    switch (true) {
	      case !!(paste = url.match(/(pokepast\.es)\/([a-zA-Z0-9]+)/)):
	        break;
	      case !!(paste = url.match(/(crob\.at)\/([a-zA-Z0-9]+)/)):
	        break;
	      default:
	        return reject(new Error('Invalid paste'));
	    }
	    if (paste[1] === 'constructor')
	      return reject(new Error('Well someone tried to screw me up'));
	    const cacheKey = paste[1] + ':' + paste[2];
	    if (generatedPasteHTML[cacheKey])
	      return resolve(generatedPasteHTML[cacheKey]);
	    else
	      return fetchPaste(url).then((data) => resolve(generatedPasteHTML[data]));
	  })
	    .then((data) => addTeam(data))
	    .catch(error);
	}

	// Watching rooms

	const IS_REWRITE_CLIENT = !!document.querySelector('.ps-frame');

	const ROOM_OBSERVERS = {};
	const PM_OBSERVERS = {};

	function validRoom(room) {
	  if (room.startsWith('room-')) room = room.substr(5);
	  if (room === '') return '';
	  if (room.startsWith('battle-')) return 'battle';
	  if (['battles', 'ladder', 'rooms', 'teambuilder'].includes(room))
	    return false; // Client special rooms
	  if (room.includes('-') && !room.startsWith('groupchat-')) return false; // Server special rooms
	  return true;
	}

	function runCheck(ftd, isPM) {
	  // Format chat messages with valid PokePaste links
	  if (!ftd) return;
	  if (ftd.nodeName !== 'A')
	    return [...ftd.childNodes].forEach((node) => runCheck(node, isPM));
	  // If the node isn't a link, check if any of its children are links (eg: italicized text)
	  if (
	    /^(?:https?:\/\/)?(?:pokepast\.es|crob\.at)\/[a-zA-Z0-9]+$/.test(ftd.href)
	  ) {
	    const link = ftd.href;
	    fetchPaste(link)
	      .then((ref) => {
	        const data = generatedPasteHTML[ref];
	        const tooltip = document.createElement('span');
	        if (isPM) tooltip.classList.add('threeisland-pm');
	        const tooltipInner = document.createElement('center');
	        tooltipInner.classList.add('threeisland-images');
	        tooltipInner.appendChild(data.pasteHTML.cloneNode(true));
	        tooltip.appendChild(tooltipInner);
	        tooltip.classList.add('threeisland-tooltip');
	        const button = document.createElement('button');
	        button.addEventListener('click', (e) => {
	          loadPaste(link);
	          if (e.target.nodeName === 'BUTTON') e.preventDefault(); // Don't redirect if they clicked the Import button
	        });
	        tooltip.addEventListener('click', (e) => {
	          if (e.target.nodeName === 'PRE') {
	            // They clicked the set; we copy this to clipboard!
	            e.preventDefault();
	            const set = e.target.innerText;
	            const dark = document
	              .getElementsByTagName('html')[0]
	              ?.classList.contains('dark');
	            WINDOW.navigator?.clipboard?.writeText(set)?.catch(() => {});
	            e.target.style['background-color'] = dark ? '#3d454e' : '#c1c8c8';
	            setTimeout(
	              () =>
	                (e.target.style['background-color'] = dark
	                  ? '#0d151e'
	                  : '#e1e8e8'),
	              1010,
	            );
	          }
	        });
	        button.appendChild(document.createTextNode('Import'));
			button.style.margin = '4px';
	        tooltip.appendChild(button);
	        ftd.classList.add('threeisland-link');
	        if (isPM) ftd.classList.add('threeisland-pm');
	        ftd.appendChild(tooltip);
	      })
	      .catch((err) => log(`Three Island: `, err));
	  }
	}

	function runCodeCheck(details, isPM) {
	  // Format !code blocks with valid teams
	  if (!details) return;
	  // Generate the text content of the !code message
	  const summaryContent = details.childNodes[0].innerHTML;
	  const textContentWithTags = `${summaryContent}<br>${[...details.childNodes].slice(1).map(mapNodeToContent).join('')}`;
	  const textContent = textContentWithTags
	    .replace(/<br>/g, '\n')
	    .replace(/<wbr>/g, '');
	  if (textContent.includes('Ability: ')) {
	    // Probably a set!
	    // We let the user decide because I'm lazy
	    try {
	      const team = importTeam(textContent);
	      const importButton = document.createElement('button');
	      importButton.addEventListener('click', (e) => {
	        addTeam({
	          title: `Untitled ${IS_REWRITE_CLIENT ? PS.teams.list.length : Storage.teams.length + 1}`,
	          teamString: packTeam(team),
	          team,
	          format: 'gen9',
	        });
	        if (e.target.nodeName === 'BUTTON') e.preventDefault(); // Don't expand/collapse if they clicked the Import button
	      });
	      importButton.innerText = 'Import';
	      details.childNodes[0].insertBefore(
	        document.createElement('br'),
	        details.childNodes[0].childNodes[0],
	      );
	      details.childNodes[0].insertBefore(
	        document.createElement('br'),
	        details.childNodes[0].childNodes[0],
	      );
	      details.childNodes[0].insertBefore(
	        importButton,
	        details.childNodes[0].childNodes[0],
	      );
	    } catch (e) {}
	  }
	}

	function mapNodeToContent(node) {
	  // Function to convert HTML nodes into their text counterparts
	  if (node.nodeName === 'BR') return '\n';
	  if (node.nodeName === 'WBR') return '';
	  return node.textContent;
	}

	function checkMessageElement(msg, isPM) {
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

	function watchRoom(node, spc) {
	  // Run the check function above on every messagebox that appears in chat
	  const observerW = new MutationObserver((mutations) => {
	    mutations.forEach((mutation) => {
	      for (const msg of mutation.addedNodes) checkMessageElement(msg);
	    });
	  });
	  let chatNode;
	  if (IS_REWRITE_CLIENT) {
	    chatNode = node.childNodes[0]?.childNodes[0]?.childNodes[0];
	  } else {
	    switch (spc) {
	      case 'battle': {
	        chatNode = Array.from(
	          Array.from(node.children).find((element) => {
	            return element.classList.contains('battle-log');
	          }).children,
	        ).find((element) => {
	          return element.classList.contains('message-log');
	        });
	        break;
	      }
	      default: {
	        chatNode = node.childNodes[1]?.childNodes[0];
	      }
	    }
	  }

	  if (chatNode && chatNode.nodeType === 1) {
	    for (const msg of chatNode.children) checkMessageElement(msg);
	    observerW.observe(chatNode, { childList: true });
	  } else log(`Three Island: ran into a weird chatroom`, node, chatNode, spc);
	  return observerW;
	}

	Object.entries(IS_REWRITE_CLIENT ? PS.rooms : app.rooms).forEach(([room, data]) => {
	  // Load all rooms on connecting
	  const val = validRoom(room);
	  if (!val) return;
	  const node = IS_REWRITE_CLIENT ? document.querySelector(`#room-${room}`) : data.el;
	  const observerR = watchRoom(node, val);
	  ROOM_OBSERVERS[room] = { node, observerR };
	});

	const observer = new MutationObserver((mutations) => {
	  // Keep an eye out for rooms we're joining / leaving
	  mutations.forEach((mutation) => {
	    for (const node of mutation.addedNodes) {
	      if (node.nodeType !== 1) continue;
	      const roomRoom = node.id;
	      if (!roomRoom || !roomRoom.startsWith('room-')) continue;
	      const room = roomRoom.substr(5);
	      const val = validRoom(room);
	      if (!val) continue;
	      const observerA = watchRoom(node, val);
	      ROOM_OBSERVERS[room] = { node, observer: observerA };
	    }
	    for (const node of mutation.removedNodes) {
	      if (node.nodeType !== 1 || !node.id.startsWith('room-')) continue;
	      const id = node.id.substr(5);
	      ROOM_OBSERVERS[id]?.observer?.disconnect();
	      delete ROOM_OBSERVERS[id];
	    }
	  });
	});
	observer.observe(
	  IS_REWRITE_CLIENT
	    ? document.querySelector('.ps-frame')
	    : document.querySelector('body'),
	  { childList: true },
	);

	const observerPM = new MutationObserver((mutations) => {
	  // The above, but for users in your PMs instead
	  mutations.forEach((mutation) => {
	    for (const node of mutation.addedNodes) {
	      if (node.nodeType !== 1) continue;
	      const user = IS_REWRITE_CLIENT ? node.getAttribute('data-roomid').replace('dm-', '') : node.getAttribute('data-userid');
	      if (!user) continue;
	      const observerB = new MutationObserver((mutations) => {
	        mutations.forEach((mutation) => {
	          for (const msg of mutation.addedNodes) checkMessageElement(msg, true);
	        });
	      });
	      const chatNode = IS_REWRITE_CLIENT
	        ? node.querySelector('.message-log')
	        : node.children[1]?.children[1];
	      if (chatNode) {
	        for (const msg of chatNode.children) checkMessageElement(msg, true);
	        observerB.observe(chatNode, { childList: true });
	      }
	      PM_OBSERVERS[user] = { node, observer: observerB };
	    }
	    for (const node of mutation.removedNodes) {
	      if (node.nodeType !== 1) continue;
	      const user = node.getAttribute('data-userid');
	      PM_OBSERVERS[user]?.observer.disconnect();
	      delete PM_OBSERVERS[user];
	    }
	  });
	});
	observerPM.observe(document.querySelector(IS_REWRITE_CLIENT ? '.mainmenu-mini-windows' : '.pmbox'), { childList: true });

	function addCSS(css) {
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
			height: 32px;
			width: 40px;
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

})()).catch(console.error);
