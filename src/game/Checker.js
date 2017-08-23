import View from '../common/View';
import mod from '../mod';

import './Checker.css';

class Checker extends View {
    constructor(props) {
        let {nodeName, isHostile, isPlayable, ...theRest} = props;
        let className = 'checker';

        if (isHostile) {
            className += ' hostile';
        }

        if (isPlayable) {
            className += ' playable-checker';
        }

        super(Object.assign(theRest, {
            nodeName: 'i',
            className: className,
        }));

        this.setDefaultStyle();
    }

    setDefaultStyle() {
        let checkerSize = mod.get('checkerSize');

        this.style({
            width: `${checkerSize}vw`,
            paddingBottom: `${checkerSize}vw`,
            margin: `${mod.get('checkerMargin')}vw`,
        });
    }

    // a method to position a checker in the viewport; it takes an X and Y grid
    // position and turns it into a CSS equivalent based on tile size
    position(x, y) {
        let tileSize = mod.get('tileSize');
        let xPos = x * tileSize;
        let yPos = y * tileSize;

        this.style({
            transform: `translate3d(${xPos}vw, ${yPos}vw, 0)`,
        });

        this.x = x;
        this.y = y;
    }
}

export default Checker;
