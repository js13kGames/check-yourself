import View from '../common/View';
import Menu from '../common/Menu';
import Text from '../common/Text';
import mod from '../mod';

import './tacticsMenu.css';

mod.set({
    allyAction: null,
});

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
    },
    {
        id: 'cancel',
        text: 'Cancel',
    }
];

let actionText = 'Ally Action';

let wrapper = new View({
    id: 'tactics',
});

let squadAction = new Text({
    id: 'squadAction',
    text: actionText,
});

let menu = new Menu({
    id: 'tacticsMenu',
    options: menuOptions,
    onSelect: (e) => {
        let tactic = e.target.id;

        if (tactic === 'cancel') {
            wrapper.classify('-showMenu');
            return;
        }

        mod.set({ allyAction: e.target.id });
    },
});

//
//
//
function updateMenu() {
    let playerHasJump = mod.get('playerHasJump');

    if (mod.get('allyHasJump') || playerHasJump) {
        squadAction.classify('+disabled');

    } else {
        squadAction.print(actionText);
        squadAction.classify('-disabled');
    }
}

//
//
//
function handleMenu(e) {
    e.preventDefault();

    let target = e.target;
    let isDisabled = target.classList.contains('disabled');
    //let isAllyJump = target.classList.contains('forceJump');

    if (isDisabled) {
        return;
    /*
    } else if (isAllyJump) {
        mod.set({
            allyAction: 'jump',
        });
        return;
    */
    }

    wrapper.classify('+showMenu');
}

//
//
//
function updateCurrentTactic() {
    wrapper.classify('-showMenu');
}

mod.watch('allyAction', updateCurrentTactic);
mod.watch('playerHasJump', updateMenu);
mod.watch('allyHasJump', updateMenu);

wrapper.onClick('#squadAction', handleMenu);

wrapper.kids(
    squadAction.el,
    menu.el
);

export default wrapper;
