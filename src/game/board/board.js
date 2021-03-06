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
    let id = 'board';
    let boardSize = mod.get('tileSize') * mod.get('boardCols');
    let boardOffset = boardSize / 2;

    let board = new El()
        .attribute({ id })
        .style({
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
        mod.get('playerChecker').classify('-stayPut');
    }

    actions.map((action) => {
        let {checker, toX, toY} = action;
        let tile = tiles.filter((tile) => {
            let {x, y} = tile;
            return ((x === toX) && (y === toY));
        })[0];

        // special handling if the tile is the current position of the player
        // checker; the checker in and of itself isn't clickable and it sucks
        // to try and target the tile _under_ the disc. @todo we put a lag on
        // this to prevent it firing on checker selection; that's a little
        // hacky. fix it!
        if ((tile.x === checker.x) && (tile.y === checker.y)) {
            setTimeout(() => checker.classify('stayPut'), 0);
        }

        tile.classify('+validMove');
    });
}

// silly, ugly, messy translation for clicking on nested elements in a target;
// @todo when you revisit this in the future, normalize clicks in the handler
// so you don't have to do stuff like this
function translateClick(e) {
    let {target} = e;
    while (target.classList.contains('checker') === false) {
        target = target.parentNode;
    }

    target.click();
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

    // reset the camera on new selection
    mod.set({
        cameraPosition: 'camDefault',
        playerCameraPosition: 'camDefault',
    }, true);

    mod.set({
        playerChecker: selectedChecker,
        doCheckerSelect: false,
        //status: null,
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

// pass-through method for clicking on the player checker itself, essentially
// saying "don't move"
board.onClick('.stayPut', () => {
    let {x, y} = mod.get('playerChecker');
    mod.set({
        tileSelected: {x, y}
    });
});

// see the note and @todo above on the .translateClick method
board.onClick('.spoke', translateClick);
board.onClick('.crown', translateClick);

// the board watches/responds as follows ...
mod.watch('cameraPosition', positionCamera);
mod.watch('doCheckerSelect', handleCheckerSelect);
mod.watch('playerActions', showPlayerActions);

mod.watch('focusX', () => {
    let cam = (mod.get('cameraPosition') === 'camUp') ? 'camUp' : 'camDefault';
    positionCamera(cam);
    mod.set({
        cameraPosition: cam
    }, true);
});

mod.set({ isTurn: true });
export default board;
