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
'{PS_HELPERS}';

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
{CSS}`;

addCSS(CSS);
