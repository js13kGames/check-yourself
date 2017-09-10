import El from '../common/El';
import mod from '../mod';

import './gameOver.css';

let gameOver = new El();
gameOver.attribute({
    id: 'gameOver',
});

let gameOverText = new El('p');
gameOverText.attribute({
    id: 'gameOverText',
});

let playAgain = new El('p');
playAgain.attribute({ id: 'playAgain' });
playAgain.el.innerText = 'Play Again';

//
function handleGameOver(youWon) {
    let endMessage = (youWon) ? 'Well Played!' : 'You\'ve Lost ...';

    gameOverText.el.innerText = endMessage;
    gameOver.classify('+show');
}

mod.watch('youWon', handleGameOver);
gameOver.onClick('#playAgain', () => window.location.reload());
gameOver.kids(
    gameOverText.el,
    playAgain.el
);

export default gameOver;
