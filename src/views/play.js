import View from '../common/View';
import mod from '../mod';
import turn from '../game/turn';
import board from '../game/board';

import cameraControls from '../game/cameraControls';

let isPlayerCheckerChosen = false;
let play = new View({
    id: 'play',
    className: 'play topLevelView checkerSelect',
});

mod.watch('playerChecker', () => {
    if (!isPlayerCheckerChosen) {
        play.classify('-checkerSelect');
        play.kids(cameraControls.fadeIn());

        isPlayerCheckerChosen = true;
    }
});

play.kids(
    board.el
);


export default play;
