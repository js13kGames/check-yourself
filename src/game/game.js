import El from '../common/El';
import cameraControls from './cameraControls';
import './actions/turns';
import status from './status';
import board from './board';
import counts from './counts';
import gameOver from './gameOver';

import './game.css';

let game = new El().attribute({
    id: 'game'
});

game.kids(
    board.el,
    cameraControls.el,
    counts.el,
    gameOver.el,
    status.el
);

export default game;
