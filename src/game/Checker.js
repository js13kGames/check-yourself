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

    // helper methods for checking squares around this checker; note that these
    // have no concern for the constraints of our board and may report invalid
    // tiles (-1, -1 eg.) and should be validated on the receiving end.
    // moves.js does exactly that.
    getUpLeft() {
        return { x: this.x - 1, y: this.y - 1 };
    }
    getUpRight() {
        return { x: this.x + 1, y: this.y - 1 };
    }
    getDownRight() {
        return { x: this.x + 1, y: this.y + 1 };
    }
    getDownLeft() {
        return { x: this.x - 1, y: this.y + 1 };
    }

    // a method to position a checker in the viewport; it takes an X and Y grid
    // position and turns it into a CSS equivalent based on tile size
    position(x, y) {
        let tileSize = mod.get('tileSize');
        let xPos = x * tileSize;
        let yPos = y * tileSize;

        let jumpStyles = () => {
            console.log('Jump animation! Work this out ...');
            let styles = [
                translate3d(xPos, yPos),
            ];

            return {
                transform: styles.join(' '),
            };
        };

        // extra fancification on a jump transform
        if (this.isJump(x)) {
            this.justJumped = true;
            this.style(jumpStyles());

        } else {
            this.justJumped = false;
            this.style({
                transform: translate3d(xPos, yPos),
            });
        }

        this.x = x;
        this.y = y;
    }
}

export default Checker;
