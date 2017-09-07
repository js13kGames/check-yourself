import View from '../common/View';
import Text from '../common/Text';
import mk from '../common/mk';
import mod from '../mod';

import './gameOver.css';

let gameOver = new View({
    id: 'gameOver',
});

let gameOverText = new Text({
    id: 'gameOverText',
});

let playAgain = mk('a', {
    id: 'playAgain',
    text: 'Play Again',
});

//
function handleGameOver(youWon) {
    let endMessage = (youWon) ? 'Well Played!' : 'You\'ve Lost ...';

    gameOverText.print(endMessage);
    gameOver.fadeIn();
    setTimeout(() => gameOver.classify('+show'));
}

mod.watch('youWon', handleGameOver);
gameOver.onClick('#playAgain', () => window.location.reload());
gameOver.kids(
    gameOverText.el,
    playAgain.el
);

export default gameOver;
