import mod from '../../mod';
import getPlayerActions from './playerActions';
import ai from './ai';

mod.set({
    // whether or not it's the player's turn
    isTurn: false,
}, true);

//
//
function handleTurnChange(isTurn) {
    let youWon = () => mod.set({
        youWon: true,
    });

    // if there's no player checker ... they were jumped, most likely ... do
    // nothing and fall into checker-select mode
    if (!mod.get('playerChecker')) {
        mod.set({ doCheckerSelect: true });
        return;

    } else if (isTurn) {
        getPlayerActions();

    } else {
        let hostiles = mod.get('hostileCheckers');
        if (hostiles.length === 0) {
            //mod.set({ youWon: true });
            youWon();
            return;
        }

        let hostileAction = ai.action(hostiles);

        if (!hostileAction) {
            youWon();
            return;
        }

        ai.go(hostileAction);
    }
}

mod.watch('isTurn', handleTurnChange);
