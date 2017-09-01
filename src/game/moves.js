import mod from '../mod';

// our moves module is concerned with/manages these properties of our model;
// set our defaults
mod.set({
    // whether or not it's the player's turn
    isTurn: false,
    // all jumps must be taken, as per the rules of checkers. this is a hook for
    // disabling movement if either the player or an ally has to jump
    playerMustJump: false,
    allyMustJump: false,
    // moves available to the player on a given turn
    validMoves: null,
});

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

// placeholder for things your allies can do; set at the start of each turn
let _allyActions;

//
//
//
function toggleTurn() {
    mod.set({
        isTurn: !mod.get('isTurn'),
    });
}

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
function getTeamActions(team) {
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
        toUpdate.validMoves = [];
    }

    mod.set(toUpdate);
}

//
//
//
function updateCheckerPosition(checker, x, y, afterMove=noop) {
    // update the occupied board model with our new position
    let occupied = mod.get('occupied');

    occupied[checker.x][checker.y] = false;
    occupied[x][y] = checker;

    let postMoveActions = () => {
        afterMove();
        mod.set({occupied});

        if (checker.justJumped) {
            let newRange = getMovementRange(checker);
            let extraJumps = getAvailableJumps(checker, newRange);

            if ((extraJumps.length > 0) && (checker.isPlayer)) {
                mod.set({
                    validMoves: [],
                });
                setPlayerMoves();

            } else if (extraJumps.length > 0) {
                if (checker.isHostile) {
                    moveTeam(mod.get('hostiles'));

                // ally double-jump; good work, squad!
                } else {
                    console.log('Double jump! Do a fancy notification/bravo.');
                    handleAllyJump(true);
                }

            } else {
                toggleTurn();
            }

        } else {
            toggleTurn();
        }
    };

    checker.onTrans(postMoveActions);
    checker.position(x, y);
}

//
//
//
function moveTeam(checkers) {
    let actions = (_allyActions) ? _allyActions : getTeamActions(checkers);
    let hasJumps = actions.jumps.length > 0;
    let action, onJump;

    if (hasJumps) {
        action = getBestJump(actions.jumps);

    } else {
        action = getBestMove(actions.moves);
    }

    let {x, y} = (hasJumps) ? action.jump : action.move;
    if (hasJumps) {
        let {jumpedX, jumpedY} = action.jump;
        onJump = () => removeJumpedChecker(jumpedX, jumpedY);
    }

    updateCheckerPosition(
        action.checker,
        x,
        y,
        onJump
    );
}

//
//
//
function moveAllies(tactic) {
    if (tactic === null) {
        return;
    }

    moveTeam();

    mod.set({
        validMoves: [],
        allyAction: null,
    });
}

//
//
//
function handleAllyJump(canJump) {
    if (!canJump) {
        return;
    }

    let allyJump = getBestJump(_allyActions.jumps);
    let playerMustJump = mod.get('playerMustJump');
    let allyChecker = allyJump.checker;
    let board = mod.get('board');

    if (playerMustJump) {
        console.log('Throw a notification for the choice');
        return;
    }

    let {checker} = allyJump;
    let {x, y, jumpedX, jumpedY} = allyJump.jump;

    // @todo i hate these chained callbacks; see if there's a more elegant
    // solution for handling this event loop should time allow
    let afterFocus = () => {
        let afterJump = () => {
            mod.set({
                focusX: mod.get('playerX'),
                focusY: mod.get('playerY'),
            });
        };

        allyChecker.onTrans(afterJump);
        updateCheckerPosition(
            checker,
            x,
            y,
            () => {
                removeJumpedChecker(jumpedX, jumpedY);
                afterJump();
            }
        );
    };

    board.onTrans(afterFocus);
    mod.set({
        focusX: allyJump.checker.x,
        focusY: allyJump.checker.y,
    });
}

//
//
//
function handlePlayerMove(playerX) {
    let {
        playerChecker,
        playerY,
        validMoves,
    } = mod.get('playerChecker', 'playerY', 'validMoves');

    // if we're simply establishing player position (as when selecting a
    // checker) and no moves are set, do nothing
    if (!validMoves) {
        return;
    }

    let onJump;
    let action = mod.get('validMoves').filter((move) => {
        return ((move.x === playerX) && (move.y === playerY));
    })[0];

    if (!action) {
        return;
    }

    if (action.jumpedX) {
        onJump = () => removeJumpedChecker(action.jumpedX, action.jumpedY);
    }

    updateCheckerPosition(playerChecker, playerX, playerY, onJump);
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
    let playerMustJump = false;

    _allyActions = getTeamActions(
        mod.get('allies').filter((checker) => {
            return checker.isPlayer !== true;
        })
    );

    let allyMustJump = (_allyActions.jumps.length > 0);

    // if the player has jumps, s/he must take one
    if (jumps.length > 0) {
        playerMustJump = true;
        validMoves = jumps;

    // if the player has no jumps but an ally does, the player can't move
    } else if (allyMustJump) {
        validMoves = [];
    }

    mod.set({ allyMustJump, playerMustJump, validMoves });
}

mod.watch('allyAction', moveAllies);
// tile selection comes from the board component; when a tile is selected it
// updates the playerX/Y vals, which we pick up here and actually handle the
// move
mod.watch('playerX', handlePlayerMove);
mod.watch('allyMustJump', handleAllyJump);
mod.watch('isTurn', (playerTurn) => {

    // reset the the action cache
    _allyActions = null;

    if (playerTurn) {
        setPlayerMoves();

    } else {
        moveTeam(mod.get('hostiles'));
    }
});
