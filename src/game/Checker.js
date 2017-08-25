//import View from '../common/View';
import El from '../common/El';
import mod from '../mod';
import {translate3d} from '../common/transform';

import './Checker.css';

/*
// a helper method for ensuring an X/Y point is on the board
function inBounds(coord) {
    return (coord > -1) && (coord < mod.get('columns'));
}
*/

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
        this.isHostile = isHostile;
    }

    // a method to position a checker in the viewport; it takes an X and Y grid
    // position and turns it into a CSS equivalent based on tile size
    position(x, y) {
        let tileSize = mod.get('tileSize');
        let xPos = x * tileSize;
        let yPos = y * tileSize;

        this.style({
            transform: translate3d(xPos, yPos),
        });

        this.x = x;
        this.y = y;
    }

    /*
    getRange() {
        let columns = mod.get('columns');
        let xPlus = (this.x + 1 < columns) ? this.x + 1 : null;
        let yPlus = (this.y + 1 < columns) ? this.y + 1 : null;
        let xMinus = (this.x - 1 > -1) ? this.x - 1 : null;
        let yMinus = (this.y - 1 > -1) ? this.y - 1 : null;

        let allyMoves = [];
        if (xMinus && yMinus)
            allyMoves.push({ x: xMinus, y: yMinus });
        if (xMinus && yPlus)
            allyMoves.push({ x: xMinus, y: yPlus });

        let hostileMoves = [];
        if (xPlus && yMinus)
            hostileMoves.push({ x: xPlus, y: yMinus });
        if (xPlus && xPlus)
            hostileMoves.push({ x: xPlus, y: yPlus });

        if (this.isKing) {
            return allyMoves.concat(hostileMoves);
        }

        return (this.isHostile) ? hostileMoves : allyMoves;
    }
    */
}

export default Checker;
