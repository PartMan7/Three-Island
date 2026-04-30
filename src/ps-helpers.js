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
