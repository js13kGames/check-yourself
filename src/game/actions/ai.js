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
function afterAction(prevAction) {
    let {checker, jumped} = prevAction;

    if (!jumped) {
        toggleTurn();
        return;
    }

    let nextJumps = checker.getJumps();
    if (nextJumps.length > 0) {
        // give the animation suppression a chance to clear out
        setTimeout(() => {
            takeAction(getBestJump(nextJumps));
        }, 75);
        return;
    }

    toggleTurn();
}

//
//
function takeAction(action) {
    if (!action) {
        return;
    }

    let {checker, toX, toY, jumped} = action;
    let currentCameraPosition = mod.get('cameraPosition');
    let theAction = () => {
        checker.animateTo(toX, toY, () => afterAction(action));

        if (jumped) {
            jumped.removeFromPlay();
        }
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

//
//
function getBestJump(jumps) {
    let random = Math.floor(Math.random() * jumps.length);
    return jumps[random];
}

//
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
