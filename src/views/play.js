import View from '../common/View';
import mod from '../mod';

import tacticsMenu from '../game/tacticsMenu';
import cameraControls from '../game/cameraControls';
import board from '../game/board';
import counts from '../game/counts';
import gameOver from '../game/gameOver';

import '../game/moves';
import './play.css';

let play = new View({
    id: 'play',
    className: 'play topLevelView checkerSelect',
});

let selectYourChecker = new View({
    id: 'checkerSelect',
    innerText: 'Select your checker.',
    className: 'notice',
});

let noAvailableMoves = new View({
    id: 'noAvailableMoves',
    innerText: 'No available moves. Choose an Ally Action.',
    className: 'notice',
});

function handleCheckerSelection(needsPlayerChecker) {
    if (needsPlayerChecker) {
        play.classify('+checkerSelect');

    } else {
        play.classify('-checkerSelect');
    }
}

mod.watch('checkerSelect', handleCheckerSelection);
mod.watch('noPlayerMoves', (hasNoMoves) => {
    if (hasNoMoves) {
        play.classify('+noAvailableMoves');
    } else {
        play.classify('-noAvailableMoves');
    }
});

play.kids(
    board.el,
    cameraControls.el,
    tacticsMenu.el,
    counts.el,
    gameOver.el,
    selectYourChecker.el,
    noAvailableMoves.el
);

// on an initial load, jump right into checker selection
//handleCheckerSelection();
export default play;
