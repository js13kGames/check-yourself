import El from '../common/El';
import cameraControls from './cameraControls';
import './actions/turns';
import status from './status';
import board from './board';
import counts from './counts';
import gameOver from './gameOver';

let game = new El();
game.attribute({
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
