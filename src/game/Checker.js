//import View from '../common/View';
import El from '../common/El';
import mod from '../mod';
import {scale3d, translate3d} from '../common/transform';

import './Checker.css';

// a helper method for rendering baseline - but dynamic - styles common to
// every checker. it returns a style object for use with El's .setStyle() method
function getDefaultStyle() {
    let checkerSize = mod.get('checkerSize');

    return {
        width: `${checkerSize}vh`,
        paddingBottom: `${checkerSize}vh`,
        margin: `${mod.get('checkerMargin')}vh`,
    };
}

//
//
//
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

        this.setStyle(getDefaultStyle());
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
            this.setStyle(jumpStyles());

        } else {
            this.justJumped = false;
            this.setStyle({
                transform: translate3d(xPos, yPos),
            });
        }

        this.x = x;
        this.y = y;
    }

    remove() {
        let tileSize = mod.get('tileSize');
        let xPos = this.x * tileSize;
        let yPos = this.y * tileSize;

        let transforms = [
            translate3d(xPos, yPos),
            scale3d(0.2, 0.2)
        ];

        this.onTrans(() => pixelateOut(this));
        this.setStyle({ transform: transforms.join(' ') });

    }
}

export default Checker;
