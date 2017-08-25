import View from '../common/View';
import Menu from '../common/Menu';
import Text from '../common/Text';
import mod from '../mod';

import './tacticsMenu.css';

let wrapper = new View({
    id: 'tactics',
});

let menuOptions = [
    {
        id: 'balanced',
        text: 'Balanced',
    },
    {
        id: 'offensive',
        text: 'Offensive',
    },
    {
        id: 'defensive',
        text: 'Defensive'
    },
    {
        id: 'protectMe',
        text: 'Protect Me',
    }
];

function changeTactics(e) {
    mod.set({
        allyTactics: e.target.id
    });

    wrapper.classify('-showMenu');
}

function getTacticText(id) {
    let tacticObj = menuOptions.filter((opt) => {
        return opt.id === id;
    });

    return tacticObj[0].text;
}

function toggleMenu() {
    wrapper.classify('~showMenu');
}

let menu = new Menu({
    id: 'tacticsMenu',
    options: menuOptions,
    onSelect: changeTactics,
});

let text = new Text({
    id: 'currentTactic',
    text: getTacticText(mod.get('allyTactics'))
});

mod.watch('allyTactics', (val) => text.print(getTacticText(val)));

wrapper.onClick('#currentTactic', toggleMenu);
wrapper.kids(menu.el, text.el);

export default wrapper;
