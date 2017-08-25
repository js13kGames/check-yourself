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
function getAvailableJumps(checker, range) {
    let {x, y} = checker;
    let jumps = [];
    let allegiance = checker.isHostile;

    range.map((move) => {
        let {occX, occY} = move;
        // we're concerned with invalid moves ... occupied only
        if (move.isValid === false && inBounds(occX, occY)) {
            if (allegiance !== mod.get('occupied')[x][y].isHostile) {
                let deltaX = occX - x;
                let deltaY = occY - y;

                let onePlusX = occX + deltaX;
                let onePlusY = occY + deltaY;

                if (!isOccupied(onePlusX, onePlusY)) {
                    jumps.push({
                        x: onePlusX,
                        y: onePlusY,
                    });
                }
            }
        }
    });

    return jumps;
}

mod.watch('isTurn', (playerTurn) => {
    if (playerTurn) {
        let playerChecker = mod.get('playerChecker');

        let range = getMovementRange(playerChecker);
        let jumps = getAvailableJumps(playerChecker, range);

        let validMoves = range.filter((move) => move.isValid === true).map(
            (move) => {
                return {
                    x: move.x,
                    y: move.y
                };
            }
        );

        mod.set({validMoves});

    } else {
        console.log('It is not the player turn');
    }
});
