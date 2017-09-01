import View from '../common/View';
import mod from '../mod';
import '../game/moves';
import board from '../game/board';

import tacticsMenu from '../game/tacticsMenu';
import cameraControls from '../game/cameraControls';
import counts from '../game/counts';
import notice from '../game/notice';

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

mod.watch('playerChecker', handleCheckerSelection);
mod.watch('hostiles', (hostiles) => {
    if (hostiles.length === 0) {
        console.log('>>>>>> WINNER! >>>>>');
    }
});

play.kids(
    board.el,
    cameraControls.el,
    tacticsMenu.el,
    counts.el,
    notice.el
);

// on an initial load, jump right into checker selection
handleCheckerSelection();
export default play;
