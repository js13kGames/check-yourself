import mod from '../mod';

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
    let isValid = false;

    if (inBounds(x, y) && (!isOccupied(x, y))) {
        isValid = true;
    }

    return {isValid, x, y};
}

// this is a group of functions for checking whether an adjacent ... or in the
// case of our board ... a diagonally-adjacent square can be moved to.
let checkLeftDown = (x, y) => isValidMove(x - 1, y + 1);
let checkLeftUp = (x, y) => isValidMove(x - 1, y - 1);
let checkRightDown = (x, y) => isValidMove(x + 1, y + 1);
let checkRightUp = (x, y) => isValidMove(x + 1, y - 1);

//
//
//
function getMovementRange(checker) {
    let {x, y} = checker;

    if (checker.isKing) {
        return [
            checkLeftDown(x, y),
            checkRightDown(x, y),
            checkLeftUp(x, y),
            checkRightUp(x, y)
        ];

    } else if (checker.isHostile) {
        return [
            checkLeftDown(x, y),
            checkRightDown(x, y)
        ];

    } else {
        return [
            checkLeftUp(x, y),
            checkRightUp(x, y)
        ];
    }
}

//
//
//
function getValidMovesFromRange(range) {
    return range.filter((move) => move.isValid === true).map(
        (move) => {
            return {
                x: move.x,
                y: move.y
            };
        }
    );
}

//
//
//
function getAvailableJumps(checker, range) {
    let {x, y} = checker;
    let jumps = [];
    let allegiance = checker.isHostile;

    range.map((move) => {
        let {x:occX, y:occY} = move;

        // we're concerned with invalid moves ... occupied only
        if (move.isValid === false && inBounds(occX, occY)) {
            if (allegiance !== mod.get('occupied')[occX][occY].isHostile) {
                let deltaX = occX - x;
                let deltaY = occY - y;

                let onePlusX = occX + deltaX;
                let onePlusY = occY + deltaY;

                if (
                    inBounds(onePlusX, onePlusY) &&
                    !isOccupied(onePlusX, onePlusY)
                ) {
                    jumps.push({
                        x: onePlusX,
                        y: onePlusY,
                        jumpedX: occX,
                        jumpedY: occY,
                    });
                }
            }
        }
    });

    return jumps;
}

//
//
//
function getActionsForTeam(team) {
    let mustTakeJump = false;
    let jumpOptions = [];
    let moveOptions = [];

    team.map((checker) => {
        let range = getMovementRange(checker);
        let jumps = getAvailableJumps(checker, range);

        if (jumps.length > 0) {
            mustTakeJump = true;

            jumps.map((jump) => jumpOptions.push({
                checker,
                jump,
            }));
        }

        // only pay attention to moves if there are no jump options; per the
        // rules o' checkers you gotta take a jump if it's available
        if (!mustTakeJump) {
            let validMoves = getValidMovesFromRange(range);

            if (validMoves.length > 0) {
                validMoves.map((move) => moveOptions.push({
                    checker,
                    move
                }));
            }
        }
    });

    return {
        jumps: jumpOptions,
        moves: moveOptions,
    };
}

// a helper method for randomly picking a given action; expects an array of
// jump or move objects
function getRandomAction(actions) {
    let random = Math.floor(Math.random() * actions.length);
    return actions[random];
}

//
//
//
function getBestMove(moves) {
    let aiLevel = mod.get('aiLevel');

    // chaos!
    if (aiLevel === 'random') {
        return getRandomAction(moves);
    }
}

//
//
//
function getBestJump(jumps) {
    let aiLevel = mod.get('aiLevel');

    if (aiLevel === 'random') {
        return getRandomAction(jumps);
    }
}

//
//
//
function removeJumpedChecker(x, y) {
    let occupied = mod.get('occupied');
    let jumpedChecker = occupied[x][y];
    let team;

    team = (jumpedChecker.isHostile) ? mod.get('hostiles') : mod.get('allies');
    team.splice(team.indexOf(jumpedChecker), 1);

    jumpedChecker.destructor();
    occupied[x][y] = false;

    let toUpdate = { occupied };

    if (jumpedChecker.isPlayer) {
        toUpdate.playerChecker = false;
    }

    mod.set(toUpdate);
}

//
//
//
function updateCheckerPosition(checker, x, y, updateAfterMove={}) {
    // update the occupied board model with our new position
    let occupied = mod.get('occupied');

    occupied[checker.x][checker.y] = false;
    occupied[x][y] = checker;

    updateAfterMove.occupied = occupied;

    checker.afterMove(() => mod.set(updateAfterMove));
    checker.position(x, y);
}

//
//
//
function moveHostiles() {
    let checkers = mod.get('hostiles');
    let actions = getActionsForTeam(checkers);
    let hasJumps = actions.jumps.length > 0;
    let action;

    if (hasJumps) {
        action = getBestJump(actions.jumps);

    } else {
        action = getBestMove(actions.moves);
    }

    let {x, y} = (hasJumps) ? action.jump : action.move;
    let {jumpedX, jumpedY} = (hasJumps) ? action.jump : {};

    updateCheckerPosition(
        action.checker,
        x,
        y,
        { isTurn: true }
    );

    if (jumpedX) {
        removeJumpedChecker(jumpedX, jumpedY);
    }
}

//
//
//
function moveAllies() {
    console.log('Move allies!');
}

//
//
//
function setPlayerMoves() {
    let playerChecker = mod.get('playerChecker');

    if (playerChecker === false) {
        if (mod.get('allies').length === 0) {
            console.log('>>>>> GAME OVER >>>>>');
        }
        return;
    }

    let range = getMovementRange(playerChecker);
    let jumps = getAvailableJumps(playerChecker, range);
    let validMoves = getValidMovesFromRange(range);

    if (jumps.length !== 0) {
        validMoves = jumps;
    }

    mod.set({ validMoves });
}

//
//
//
function movePlayerChecker(x) {
    let y = mod.get('playerY');
    let playerChecker = mod.get('playerChecker');

    updateCheckerPosition(
        playerChecker,
        x,
        y,
        { isTurn : false }
    );
}

mod.watch('allyAction', moveAllies);
mod.watch('playerX', movePlayerChecker);
mod.watch('isTurn', (playerTurn) => {
    if (playerTurn) {
        setPlayerMoves();

    } else {
        moveHostiles();
    }
});
