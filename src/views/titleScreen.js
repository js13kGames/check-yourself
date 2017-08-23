import View from '../common/View';
import Menu from '../common/Menu';
import Text from '../common/Text';
import mod from '../mod';

let titleScreen = new View({
    id: 'titleScreen',
    className: 'titleScreen topLevelView',
});

function changeView(e) {
    mod.set({
        view: e.target.id
    });
}

let menu = new Menu({
    className: 'titleMenu',
    id: 'titleMenu',
    onSelect: changeView,
    options: [
        {
            id: 'play',
            text: 'Play',
        },
        {
            id: 'settings',
            text: 'Settings',
        }
    ],
});

let title = new Text({
    id: 'titleText',
    text: 'Check Yourself',
    variant: 'title',
});

titleScreen.kids(
    title.el,
    menu.el
);

export default titleScreen;
