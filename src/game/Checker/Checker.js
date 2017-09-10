//import View from '../common/View';
import El from '../../common/El';
import mod from '../../mod';
import {translate3d} from '../../common/transform';

import './Checker.css';

// default checker styles in the model
mod.set({
    // the calculated size of a checker. will fit inside a tile (tileSize) with
    // the specified buffer (tileBuffer) on all sides. returns a percentage.
    checkerSize: function() {
        return this.get('tileSize') - (this.get('tileBuffer') * 2);
    },
    // how many checkers are on a team? regardless of board size, there are
    // always two empty rows in the middle of the board.
    checkersPerTeam: function() {
        let cols = this.get('boardCols');
        let perRow = cols / 2;
        let rowsPer = cols / 2 - 1;

        return perRow * rowsPer;
    },
}, true);

// a method for checking if a given X/Y position is actually on the board
function inBounds(x, y) {
    let columns = mod.get('boardCols');
    let onBoard = (coord) => (coord > -1) && (coord < columns);
    return (onBoard(x) && onBoard(y));
}

// a simple no-operation function. useful in setting defaults for optional
// callbacks
function noop() { return; }

//
//
//
/*
function pixelateOut(checker) {
    let board = mod.get('board');
    let random = Math.floor(Math.random() * 16 + 10);
    let pixelations = [];

    while (random--) {
        let clone = checker.el.cloneNode();
        let randomX = Math.floor(Math.random() * 50 + 10);
        let randomY = Math.floor(Math.random() * 50 + 10);
        let transform = translate3d(randomX, randomY);

        let transitions = [
            'opacity 1200ms ease-out',
            'transform 1200ms cubic-bezier(0,1,1,0.75)'
        ];

        board.kids(clone);
        clone.style.transition = transitions.join(',');

        pixelations.push({
            pixel: clone,
            transform: transform + ' scale3d(0.2, 0.2, 1)',
        });
    }

    checker.destructor();

    let lastPixel = pixelations[pixelations.length - 1].pixel;

    lastPixel.addEventListener('transitionend', function cleanup() {
        let fx;
        while (fx = pixelations.pop()) { // eslint-disable-line
            fx.pixel.parentNode.removeChild(fx.pixel);
        }

        lastPixel.removeEventListener('transitionend', cleanup);
    });

    pixelations.map((fx) => {
        setTimeout(() => {
            fx.pixel.style.opacity = 0;
            fx.pixel.style.transform = fx.transform;
        }, 0);
    });
}
*/

class Checker extends El {
    constructor(options={}) {
        super('i');
        let toClassify = ['+checker'];
        let {isHostile, x, y} = options;
        let checkerSize = `${mod.get('checkerSize')}vh`;

        if (isHostile) {
            this.isHostile = true;
            toClassify.push('+hostile');
        }

        this.classify(toClassify.join(' '));
        this.style({
            width: checkerSize,
            height: checkerSize,
            margin: `${mod.get('tileBuffer')}vh`,
        });

        this.position(x, y);
    }

    // when a checker is selected to be the player checker, this method sets the
    // appropriate flags for handling actions
    makePlayer() {
        this.isPlayer = true;
        this.classify('+playerChecker');
    }

    // sets our hooks for a king'ed checker
    makeKing() {
        let kingRow = (this.isHostile) ? mod.get('boardCols') - 1 : 0;
        if (!this.isKing && (this.y === kingRow)) {
            this.isKing = true;
            this.classify('+king');
        }
    }

    // a helper for checking if a given position is a jump ... the X coord
    // will have changed by more than 1
    isJump(x) {
        return Math.abs(x - this.x) > 1;
    }

    // checks an X/Y position on our board; it'll return FALSE if the move can't
    // theoretically be made (off the board). it'll return a checker instance if
    // the square is occupied, or TRUE if the space is open.
    checkPosition(x, y) {
        if (!inBounds(x, y)) {
            return false;
        }

        let occupant = mod.get('checkerPositions')[x][y];
        let position = {x, y, occupant};
        return position;
    }

    // convenience methods for grabbing move availability/occupation for the
    // checker's adjacent squares
    getUpLeft()    { return this.checkPosition(this.x - 1, this.y - 1); }
    getUpRight()   { return this.checkPosition(this.x + 1, this.y - 1); }
    getDownRight() { return this.checkPosition(this.x + 1, this.y + 1); }
    getDownLeft()  { return this.checkPosition(this.x - 1, this.y + 1); }

