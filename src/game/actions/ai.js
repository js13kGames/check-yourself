import mod from '../../mod';

//
//
function toggleTurn() {
    mod.set({
        isTurn: !mod.get('isTurn'),
        allyAction: null,
    });
}

//
//
//let suppressionCheck;
function whenNotSuppressed(checker, andThen) {
    let suppressionCheck = setInterval(() => {
        if (checker.el.classList.contains('suppressTrans')) {
            return;
        }

        clearInterval(suppressionCheck);
        andThen();
    }, 100);
}

//
//
function afterAction(prevAction) {
    let {checker, jumped} = prevAction;

    mod.set({ nextAiJump: null }, true);
    if (!jumped) {
        //toggleTurn();
        return false;
    }

    let nextJumps = checker.getJumps();
    if (nextJumps.length > 0) {
        mod.set({
            nextAiJump: getBestJump(nextJumps)
        }, true);
        return true;
    }

    return false;
}

// process the given action; takes a standard action object and creates a move
// or jump.
function takeAction(action) {
    if (!action) {
        return;
    }

    let {checker, toX, toY, jumped} = action;
    let currentCameraPosition = mod.get('cameraPosition');

    // @todo this whole timeout thing is messy, but we're 11th hour'ing ... if
    // spare minutes allow come back and clean this up.
    let theAction = () => {
        if (jumped) {
            jumped.removeFromPlay();
        }

        checker.animateTo(toX, toY, () => {
            if (afterAction(action)) {
                whenNotSuppressed(checker, () => {
                    takeAction(mod.get('nextAiJump'));
                });

                return;
            }

            toggleTurn();
        });
    };

    if (currentCameraPosition !== 'camOverview') {
        mod.get('board').onTrans(() => theAction());

    } else {
        theAction();
    }

    mod.set({
        cameraPosition: 'camOverview',
    });

}

// a method for integrating with hooks for AI to get the "best" jump; we'll
// implement better AI here down the way. @todo implement better AI here down
// the way
function getBestJump(jumps) {
    let random = Math.floor(Math.random() * jumps.length);
    return jumps[random];
}

//
function getBestMove(moves) {
    let random = Math.floor(Math.random() * moves.length);
    return moves[random];
}

//
//
function getNonPlayerActions(checkers) {
    let actions = [];

    checkers.map((checker) => {
        let checkerActions = checker.getActions();
        if (checkerActions.length > 0) {
            actions = actions.concat(checker.getActions());
        }
    });

    let jumps = actions.filter((action) => action.jumped);

    if (jumps.length > 0) {
        return getBestJump(jumps);
    }

    return getBestMove(actions);
}

export default {
    action: getNonPlayerActions,
    go: takeAction,
};
