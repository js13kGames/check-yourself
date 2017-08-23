import View from '../common/View';
import Checker from './Checker';

import mod from '../mod';
import mk from '../common/mk';
import {
    perspective,
    rotateX,
    rotateZ,
    scale3d,
    translate3d,
} from '../common/transform';

import './board.css';

let board = new View({
    id: 'board'
});

let allies, hostiles;

//
//
//
function renderTiles() {
    let columns = mod.get('columns');
    // we're only dealing with every-other tile; only render usable tiles to
    // minimize the number of nodes in the DOM
    let tileCount = (columns * columns) / 2;

    let col = 0;
    let row = 0;

    let tileSize = mod.get('tileSize');
    let commonStyles = [
        `width:${tileSize}vw;`,
        `height:${tileSize}vw;`,
        `margin-left:${tileSize}vw;`
    ];

    for (let i = 0; i < tileCount; i++) {
        // special handling for creating new rows
        if (col >= columns) {
            row++;
            col = (row % 2);
        }

        let tile = mk('span', {
            id: `x${col}-y${row}`,
            className: 'tile',
            style: commonStyles.join(''),
        });

        // for the first tile in an even row, ditch the margin to stagger the
        // tiles
        if ((col === 0) && (row % 2 === 0)) {
            tile.el.style.marginLeft = 0;
        }

        board.kids(tile.el);
        col += 2;
    }
}

//
//
//
function renderCheckers(isHostile) {
    let teamOf = mod.get('teamOf');
    let columns = mod.get('columns');
    let checkersPerRow = mod.get('checkersPerRow');
    let rowsToPopulate = mod.get('rowsToPopulate');
    let checkers = [];
    let isPlayable = false;

    // @todo this is awfully loopy and running the same loop'ish thing as
    // elsewhere; if time allows come back and see if you can optimize this
    for (let row = 0; row < rowsToPopulate; row++) {

        // flag the top row of allied checkers as playable for checker
        // selection phase
        isPlayable = (row === rowsToPopulate - 1) && !isHostile;

        for (let col = 0; col < checkersPerRow; col++) {
            let checker = new Checker({isHostile, isPlayable});
            let adjustedY = (isHostile) ? row : columns - (row + 1);
            let adjustedX = (col * 2) + (adjustedY % 2);

            checker.position(adjustedX, adjustedY);
            board.kids(checker.el);
            checkers.push(checker);
        }
    }

    return checkers;
}

//
//
//
function positionCamera() {
    let persp = mod.get('perspective');
    let cameraConfig = mod.get(persp);

    console.log('Position', cameraConfig);
    let cameraStyles = [
        perspective(cameraConfig.perspective),
        rotateX(cameraConfig.rotateX),
        rotateZ(cameraConfig.rotateZ),
        scale3d(cameraConfig.scaleX, cameraConfig.scaleY, cameraConfig.scaleZ),
        translate3d(cameraConfig.moveX, cameraConfig.moveY, cameraConfig.moveZ)
    ];

    board.style({
        transform: cameraStyles.join(' ')
    });
}

//
//
//
function render() {
    board.gut();
    renderTiles();

    // friendlies; keep a record of these in our move-finder
    allies = renderCheckers();
    // keep track of the hostiles, too
    hostiles = renderCheckers(true);

    positionCamera();
}

mod.set({
    focusX: mod.get('playerX'),
    focusY: mod.get('playerY'),
});

mod.watch('columns', render);
mod.watch('perspective', positionCamera);

mod.set({
    perspective: 'camFrontRow'
});

board.onClick('.playable-checker', (e) => {
    let playerChecker = allies.filter((checker) => {
        return checker.el.isEqualNode(e.target);
    })[0];

    // clean up our "playable" flags from the selection phase
    Array.from(board.el.querySelectorAll('.playable-checker')).map((c) => {
        c.classList.remove('playable-checker');
    });

    mod.set({
        playerChecker: playerChecker,
        playerX: playerChecker.x,
        playerY: playerChecker.y,
        focusX: playerChecker.x,
        focusY: playerChecker.y,
    });

    console.log('Mod', mod.get('focusX'), mod.get('playerX'))
    setTimeout(() => {
        console.log('Here!');
        mod.set({
            perspective: 'camDefault'
        });
    }, 120);
});

render();
export default board;
