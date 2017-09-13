import El from '../common/El';
import cameraControls from './cameraControls';
import './actions/turns';
import status from './status';
import board from './board';
import counts from './counts';

import './game.css';

let game = new El().attribute({
    id: 'game'
});

game.kids(
    cameraControls.el,
    counts.el,
    status.el,
    board.el
);

export default game;
