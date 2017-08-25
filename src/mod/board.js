/**
 * Base Settings Defining the Board
 *
 * As with all model components, it's a simple object whose attributes can be
 * explicitly set or calculated on-the-fly. When this is imported into our
 * global "model" construct, 'this' context is automatically provided.
 *
 * Note that derived (function) properties can not be set or watched.
 */
export default {
    // the number of tiles in a row for our checkboard; the board is always
    // square so we don't specify a "rows" property. we also play on an American
    // "standard" checker board ... 8x8.
    columns: 8,
    // sure, it's easy enough to get our columns and divide it by 2 ... but
    // "half the board" is used all over the place. here's a little shortcut
    // right to it.
    halfCols: 4,
    // we scale the screen by this much in our CSS transforms
    scaling: 5,
    // init a quick/dirty 8x8 array to represent our checkerboard; this gets
    // updated by ./game/board.js in batch actions
    occupied: [ [], [], [], [], [], [], [], [] ],
    // based on 100% viewport
    tileSize: function() {
        return 100 / this.get('columns');
    },
    // quick-ref for grabbing the size of a rendered checker; regardless of how
    // many squares in a row, the checker is N% of it
    checkerSize: function() {
        return this.get('tileSize') * 0.75;
    },
    // quick-ref for setting the margins around our checkers ... the size of a
    // tile less the size of the checker itself
    checkerMargin: function() {
        return (this.get('tileSize') - this.get('checkerSize')) / 2;
    },
    // a quick-ref for how many checkers we place in a row base on columns
    checkersPerRow: function() {
        return this.get('columns') / 2;
    },
    // a quick-ref for how many rows of checkers we need to populate; on an 8x8,
    // 10x10, or 12x12 board there are always 2 rows in the middle of the board
    // that have no pieces
    rowsToPopulate: function() {
        return (this.get('columns') / 2) - 1;
    },
};