    //
    getRange() {
        let hostileRange = [this.getDownLeft(), this.getDownRight()];
        let allyRange = [this.getUpLeft(), this.getUpRight()];

        if (this.isKing) {
            return hostileRange.concat(allyRange);
        }

        return (this.isHostile) ? hostileRange : allyRange;
    }

    // gets valid moves (non-jumps) for the checker; will return an array of
    // valid moves and an empty array if the checker can do nothing.
    getMoves() {
        let range = this.getRange();
        let moves = range.map((tile) => {
            if (!tile) {
                return false;
            }

            let {x, y, occupant} = tile;

            if (occupant) {
                return false;
            }

            return {
                checker: this,
                toX: x,
                toY: y,
            };
        });

        return moves.filter((move) => move);
    }

    // available jumps for the checker; returns an array of standard action
    // objects along with a reference to the jumped checker. if no jumps are
    // available you'll get an empty array back
    getJumps(/*hypotheticalX, hypotheticalY*/) {
        let range = this.getRange();
        let jumps = range.map((tile) => {
            let {x, y, occupant} = tile;

            // if the square isn't occupied it's not a jump (obviously); if the
            // square is occupied by a checker of same allegiance, also not
            // jumpable
            if (!occupant || (occupant.isHostile === this.isHostile)) {
                return false;
            }

            let xDelta = x - this.x;
            let yDelta = y - this.y;
            let farX = x + xDelta;
            let farY = y + yDelta;
            let farTile = this.checkPosition(farX, farY);

            // checkPosition returns TRUE for an empty square
            if (farTile && !farTile.occupant) {
                return {
                    checker: this,
                    toX: farX,
                    toY: farY,
                    jumped: occupant,
                };
            }

            return false;
        });

        return jumps.filter((jump) => jump);
    }

    getActions() {
        let jumps = this.getJumps();

        // if the checker has jumps, they must be taken. don't bother looking up
        // moves
        if (jumps.length > 0) {
            return jumps;
        }

        return this.getMoves();
    }

    //
    //
    removeFromPlay() {
        let checkerPositions = mod.get('checkerPositions');
        // create a clone of our checkers cache so we're not manipulating it
        // directly; this helps group our actions and triggers a "change" event
        // when we update
        let checkers = [].concat(mod.get('checkers'));
        let indexOf = checkers.indexOf(this);

        // remove the checker from our model
        checkers.splice(indexOf, 1);
        // start a running list of stuff to update and do one batch at the end
        let toUpdate = { checkers };

        checkerPositions[this.x][this.y] = false;

        if (this.isPlayer) {
            toUpdate.playerChecker = false;
        }

        this.destructor();
        mod.set(toUpdate);
    }

    // animates a checker to a given position; at the end of the transition it
    // fixes the checker to the give X/Y. it takes an optional callback to
    // execute after the transition is completed.
    animateTo(toX, toY, andThen=noop) {
        let tileSize = mod.get('tileSize');
        let xDelta = (toX - this.x) * tileSize;
        let yDelta = (toY - this.y) * tileSize;

        this.onTrans(() => {
            this.classify('+suppressTrans');
            // set the "actual" position of the checker after it transitions
            this.position(toX, toY);
            this.style({ transform: 'unset' });
            andThen();
            // we don't want the addition/removal of our suppression class to
            // be batched by browsers so we wrap its removal in a timeout
            setTimeout(() => this.classify('-suppressTrans'), 50);
        });

        this.style({
            transform: translate3d(xDelta, yDelta),
        });
    }

    // a method to position a checker in the viewport; it takes an X and Y grid
    // position and turns it into a CSS equivalent based on tile size. this is
    // for hard-setting a checker's X/Y and has no animation or F/x
    position(x, y) {
        let tileSize = mod.get('tileSize');
        let xPos = x * tileSize;
        let yPos = y * tileSize;

        this.style({
            left: `${xPos}vh`,
            top: `${yPos}vh`,
        });

        let checkerPositions = mod.get('checkerPositions');

        if (this.x >= 0) {
            checkerPositions[this.x][this.y] = false;
        }
        checkerPositions[x][y] = this;
        mod.set({ checkerPositions });

        this.x = x;
        this.y = y;

        // do the king check in a timeout to ensure it doesn't happen until the
        // next cycle; becoming a king ends your turn
        setTimeout(() => this.makeKing(), 0);
    }
}

export default Checker;
