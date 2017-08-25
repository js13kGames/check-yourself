//import View from '../common/View';
import El from '../common/El';
import mod from '../mod';
import {translate3d} from '../common/transform';

import './Checker.css';

// a helper method for rendering baseline - but dynamic - styles common to
// every checker. it returns a style object for use with El's .style() method
function getDefaultStyle() {
    let checkerSize = mod.get('checkerSize');

    return {
        width: `${checkerSize}vw`,
        paddingBottom: `${checkerSize}vw`,
        margin: `${mod.get('checkerMargin')}vw`,
    };
}

class Checker extends El {
    constructor(props) {
        super('i');

        let {isHostile, x, y, ...theRest} = props;
        let className = 'checker';

        if (isHostile) {
            className += ' hostile';
        } else {
            className += ' playable-checker';
        }

        this.attribute(Object.assign(theRest, {
            className: className,
        }));

        this.style(getDefaultStyle());
        this.position(x, y);

        this.isKing = false;
        this.isPlayer = false;
        this.isHostile = isHostile;
    }

    // a helper for checking if a given position is a jump ... the X coord
    // will have changed by more than 1
    isJump(x) {
        return Math.abs(x - this.x) > 1;
    }

    // a method to position a checker in the viewport; it takes an X and Y grid
    // position and turns it into a CSS equivalent based on tile size
    position(x, y) {
        let tileSize = mod.get('tileSize');
        let xPos = x * tileSize;
        let yPos = y * tileSize;

        // extra fancification on a jump transform
        if (this.isJump(x)) {
            console.log('Do a jump animation!');
        }

        this.style({
            transform: translate3d(xPos, yPos),
        });

        // let the board know about everything that just went down; generally
        // good policy as far as "the Board" is concerned
        //this.notifyTheBoard(x, y, jumped);

        this.x = x;
        this.y = y;
    }

    afterMove(callback) {
        let onTransitionEnd = () => {
            this.el.removeEventListener('transitionend', onTransitionEnd);
            callback(this);
        };

        this.el.addEventListener('transitionend', onTransitionEnd);
    }
}

export default Checker;
