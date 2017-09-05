import mod from '../mod';
import ai from './ai';

// our moves module is concerned with/manages these properties of our model;
// set our defaults
mod.set({
    // whether or not it's the player's turn
    isTurn: false,
    // all jumps must be taken, as per the rules of checkers. this is a hook for
    // disabling movement if either the player or an ally has to jump
    playerHasJump: false,
    allyHasJump: false,
    // moves available to the player on a given turn
    validActions: null,
}, true);

// grab a global reference to the board
let _board = mod.get('board');

// our ally actions get calculated at the start of each player turn; we keep a
// reference to them to avoid running through all possibilities in multiple
// places
let _allyActionCache = [];

// a standard no-operation; handy for setting defaults on conditional function
// calls
function noop() {
    return;
}

// a method for checking if a given X/Y position is actually on the board
function inBounds(x, y) {
    let columns = mod.get('columns');
    let onBoard = (coord) => (coord > -1) && (coord < columns);
    return (onBoard(x) && onBoard(y));
}

// a method for checking if a given X/Y position is occupied
function isOccupied(x, y) {
    return mod.get('occupied')[x][y];
}

// a composite method for checking whether an X/Y position is in-bounds and
// unoccupied
function isValidMove(x, y) {
    return (inBounds(x, y) && (!isOccupied(x, y)));
}

//
//
//
function toggleTurn() {
    mod.set({
        isTurn: !mod.get('isTurn'),
    });
}

//
// An OO method for getting the available move range for a given checker.
//
function getCheckerRange(checker) {
    let upLeft = checker.getUpLeft();
    let upRight = checker.getUpRight();
    let downRight = checker.getDownRight();
    let downLeft = checker.getDownLeft();
    let range = [];

    if (checker.isKing) {
        range.push(
            inBounds(upLeft.x, upLeft.y) && upLeft,
            inBounds(upRight.x, upRight.y) && upRight,
            inBounds(downRight.x, downRight.y) && downRight,
            inBounds(downLeft.x, downLeft.y) && downLeft
        );

    } else if (checker.isHostile) {
        range.push(
            inBounds(downRight.x, downRight.y) && downRight,
            inBounds(downLeft.x, downLeft.y) && downLeft
        );

    } else {
        range.push(
            inBounds(upLeft.x, upLeft.y) && upLeft,
            inBounds(upRight.x, upRight.y) && upRight
        );
    }

    return range.filter((action) => action);
}

//
// Given a range of valid moves (non-jumps) a given checker can make
//
function getCheckerMoves(checker, range) {
    let moves = [];

    range.map((xy) => {
        if (isValidMove(xy.x, xy.y)) {
            moves.push({
                checker: checker,
                fromX: checker.x,
                fromY: checker.y,
                toX: xy.x,
                toY: xy.y,
            });
        }
    });

    return moves;
}

//
//
//
function getCheckerJumps(checker, range) {
    let {x, y} = checker;
    let jumps = [];

    range.map((tile) => {
        let {x: occupiedX, y: occupiedY} = tile;
        let occupiedBy = isOccupied(occupiedX, occupiedY);
        let isOpposed = occupiedBy && (occupiedBy.isHostile !== checker.isHostile);

        // we're concerned with invalid moves ... occupied only
        if (occupiedBy && isOpposed) {
            let deltaX = occupiedX - x;
            let deltaY = occupiedY - y;

            let onePlusX = occupiedX + deltaX;
            let onePlusY = occupiedY + deltaY;

            if (
                inBounds(onePlusX, onePlusY) &&
                !isOccupied(onePlusX, onePlusY)
            ) {
                jumps.push({
                    checker: checker,
                    fromX: x,
                    fromY: y,
                    toX: onePlusX,
                    toY: onePlusY,
                    jumpedX: occupiedX,
                    jumpedY: occupiedY,
                });
            }
        }
    });

    return jumps;
}

//
// A method for getting valid actions for a given checker; it checks both move
// options and jumps and returns only actions the checker can legally take.
//
function getCheckerActions(checker) {
    let range = getCheckerRange(checker);
    let jumps = getCheckerJumps(checker, range);

    // if the checker has jumps, they must be taken as per the rules of
    // checkers; don't bother checking any further
    return (jumps.length > 0) ? jumps : getCheckerMoves(checker, range);
}

//
//
//
function getGroupActions(checkers) {
    let actions = [];

    checkers.map((checker) => {
        actions = actions.concat(getCheckerActions(checker));
    });

    let jumpActions = actions.filter((action) => action.jumpedX);
    return (jumpActions.length > 0) ? jumpActions : actions;
}

//
//
//
function moveAllyChecker(actions) {
    let allyJumps = actions.filter((action) => action.jumpedX);

    if (allyJumps.length > 0) {
        console.log('Ally gotta jump');
    } else {
        console.log('Ally gotta move');
    }

    handleCheckerAction(ai(actions));
}

