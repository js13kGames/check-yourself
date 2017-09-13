import El from '../../common/El';
import mod from '../../mod';
import './Tile.css';

class Tile extends El {
    constructor(x, y) {
        super();

        let tileSize = mod.get('tileSize');
        let marginLeft = (x === 0) ? 0 : tileSize;

        this.classify('+tile')
            .attribute({
                id: `x${x}-y${y}`,
            })
            .style({
                width: `${tileSize}vh`,
                height: `${tileSize}vh`,
                marginLeft: `${marginLeft}vh`,
            });

        this.x = x;
        this.y = y;
    }
}

export default Tile;
