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
    playerActions: null,
    // how many lives the player has left
    lives: 99,
}, true);

// we check against our ally actions in a couple different places over the
// course of a turn; we cache them to avoid re-running the calculation multiple
// times
let _allyActions = [];

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

// a simple method for toggling our turn value
function toggleTurn() {
    mod.set({
        isTurn: !mod.get('isTurn'),
    });
}

// clear our playerActions value from the model; the board watches this to
// highlight valid moves/jumps
function clearActions() {
    _allyActions = [];
    mod.set({
        playerActions: [],
        noPlayerMoves: false,
    });
}

// check if a checker should be kinged based on the given move action
function makeKing(action) {
    let {checker, toY} = action;
    let isHostileKing = (checker.isHostile && (toY === 7));
    let isAllyKing = (!checker.isHostile && (toY === 0));

    if (isHostileKing || isAllyKing) {
        checker.isKing = true;
        checker.classify('king');
    }
}

// destroys a checker at the given X/Y positions and removes it from play
function handleJump(x, y) {
    let occupied = mod.get('occupied');
    let jumpedChecker = occupied[x][y];

    occupied[x][y] = false;
    jumpedChecker.remove();
}

// an abbreviated .getPlayerActions() pipeline accounting only for jump actions;
// intended for use when chaining jumps together
function handleJumpAfterJump(actions) {
    let {checker} = actions[0];

    // if this is a player action, update our model to allow for selection of
    // the next jump
    if (checker.isPlayer) {
        mod.set({
            playerActions: actions
        });

    } else {
        _allyActions = actions;
        handleAllyTurn();
    }
}

// set the camera focal point from the given X/Y
function setFocus(focusX, focusY, perspective='camDefault') {
    mod.set({
        focusX,
        focusY,
        perspective,
    });
}

// takes a standard action object and executes a checker's movement/animations
function moveChecker(action) {
    let board = mod.get('board');
    let {checker, fromX, fromY, jumpedX, jumpedY, toX, toY} = action;
    let occupied = mod.get('occupied');
    let onMoveComplete, onCameraSet, jumpAfterJump;

    onCameraSet = () => {
        setFocus(toX, toY);
        checker.position(toX, toY);

        occupied[toX][toY] = checker;
        occupied[fromX][fromY] = false;

        if (jumpedX) {
            handleJump(jumpedX, jumpedY);
            jumpAfterJump = getCheckerJumps(checker, getCheckerRange(checker));
        }

        // if we can chain multiple jumps, do that ...
        if (jumpAfterJump && jumpAfterJump.length > 0) {
            onMoveComplete = () => {
                handleJumpAfterJump(jumpAfterJump);
            };

        // ... otherwise, bring the turn to an end
        } else {
            onMoveComplete = () => {
                makeKing(action);
                toggleTurn();
            };
        }

        checker.onTrans(onMoveComplete);
    };

    // check if we need to reset our camera position before excuting the move
    let isFocusedX = (checker.x === mod.get('focusX'));
    let isFocusedY = (checker.y === mod.get('focusY'));

    clearActions();
    if (isFocusedX && isFocusedY) {
        onCameraSet();

    } else {
        board.onTrans(onCameraSet);
        setFocus(checker.x, checker.y, 'camOverview');
    }
}

// get the movement range for a given checker; does not account for occupied
// squares. returns an array of simple X/Y objects
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

// get valid moves for a given checker and return an array of actions
function getCheckerMoves(checker, range) {
    let moves = [];
    range.map(({ x, y }) => {
        if (isValidMove(x, y)) {
            moves.push({
                checker: checker,
                fromX: checker.x,
                fromY: checker.y,
                toX: x,
                toY: y,
            });
        }
    });

    return moves;
}

