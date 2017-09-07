
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
        className: 'disabled',
    },
    {
        id: 'defensive',
        text: 'Play it Safe',
        className: 'disabled',
    },
    {
        id: 'protectMe',
        text: 'Protect Me',
        className: 'disabled',
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

        if (e.target.classList.contains('disabled')) {
            return;
        }

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
    let allyHasJump = mod.get('allyHasJump');

    if (
        (allyHasJump && !playerHasJump) ||
        (playerHasJump && !allyHasJump)
    ) {
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

    if (isDisabled) {
        return;
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
mod.watch('isTurn', () => wrapper.classify('-showMenu'));

wrapper.onClick('#squadAction', handleMenu);

wrapper.kids(
    squadAction.el,
    menu.el
);

export default wrapper;
