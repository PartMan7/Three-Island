const opts = [{
	id: 'ext-opt',
	states: ['0', '1'],
	stateLabels: {
		'0': 'Disabled',
		'1': 'Enabled'
	},
	set: 'enabled',
	std: '1'
}, {
	id: 'item-opt',
	states: ['0', '1'],
	stateLabels: {
		'0': 'No item icons',
		'1': 'Showing item icons'
	},
	set: 'show-item',
	std: '1'
}, {
	id: 'tera-opt',
	states: ['0', '2', '1'],
	stateLabels: {
		'0': 'No Tera icons',
		'2': 'Tera icons if different',
		'1': 'Showing Tera icons'
	},
	set: 'show-tera',
	std: '1'
}];

const elements = {};

opts.forEach(({ id, states, stateLabels, set, std }) => {
	const element = document.getElementById(id);
	elements[id] = element;
	element.addEventListener('click', e => {
		const state = element.getAttribute('state');
		const nextState = states.includes(state) ? states[(states.indexOf(state) + 1) % states.length] : std;
		element.setAttribute('state', nextState);
		element.title = stateLabels[nextState];
		chrome.storage.sync.set({ [set]: nextState }).catch(console.error);
	});
});

window.addEventListener('DOMContentLoaded', () => {
	opts.forEach(({ id, states, stateLabels, set, std }) => {
		chrome.storage.sync.get(set).then(fetched => {
			let val = fetched[set];
			if (!states.includes(val)) {
				val = std;
				chrome.storage.sync.set({ [set]: val }).catch(console.error);
			}
			elements[id].setAttribute('state', val);
			elements[id].title = stateLabels[val];
		});
	});
});