// get valid jumps for a given checker, returning an array of actions
function getCheckerJumps(checker, range) {
    let occupied = mod.get('occupied');
    let jumps = [];

    range.map(({ x, y }) => {

        // we're only concerned with adjacent squares that are in bounds and
        // occupied by the opposing team
        if (inBounds(x, y) && isOccupied(x, y)) {

            let adjacent = occupied[x][y];

            if (adjacent.isHostile !== checker.isHostile) {
                let deltaX = x - checker.x;
                let deltaY = y - checker.y;

                let onePlusX = x + deltaX;
                let onePlusY = y + deltaY;

                if (
                    inBounds(onePlusX, onePlusY) &&
                    !isOccupied(onePlusX, onePlusY)
                ) {
                    jumps.push({
                        checker: checker,
                        fromX: checker.x,
                        fromY: checker.y,
                        toX: onePlusX,
                        toY: onePlusY,
                        jumpedX: x,
                        jumpedY: y,
                    });
                }
            }
        }
    });

    return jumps;
}

// a composite method for getting checker actions, checking against available
// jumps and moves
function getCheckerActions(checker) {
    let range = getCheckerRange(checker);
    let jumps = getCheckerJumps(checker, range);

    // if we have jumps, don't bother with moves. jumps must be taken.
    if (jumps.length > 0) {
        return jumps;
    }

    return getCheckerMoves(checker, range);
}

// returns an array of available actions (jumps/moves) for a given group of
// checkers; expects an array of checker instances, as from mod.get('allies')
function getGroupActions(checkers) {
    let moves = [];
    let jumps = [];

    checkers.map((checker) => {
        getCheckerActions(checker).map((action) => {
            if (action.jumpedX) {
                jumps.push(action);
            } else {
                moves.push(action);
            }
        });
    });

    return (jumps.length > 0) ? jumps : moves;
}

// grab all available actions for the hostile team, send it to the AI, then act
// on it
function handleHostileTurn() {
    let hostiles = mod.get('hostiles');
    let actions = getGroupActions(hostiles);

    if (actions.length === 0) {
        mod.set({ youWon: true });
        return;
    }

    moveChecker(ai(actions));
}

//
function handleAllyTurn(/*tactic*/) {
    moveChecker(ai(_allyActions));
}

//
function handlePlayerTurn() {
    let playerChecker = mod.get('playerChecker');
    let allies = mod.get('allies');

    if (!playerChecker) {
        let lives = mod.get('lives');
        let toUpdate = {
            checkerSelect: true,
        };

        // if the player has no more lives to lose and no more allies, end it
        if ((lives === 0) || (allies.length === 0)) {
            toUpdate.youWon = false;
        }

        mod.set(toUpdate);
        return;
    }

    let playerActions = [];

    getGroupActions(allies).map((action) => {
        let stack = (action.checker.isPlayer) ? playerActions : _allyActions;
        stack.push(action);
    });

    if ((playerActions.length === 0) && (_allyActions.length === 0)) {
        mod.set({
            youWon: false,
        });
        return;
    }

    if (
        (playerActions.length === 0) &&
        (_allyActions.length > 1) &&
        (!_allyActions[0].jumpedX)
    ) {
        mod.set({
            noPlayerMoves: true,
        });
    }

    if (playerActions.length > 0 || (_allyActions.length > 0)) {
        let perspective = (playerChecker.isKing) ? 'camUp' : 'camDefault';
        setFocus(playerChecker.x, playerChecker.y, perspective);
    }

    let allyHasJump = _allyActions[0] && _allyActions[0].jumpedX;
    let playerHasJump = playerActions[0] && playerActions[0].jumpedX;

    // seed our model updates; we'll extend/amend this below based on what the
    // player and allies can do
    let toUpdate = {
        allyHasJump,
        playerHasJump,
        playerActions,
    };

    // if an ally has a jump and the player doesn't, the ally must take it
    if (allyHasJump && !playerHasJump) {
        toUpdate.playerActions = [];
    }

    mod.set(toUpdate);

    // if there's only a single move available ... an ally jump ... go ahead
    // and take it
    if ((playerActions.length === 0) && allyHasJump) {
        handleAllyTurn();
    }
}

mod.watch('allyAction', handleAllyTurn);
mod.watch('playerAction', moveChecker);
mod.watch('isTurn', (isTurn) => {
    //clearActions();

    /*
    mod.set({
        youWon: false
    });
    return;
    */

    if (isTurn) {
        handlePlayerTurn();

    } else {
        handleHostileTurn();
    }
});

// trigger the initial checker selection phase
mod.set({ checkerSelect: true });
