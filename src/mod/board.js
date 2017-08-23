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
    // square so we don't specify a "rows" property
    columns: 8,
    // our screen scaling; the viewport is calculated on a 100% width window and
    // we scale-up our assets by this much
    scaling: function() {
        return this.get('columns') * 0.625;
    },
    // the "effective" size of a tile ... the base tile size * scaling
    scaledTileSize: function() {
        return this.get('tileSize') * this.get('scaling');
    },
    // calculate the size of a single square based on the number of columns;
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
    // calculate how many checkers are on a team based on the number of squares
    teamOf: function() {
        return this.get('checkersPerRow') * this.get('rowsToPopulate');
    },
};
