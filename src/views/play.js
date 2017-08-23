import View from '../common/View';
import mod from '../mod';
import board from '../game/board';
import cameraControls from '../game/cameraControls';

let play = new View({
    id: 'play',
    className: 'play topLevelView checkerSelect',
});

mod.watch('playerChecker', () => {
    play.el.classList.remove('checkerSelect');
    play.kids(cameraControls.fadeIn());
});

play.kids(
    board.el,
    //cameraControls.el
);


export default play;
