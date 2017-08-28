import View from '../common/View';
import Menu from '../common/Menu';
import Text from '../common/Text';
import mod from '../mod';

import './tacticsMenu.css';

let menuOptions = [
    {
        id: 'aggressive',
        text: 'Be Aggressive',
    },
    {
        id: 'defensive',
        text: 'Play it Safe'
    },
    {
        id: 'protectMe',
        text: 'Protect Me',
    },
    {
        id: 'random',
        text: 'Go Random!',
    }
];

let wrapper = new View({
    id: 'tactics',
});

let tacticTitle = new Text({
    className: 'tactics-title',
    text: 'Squad Tactics',
    variant: 'label',
});

let currentTactic = new Text({
    id: 'currentTactic',
    text: getTacticText(),
});

let menu = new Menu({
    id: 'tacticsMenu',
    options: menuOptions,
    onSelect: (e) => mod.set({ allyAction: e.target.id }),
});

//
//
//
function getTacticText(tactic) {
    if (!tactic) {
        tactic = mod.get('allyAction');
    }

    let currentTactic = menuOptions.filter((opt) => opt.id === tactic);
    return currentTactic[0].text;
}

//
//
//
function updateCurrentTactic(tactic) {
    currentTactic.print(getTacticText(tactic));
    wrapper.classify('-showMenu');
}

mod.watch('allyAction', updateCurrentTactic);

wrapper.onClick('#currentTactic', () => wrapper.classify('~showMenu'));

wrapper.kids(
    tacticTitle.el,
    currentTactic.el,
    menu.el
);

export default wrapper;
