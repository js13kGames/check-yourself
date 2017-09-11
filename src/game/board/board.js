import El from '../../common/El';
import {renderCheckers} from '../Checker';
import {renderTiles} from '../Tile';
import {
    perspective,
    rotateX,
    rotateZ,
    scale3d,
    translate3d
} from '../../common/transform';

import mod from '../../mod';
import './board.css';

const BOD = document.body;

// set our board-related default values in our model; note that all units are
// relative based on the board itself being 100(%, vh, vw, whatever)
mod.set({
    // the size of our game board in columns; note that there's no "rows"
    // attribute, as our board is always square. it's not validated, but this
    // is expected to be an even number because ... well ... how else would you
    // stagger squares?
    boardCols: 8,
    // how much bigger the board is than the viewport; set in percent. Eg., if
    // this is set to 200 the board will be twice the size of the viewport.
    boardScale: 170,
    // negative space between the edge of a tile and the edge of a checker. the
    // number is in relation to the board itself, not the tile. used in
    // calculating the actual size of a checker.
    tileBuffer: 2.5,
    // the size of our tiles based on the number of columns and board scaling
    tileSize: function() {
        return this.get('boardScale') / this.get('boardCols');
    },
    // the start time of the game; used in reporting at end-game
    gameStarted: new Date(),
}, true); // the initial update, so do so silently


// helper method that takes an array of instances, such as tiles or checkers,
// and returns their corresponding DOM elements
function extractDomNodes(instances) {
    return instances.map((instance) => instance.el);
}

// creates the high-level board component; we'll add checkers and tiles a bit
// down the way.
function renderBoard() {
    let board = new El();
    let id = 'board';
    let boardSize = mod.get('tileSize') * mod.get('boardCols');
    let boardOffset = boardSize / 2;

    board.attribute({ id });
    board.style({
        width: `${boardSize}vh`,
        height: `${boardSize}vh`,
        marginLeft: `-${boardOffset}vh`,
        marginTop: `-${boardOffset}vh`
    });

    mod.set({ board }, true);
    return board;
}

// sets the camera position based on the given param; board transforms and
// camera configs are set in ./cameraControls.js
function positionCamera(cameraPosition) {
    handleOverview((cameraPosition === 'camOverview'));
    let cameraConfig = mod.get(cameraPosition);
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
function handleOverview(isOverview) {
    if (!isOverview) {
        BOD.classList.remove('overview');
    } else {
        BOD.classList.add('overview');
    }
}

//
//
function handleCheckerSelect(enterSelection) {
    let allyCheckers = mod.get('allyCheckers');

    if (allyCheckers.length === 0) {
        mod.set({ youWon: false });
        return;
    }

    if (!enterSelection) {
        allyCheckers.map((checker) => checker.classify('-playableChecker'));
        BOD.classList.remove('checkerSelect');
        mod.set({ isTurn: true });
        return;
    }

    mod.get('allyCheckers').map((checker) => {
        checker.classify('+playableChecker');
    });

    mod.set({
        cameraPosition: 'camSelectable',
        isTurn: false,
        status: 'Select your checker.',
    });

    BOD.classList.add('checkerSelect');
}

//
//
function showPlayerActions(actions) {
    let tiles = mod.get('tiles');

    // if there are no actions provided (not the player turn) or the player
    // can't do anything, remove our CSS hooks
    if (!actions || (actions.length === 0)) {
        tiles.map((tile) => tile.classify('-validMove'));
    }

    actions.map((action) => {
        let {toX, toY} = action;
        let tile = tiles.filter((tile) => {
            let {x, y} = tile;
            return ((x === toX) && (y === toY));
        })[0];

        tile.classify('+validMove');
    });
}


let board = renderBoard();
let tileEls = extractDomNodes(renderTiles());
let checkerEls = extractDomNodes(renderCheckers());

board.kids(tileEls.concat(checkerEls));

board.onClick('.playableChecker', (e) => {
    let {target} = e;
    let selectedChecker = mod.get('checkers').filter((checker) => {
        return checker.el.isEqualNode(target);
    })[0];

    selectedChecker.makePlayer();
    mod.set({
        playerChecker: selectedChecker,
        doCheckerSelect: false,
        status: null,
        respawns: mod.get('respawns') + 1,
    });
});

board.onClick('.validMove', (e) => {
    let {target} = e;
    let {id} = target;
    let xy = id.split('-');
    let x = parseInt(xy[0].replace('x', ''), 10);
    let y = parseInt(xy[1].replace('y', ''), 10);

    mod.set({
        tileSelected: {x, y}
    });
});

// the board watches/responds as follows ...
mod.watch('cameraPosition', positionCamera);
mod.watch('doCheckerSelect', handleCheckerSelect);
mod.watch('playerActions', showPlayerActions);
mod.watch('focusX', () => {
    let camDefault = 'camDefault';
    positionCamera(camDefault);
    mod.set({
        cameraPosition: camDefault
    }, true);
});

mod.set({ isTurn: true });
export default board;
