import View from '../common/View';
import Menu from '../common/Menu';
import state from '../common/state';

import './titleScreen.css';

const menuOptions = [
    {
        innerText: 'The Initial Option'
    },
    {
        innerText: 'Another Option'
    }
];

console.log('State:', state);
let titleMenu = new Menu(menuOptions);

let titleScreen = new View({
    el: 'div',
    id: 'ts',
});
titleScreen.kids(titleMenu.el);

export default titleScreen;
