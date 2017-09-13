import mod from '../../mod';
import ai from './ai';

mod.set({
    respawns: 0,
    movesToWin: 0,
}, true);

//
function focusOnPlayer(playerChecker) {
    if (!playerChecker) {
        return;
    }

    let {x, y} = playerChecker;
    let cameraPosition = mod.get('playerCameraPosition') || 'camDefault';
    mod.set({
        focusX: x,
        focusY: y,
        cameraPosition: cameraPosition,
    });
}

//
function endTurn() {
    mod.set({
        isTurn: false,
    });
}

//
//
function moveAlly() {
    ai.go(mod.get('allyAction'));
    mod.set({ playerActions: [] });
}

// checks if there are any available jumps based on the player checker's
// position without checking for moves or allies; intended to be used following
// a jump to check for double/triple/N'ple jumps. returns TRUE and restarts the
// move cycle if jumps are available and FALSE if not
function getNextJump() {
    // check for additional jumps
    let nextJumpActions = getPlayerActions();
    if ((nextJumpActions.length > 0) && (nextJumpActions[0].jumped)) {
        mod.set({
            playerActions: nextJumpActions,
        });

        return true;
    }
    return false;
}

//
//
function movePlayer(x, y) {
    let playerChecker = mod.get('playerChecker');
    let currentAction = mod.get('playerActions').filter((action) => {
        return ((action.toX === x) && (action.toY === y));
    })[0];

    if (currentAction.jumped) {
        currentAction.jumped.removeFromPlay();
    }

    mod.set({
        playerActions: [],
        allyAction: null,
        focusX: x,
        focusY: y,
    });

    playerChecker.animateTo(x, y, () => {
        mod.set({
            tileSelected: null,
        }, true);

        if (!currentAction.jumped) {
            endTurn();

        } else if (getNextJump() === false) {
            endTurn();
        }
    });
}

// grabs available actions for the player checker; not that these are not
// necessarilly valid moves, depending on what's going on with the allies
function getPlayerActions() {
    return mod.get('playerChecker').getActions();
}


// a method for getting available actions for the player taking into account
// the player him/herself and the allies. returns an array of standard action
// objects
function getValidPlayerActions() {
    mod.set({
        movesToWin: mod.get('movesToWin') + 1
    }, true);

    let playerChecker = mod.get('playerChecker');
    let playerActions = getPlayerActions();
    let allyAction = ai.action(
        // all of us but me!
        mod.get('allyCheckers').filter((checker) => !checker.isPlayer)
    );


    // the current square where the player checker is; essentially a "pass"
    // action and allowing an ally to move
    let stayPut = {
        checker: playerChecker,
        toX: playerChecker.x,
        toY: playerChecker.y,
    };

    let playerHasJump = ((playerActions.length > 0) && playerActions[0].jumped);
    let allyHasJump = (allyAction && allyAction.jumped);

    mod.set({ allyAction }, true);

    // if an ally has a jump and the player doesn't, the player can't move;
    // the ally must take that jump
    if (
        (allyHasJump && !playerHasJump) ||
        ((playerActions.length === 0) && (!allyHasJump))
    ) {
        playerActions = [];
        moveAlly();
        return;

    // if the player has a jump and an ally does not, the player can't pass
    } else if (allyAction && (playerHasJump === allyHasJump)) {
        playerActions.push(stayPut);
    }

    focusOnPlayer(playerChecker);
    mod.set({ playerActions });
}

//
function handleTileSelection(xy) {
    let {x:selectedX, y:selectedY} = xy;
    let {x:playerX, y:playerY} = mod.get('playerChecker');

    // if the current tile was clicked, consider it an ally move
    if ((selectedX === playerX) && (selectedY === playerY)) {
        moveAlly();
        return;
    }

    movePlayer(selectedX, selectedY);

}

// when the player checker is updated (as when s/he has been jumped or changed)
// focus on 'em
mod.watch('playerChecker', focusOnPlayer);
mod.watch('tileSelected', handleTileSelection);

export default getValidPlayerActions;