//
//
//
function getPlayerOptions() {
    let playerChecker = mod.get('playerChecker');

    if (!playerChecker) {
        return;
    }

    let playerActions = [];
    let allyActions = [];

    _allyActionCache.map((action) => {
        let stack = (action.checker.isPlayer) ? playerActions : allyActions;
        stack.push(action);
    });

    if (playerActions.length > 0) {
        let toUpdate = {
            validActions: playerActions,
            focusX: playerChecker.x,
            focusY: playerChecker.y,
        };

        // set our model flag for use by other components; if the player has
        // jumps we disable the ally menu
        if (playerActions[0].jumpedX) {
            toUpdate.playerHasJump = true;
        }

        mod.set(toUpdate);

    // the player can't move; check if allies have jumps available (in which
    // case they gotta take 'em) and we disable the Tactics menu
    } else {
        if (allyActions[0].jumpedX) {
            mod.set({ allyHasJump: true });
            moveAllyChecker(allyActions);
        }
    }
}

//
//
//
function updateBoardPositions(action) {
    let occupied = mod.get('occupied');
    let {checker, fromX, fromY, toX, toY} = action;

    occupied[fromX][fromY] = false;
    occupied[toX][toY] = checker;

    mod.set({ occupied });
}

//
//
//
function handleJump(action) {
    let {checker, jumpedX, jumpedY} = action;
    let removeJumpedChecker = () => {
        let occupied = mod.get('occupied');
        let jumpedChecker = occupied[jumpedX][jumpedY];
        let toUpdate = { occupied };

        // eradicate the jumped checker from the board and the DOM
        occupied[jumpedX][jumpedY] = false;
        jumpedChecker.destructor();

        if (jumpedChecker.isPlayer) {
            toUpdate.playerChecker = false;
        }

        let team = (jumpedChecker.isHostile) ?
            mod.get('hostiles') :
            mod.get('allies');

        team.splice(team.indexOf(jumpedChecker), 1);
        mod.set(toUpdate);
    };

    if (checker.isPlayer) {
        checker.onTrans(removeJumpedChecker);
        moveChecker(action);
    } else {
        moveCheckerWithCamera(action, removeJumpedChecker);
    }
}

//
//
//
function moveChecker(action) {
    let {checker, toX, toY} = action;

    updateBoardPositions(action);
    checker.onTrans(() => toggleTurn());
    checker.position(toX, toY);

    // King'ify!
    let hostileKing = (checker.isHostile && (toY === 7));
    let allyKing = (!checker.isHostile && (toY === 0));

    if (hostileKing || allyKing) {
        checker.isKing = true;
    }

    mod.set({
        focusX: toX,
        focusY: toY,
        validActions: [],
    });
}

//
//
//
function moveCheckerWithCamera(action, onMoveComplete=noop) {
    let {checker, fromX, fromY, toX, toY} = action;
    let isHostile = checker.isHostile;

    // we use our transition event handlers to stagger the flow: focus the
    // camera, make the move, jump back to the player
    let afterMove = () => {
        onMoveComplete();
    };

    let afterFocus = () => {
        checker.onTrans(afterMove);
        moveChecker(action);
    };

    // initiate the transition chain
    _board.onTrans(afterFocus);

    mod.set({
        // center the camera on whatever's about to happen
        focusX: (isHostile) ? toX : fromX,
        focusY: (isHostile) ? toY : fromY,
    });
}

//
//
//
function handleCheckerAction(action) {
    // if this is a jump, our animation/handling flow is altered
    if (action.jumpedX) {
        handleJump(action);
        return;
    }

    let {checker} = action;

    // no need to manage camera focus on a player move, as the player is
    // always the default focus. simply move and follow with the cam
    let moveMethod = (checker.isPlayer) ? moveChecker : moveCheckerWithCamera;
    moveMethod(action);
}


// tile selection comes from the board component; when a tile is selected it
// updates the playerX/Y vals, which we pick up here and actually handle the
// move
mod.watch('playerAction', handleCheckerAction);
mod.watch('allyAction', () => {
    mod.set({ validMoves: [] });
    moveAllyChecker(_allyActionCache.filter(
        (action) => action.checker.isPlayer === false
    ));
});
mod.watch('isTurn', (isTurn) => {
    if (isTurn) {
        let allies = mod.get('allies');

        if (allies.length <= 0) {
            console.log('>>>>>>>>>>>>> GAME OVER >>>>>>>>>>>>');
            return;
        }

        mod.set({
            playerHasJump: false,
            allyHasJump: false,
        });

        // calculate our group actions and cache the results for the turn
        _allyActionCache = getGroupActions(mod.get('allies'));
        getPlayerOptions();

    } else {
        let hostiles = mod.get('hostiles');

        if (hostiles.length <= 0) {
            console.log('>>>>>>>>>>>>> WINNER! >>>>>>>>>>>>');
            return;
        }

        let actions = getGroupActions(hostiles);
        handleCheckerAction(ai(actions));
    }
});
