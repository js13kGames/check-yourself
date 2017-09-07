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

mod.set({
    // the number of tiles in a row for our checkboard; the board is always
    // square so we don't specify a "rows" property. we also play on an American
    // "standard" checker board ... 8x8.
    columns: 8,
    // we scale the screen by this much in our CSS transforms
    scaling: 4,
    // init a quick/dirty 8x8 array to represent our checkerboard; this gets
    // updated by ./game/board.js in batch actions
    occupied: [ [], [], [], [], [], [], [], [] ],
    // based on 100% viewport
    tileSize: function() {
        return 100 / this.get('columns');
    },
    // quick-ref for grabbing the size of a rendered checker; regardless of how
    // many squares in a row, the checker is N% of it
    checkerSize: function() {
        return this.get('tileSize') * 0.75;
    },
    // quick-ref for setting the margins around our checkers ... the size of a
    // tile less the size of the checker itself
    checkerMargin: function() {
        return (this.get('tileSize') - this.get('checkerSize')) / 2;
    },
    // returns the player checker from the group of allies; @todo i had
    // race condition issues when keeping a direct reference to this when the
    // player was one of N checkers in a chained jump. those went away when
    // making it a lookup/filter. revisit this if time allows for perf/effic.
    playerChecker: function() {
        let playerChecker = this.get('allies').filter(
            (checker) => checker.isPlayer
        );

        return (playerChecker.length > 0) ? playerChecker[0] : null;
    },
    // convenience filters for returning checkers with allied/hostile affiliations
    allies: function() {
        let allies = [];
        this.get('occupied').map((row) => {
            allies = allies.concat(row.filter((checker) => {
                return (checker && !checker.isHostile);
            }));
        });

        return allies;
    },
    hostiles: function() {
        let hostiles = [];
        this.get('occupied').map((row) => {
            hostiles = hostiles.concat(row.filter((checker) => {
                return (checker && checker.isHostile);
            }));
        });

        return hostiles;
    }
}, true);

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

    board.setStyle({
        transform: cameraStyles.join(' ')
    });
}

//
//
//
function showCheckerSelection() {
    let allies = mod.get('allies');

    setTimeout(() => {
        allies.map((ally) => ally.classify('+playable-checker'));
    }, 50);

    mod.set({
        perspective: 'camSelectable',
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

    let {x, y} = playerChecker;
    mod.set({
        //playerChecker: playerChecker,
        focusX: x,
        focusY: y,
        playerX: x,
        playerY: y,
        isTurn: true,
        lives: mod.get('lives') - 1,
        checkerSelect: false,
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
function showValidMoveTiles(playerActions=[]) {
    if (playerActions.length === 0) {
        hideValidMoveTiles();
        return;
    }

    playerActions.map((move) => {
        let {toX, toY} = move;
        let tile = document.getElementById(`x${toX}-y${toY}`);
        tile.classList.add('availableMove');
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

    let playerAction = mod.get('playerActions').filter((action) => {
        return ((action.toX === x) && (action.toY === y));
    })[0];

    mod.set({ playerAction });
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
        `width:${tileSize}vh;`,
        `height:${tileSize}vh;`,
        `margin-left:${tileSize}vh;`
    ];

    let occupied = [];
    //let hostiles = [];
    //let allies = [];

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

            /*
            if (isHostile) {
                hostiles.push(checker);
            } else {
                allies.push(checker);
            }
            */

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
        //hostiles: hostiles,
        //allies: allies,
    });
}

mod.watch('perspective', positionCamera);
mod.watch('playerActions', showValidMoveTiles);
mod.watch('focusX', positionCamera);
mod.watch('checkerSelect', (needsPlayerChecker) => {
    if (needsPlayerChecker) {
        showCheckerSelection();
    }
});

board.onClick('.playable-checker', choosePlayerChecker);
board.onClick('.availableMove', handleTileSelection);

mod.set({
    perspective: 'camSelectable',
    board: board,
});

render();

export default board;
