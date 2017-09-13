import El from './common/El';
import titleScreen from './titleScreen';
import game from './game';

import './index.css';

const BOD = document.body;

let viewport = new El('main')
    .attribute({
        id: 'viewport',
    })
    .kids(game.el);
    //.kids(titleScreen.el);

game.classify('+transitionIn');

//
function loadGame() {
    titleScreen.onTrans(() => {
        titleScreen.destructor();
        viewport.kids(game.el);

        setTimeout(() => {
            viewport.classify('-transitionOut');
            game.classify('+transitionIn');
        }, 10);
    });

    viewport.classify('+transitionOut');
}

titleScreen.onClick('.newGame', loadGame);
BOD.appendChild(viewport.el);
