import View from '../common/View';
import mod from '../mod';

import tacticsMenu from '../game/tacticsMenu';
import cameraControls from '../game/cameraControls';
import board from '../game/board';
import counts from '../game/counts';

import '../game/moves';

let play = new View({
    id: 'play',
    className: 'play topLevelView checkerSelect',
});

function handleCheckerSelection(playerChecker) {
    if (!playerChecker) {
        play.classify('+checkerSelect');

    } else {
        play.classify('-checkerSelect');
    }
}

function handleEndGame(youWon) {
    if (youWon) {
        alert('Triumph!');
    } else {
        alert('All is lost ...');
    }
}

mod.watch('playerChecker', handleCheckerSelection);
mod.watch('youWon', handleEndGame);

play.kids(
    board.el,
    cameraControls.el,
    tacticsMenu.el,
    counts.el
);

// on an initial load, jump right into checker selection
handleCheckerSelection();
export default play;
