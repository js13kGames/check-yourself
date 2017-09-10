import El from './common/El';
import game from './game';

import './index.css';

let viewport = new El('main');
viewport.attribute({
    id: 'viewport',
});

viewport.kids(game.el);
document.body.appendChild(viewport.el);
