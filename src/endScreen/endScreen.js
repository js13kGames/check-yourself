import El from '../common/El';
import mod from '../mod';

import './endScreen.css';

// convenience wrapper for creating a stat node
function mkStat(label) {
    let stat = new El('p').classify('stat').text(label);
    let statVal = new El('span').classify('+statVal');

    stat.kids(statVal.el);
    stat.val = (val) => statVal.text(val);
    return stat;
}

//
function getElapsedTime(from, to) {
    let elapsed = (to.getTime() - from.getTime()) / 1000;
    let seconds = Math.abs(Math.round(elapsed % 60));
    let minutes = Math.abs(Math.round(elapsed / 60));

    minutes = (minutes < 10) ? `0${minutes}` : minutes;
    seconds = (seconds < 10) ? `0${seconds}` : seconds;

    return `${minutes}:${seconds}`;
}

let endScreen = new El().classify('+endScreen');
let gameOverText = new El('p').classify('+gameOverText');
let divider = new El('hr').classify('divider');
let playAgain = new El('p').classify('+playAgain').text('Play Again');

let respawns = mkStat('Respawns:');
let turns = mkStat('Turns Taken:');
let gameTime = mkStat('Game Time:');

let stats = new El().classify('+stats').kids(
    gameTime.el,
    respawns.el,
    turns.el
);

//
function handleGameOver(youWon) {
    let endMessage = (youWon) ? 'Well Played!' : 'You\'ve Lost ...';

    respawns.val(mod.get('respawns'));
    turns.val(mod.get('movesToWin'));
    gameTime.val(
        getElapsedTime(mod.get('gameStarted'), new Date())
    );

    gameOverText.text(endMessage);
    endScreen.classify('+show');
}

mod.watch('youWon', handleGameOver);
endScreen.onClick('.playAgain', () => window.location.reload());
endScreen.kids(
    gameOverText.el,
    divider.el,
    stats.el,
    divider.el.cloneNode(),
    playAgain.el
);

export default endScreen;
