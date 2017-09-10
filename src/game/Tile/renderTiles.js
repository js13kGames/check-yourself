import Tile from './Tile';
import mod from '../../mod';

// renders our board tiles, marking them with the appropriate X/Y hooks as an ID
function renderTiles() {
    let cols = mod.get('boardCols');
    // we slice our columns in half because 1) you can only take action on every
    // other tile and we don't want to clutter the DOM, and 2) we want the board
    // to be semi-transparent as a cool visual effect
    let totalTileCount = cols * cols / 2;
    let col = 0;
    let row = 0;
    let tiles = [];

    for (let i = 0; i < totalTileCount; i++) {
        if (col >= cols) {
            row++;
            col = row % 2;
        }

        let tile = new Tile(col, row);
        tiles.push(tile);

        col += 2;
    }

    mod.set({ tiles });
    return tiles;
}

export default renderTiles;
