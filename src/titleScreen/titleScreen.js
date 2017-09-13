import El from '../common/El';
import './titleScreen.css';

//
function renderCheckerFont(text, className) {
    let textEl = new El().classify(`${className} +checkerFont`);

    for (let i = 0, n = text.length; i < n; i++) {
        let tile = new El('span')
            .classify('+checkerFontTile')
            .text(text.charAt(i)).el;

        let randomPopIn = 400 + Math.floor(Math.random() * 800);

        tile.style.transitionDelay = `${randomPopIn}ms`;
        textEl.kids(tile);
    }

    return textEl.el;
}

let titleScreen = new El().attribute({
    id: 'titleScreen'
});

let newGame = new El('a')
    .classify('+newGame')
    .text('Play a Game');

titleScreen.kids(
    // dummy rows with empty chars to make extra rows
    renderCheckerFont('   ', 'even'),
    renderCheckerFont('       ', 'odd'),
    renderCheckerFont('Check', 'even'),
    renderCheckerFont('Yourself', 'odd'),
    renderCheckerFont('     ', 'even'),
    renderCheckerFont('   ', 'odd'),
    renderCheckerFont(' ', 'even'),
    newGame.el
);

setTimeout(() => titleScreen.classify('show'), 10);
export default titleScreen;
