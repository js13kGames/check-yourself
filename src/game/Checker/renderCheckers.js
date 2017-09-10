import Checker from './Checker';
import mod from '../../mod';

// some convenience methods on the model to fetch allied and hostile checkers
mod.set({
    // seed what'll be our game-wide reference to checker position (and by
    // proxy) the board state
    checkerPositions: [],
    allyCheckers: function() {
        return this.get('checkers').filter(({isHostile}) => !isHostile);
    },
    hostileCheckers: function() {
        return this.get('checkers').filter(({isHostile}) => isHostile);
    },
});

// creates checker instances to be used in the game, both allies and hostiles.
// returns an array of Checker instances
function renderCheckers() {
    let checkersPerTeam = mod.get('checkersPerTeam');
    let checkers = [];

    let hostileRow = 0;
    let boardCols = mod.get('boardCols');
    let allyRow = boardCols - 1;

    let checkerPositions = [];
    for (let i = 0; i < boardCols; i++) {
        checkerPositions[i] = [];
    }
    mod.set({ checkerPositions }, true);

    for (let i = 0; i < checkersPerTeam; i++) {
        if ((i > 0) && (i % 4 === 0)) {
            hostileRow++;
            allyRow--;
        }

        let hostileOffset = hostileRow % 2;
        let allyOffset = allyRow % 2;
        let col = (i % 4) * 2;

        let hostileCol = col + hostileOffset;
        let hostile = new Checker({
            isHostile: true,
            x: hostileCol,
            y: hostileRow,
        });

        let allyCol = col + allyOffset;
        let ally = new Checker({
            x: allyCol,
            y: allyRow,
        });

        checkers.push(hostile, ally);
    }

    // stash our checkers for reference throughout the game
    mod.set({ checkers });
    return checkers;
}

export default renderCheckers;
