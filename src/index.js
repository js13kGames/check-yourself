import El from './common/El';
import titleScreen from './titleScreen';
import endScreen from './endScreen';
import game from './game';

import './index.css';

const BOD = document.body;

let viewport = new El('main')
    .attribute({
        id: 'viewport',
    })
    .kids(titleScreen.el);

//
function loadGame() {
    titleScreen.onTrans(() => {
        titleScreen.destructor();
        viewport.kids(
            endScreen.el,
            game.el
        );

        setTimeout(() => {
            viewport.classify('-transitionOut');
            game.classify('+transitionIn');
        }, 10);
    });

    viewport.classify('+transitionOut');
}

titleScreen.onClick('.newGame', loadGame);
BOD.appendChild(viewport.el);
