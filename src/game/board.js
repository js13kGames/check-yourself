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

//
//
//
function positionCamera() {
    let persp = mod.get('perspective');
    let cameraConfig = mod.get(persp);

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
function showCheckerSelection() {
    let allies = mod.get('allies');

    allies.map((ally) => ally.classify('+playable-checker'));
    mod.set({
        perspective: 'camSelectable'
    });
}

//
//
//
function choosePlayerChecker(e) {
    let allies = mod.get('allies');

    let playerChecker = allies.filter((checker) => {
        return checker.el.isEqualNode(e.target);
    })[0];

    // clean up our "playable" flags from the selection phase
    allies.map((ally) => {
        ally.classify('-playable-checker');
    });

    playerChecker.classify('+player-checker');
    playerChecker.isPlayer = true;

    mod.set({
        playerChecker: playerChecker,
        focusX: playerChecker.x,
        focusY: playerChecker.y,
        isTurn: true,
    });

    setTimeout(() => {
        mod.set({
            perspective: 'camDefault'
        });
    }, 120);
}

//
//
//
function showValidMoveTiles(validMoves=[]) {
    validMoves.map((move) => {
        let tile = document.getElementById(`x${move.x}-y${move.y}`);
        tile.classList.add('availableMove');

        if (move.jumpedX) {
            tile.classList.add('jump');
            tile.dataset.jumpedX = move.jumpedX;
            tile.dataset.jumpedY = move.jumpedY;
        }
    });
}

//
//
//
function hideValidMoveTiles() {
    let validMoveTiles = Array.from(
        document.querySelectorAll('.availableMove')
    );

    validMoveTiles.map((tile) => tile.classList.remove('availableMove'));
}

//
//
//
function handleTileSelection(e) {
    let target = e.target;
    let xy = target.id.split('-');
    let x = parseInt(xy[0].replace('x', ''), 10);
    let y = parseInt(xy[1].replace('y', ''), 10);
    let toUpdate = {
        playerX: x,
        playerY: y,
    };

    // use the attached classname to handle player checker jumps
    if (target.classList.contains('jump')) {
        target.classList.remove('jump');

        let occupied = mod.get('occupied');
        let hostiles = mod.get('hostiles');
        let jumpedX = target.dataset.jumpedX;
        let jumpedY = target.dataset.jumpedY;
        let jumped = occupied[jumpedX][jumpedY];

        jumped.destructor();

        hostiles.splice(hostiles.indexOf(jumped), 1);
        occupied[jumpedX][jumpedY] = false;

        toUpdate.hostiles = hostiles;
        toUpdate.occupied = occupied;
    }

    mod.set(toUpdate);
}

//
//
//
function render() {
    board.gut();

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

    let occupied = [];
    let hostiles = [];
    let allies = [];

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

        // render a checker for the tile, if needed
        if ((row < 3) || (row > 4)) {

            // this leaves the DOM fairly messy, as we render checkers and tiles
            // in the same loop. they exist as Brady-bunched sibblings.
            // positioning all happens absolutely, so it looks fine on screen.
            // just a note to anybody out there with their inspector open
            let isHostile = row < 3;
            let checker = new Checker({x:col, y:row, isHostile});
            board.kids(checker.el);

            if (isHostile) {
                hostiles.push(checker);
            } else {
                allies.push(checker);
            }

            // keep a reference to the checker instance in our virtual board for
            // easy look-ups and manipulation
            occupied[col] = occupied[col] || [];
            occupied[col][row] = checker;
        }

        // for the first tile in an even row, ditch the margin to stagger the
        // tiles
        if ((col === 0) && (row % 2 === 0)) {
            tile.el.style.marginLeft = 0;
        }

        board.kids(tile.el);
        col += 2;
    }

    // stash the entire state of the board to our model thingy; we'll use that
    // from here on out so other components can watch and utilize 'em.
    mod.set({
        occupied: occupied,
        hostiles: hostiles,
        allies: allies,
    });
}

mod.watch('perspective', positionCamera);
mod.watch('validMoves', showValidMoveTiles);
mod.watch('focusX', positionCamera);
mod.watch('playerChecker', (playerChecker) => {
    if (!playerChecker) {
        showCheckerSelection();
    }
});
mod.watch('isTurn', (isTurn) => {
    if (isTurn === false) {
        hideValidMoveTiles();
    }
});

board.onClick('.playable-checker', choosePlayerChecker);
board.onClick('.availableMove', handleTileSelection);

mod.set({
    perspective: 'camSelectable'
});

render();
//positionCamera();

export default board;
