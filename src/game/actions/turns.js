import mod from '../../mod';
import playerActions from './playerActions';
import ai from './ai';

mod.set({
    // whether or not it's the player's turn
    isTurn: false,
}, true);

//
//
function handleTurnChange(isTurn) {
    // if there's no player checker ... they were jumped, most likely ... do
    // nothing and fall into checker-select mode
    if (!mod.get('playerChecker')) {
        mod.set({ doCheckerSelect: true });
        return;

    } else if (isTurn) {
        playerActions();

    } else {
        let hostiles = mod.get('hostileCheckers');
        if (hostiles.length === 0) {
            mod.set({ youWon: true });
            return;
        }

        ai.go(ai.action(hostiles));
    }
}

mod.watch('isTurn', handleTurnChange);
