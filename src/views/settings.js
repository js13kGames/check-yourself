import View from '../common/View';
import Menu from '../common/Menu';
import Text from '../common/Text';
import mk from '../common/mk';
import mod from '../mod';

import './settings.css';

let settings = new View({
    id: 'settings',
    className: 'settings topLevelView',
});

let title = new Text({
    text: 'Settings',
    variant: 'title'
});

//
//
//
function renderSetting(id, title, menuOptions, onChange) {
    let wrapper = mk('div', {
        id: `${id}Wrapper`
    });

    let heading = new Text({
        text: title,
        variant: 'subtitle',
    });

    let menu = new Menu({
        id: id,
        className: 'settingsMenu',
        onSelect: onChange,
        options: menuOptions,
    });

    wrapper.kids(heading.el, menu.el);
    return wrapper.el;
}

//
//
//
function renderBoardSizeOptions() {
    let getColsFromId = (id) => {
        return parseInt(id.replace('cols', ''), 10);
    };
    let columns = mod.get('columns');
    let sizeOptions = [
        {
            id: 'cols8',
            text: '8x8 Board',
            active: true,
        },
        {
            id: 'cols10',
            text: '10x10 Board',
        },
        {
            id: 'cols12',
            text: '12x12 Board',
        }
    ];

    return renderSetting(
        'boardSize',
        'Field of Play',
        sizeOptions,
        (e) => {
            mod.set({ columns: getColsFromId(e.target.id) });
        }
    );
}

//
//
//
function renderAiOptions() {
    let aiOptions = [
        {
            id: 'normal',
            text: 'Normal',
            active: true,
        },
        {
            id: 'smart',
            text: 'Smart'
            },
        {
            id: 'random',
            text: 'Random'
        }
    ];

    return renderSetting(
        'aiOptions',
        'AI Behavior',
        aiOptions,
        (e) => {
            mod.set({ aiLevel: e.target.id });
        }
    );
}

let menuWrapper = mk('div', {
    className: 'settingsMenuWrapper',
});

let ctaWrapper = mk('div', {
    className: 'settingsCta',
});

let back = mk('a', {
    id: 'back',
    innerHTML: '<span>&laquo;</span> Back',
});

let start = mk('a', {
    id: 'start',
    innerHTML: 'Start Game <span>&raquo;</span>',
});

menuWrapper.kids(renderBoardSizeOptions(), renderAiOptions());
ctaWrapper.kids(back.el, start.el);

settings.onClick('#back', () => mod.set({ view: 'titleScreen'}));
settings.onClick('#start', () => mod.set({ view: 'play' }));

settings.kids(
    title.el,
    menuWrapper.el,
    ctaWrapper.el
);

export default settings;


/*
'Your opponents and allies will look 1 move ahead and act ' +
'accordingly. Your moves will dictate the flow of play.'

'Your opponents and allies will look 3 moves ahead, laying ' +
'traps and playing the long game. You\'ll be a part of the ' +
'bigger picture.'

'Your opponents -- and your allies -- will act randomly. They ' +
'may prove to be brilliant or asinine.'

*/
