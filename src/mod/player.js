/**
 * Base Settings for the Player
 *
 * As with all model components, it's a simple object whose attributes can be
 * explicitly set or calculated on-the-fly. When this is imported into our
 * global "model" construct, 'this' context is automatically provided.
 *
 * Note that derived (function) properties can not be set or watched.
 */
export default {
    // reference to the DOM node checker the player is controlling
    playerChecker: null,
    // the x/y grid position of our player. these are expected to be integers
    // corresponding to squares on the board ... 0-X by 0-Y ... as in a 2D array
    playerX: 0,
    playerY: 0,
    // the number of lives you have ... how many times you can get jumped
    lives: 3,
    // the AI level hostile checkers will use
    aiLevel: 'random',
    // the CSS position of the player based on the X grid position
    playerXPos: function() {
        return this.get('playerX') * this.get('tileSize');
    },
    // corresponding CSS position of the player based on Y grid position
    playerYPos: function() {
        return this.get('playerY') * this.get('tileSize');
    },
};
