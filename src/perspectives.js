/**
 * Base Settings Defining the Camera/Perspective
 *
 * As with all model components, it's a simple object whose attributes can be
 * explicitly set or calculated on-the-fly. When this is imported into our
 * global model construct, 'this' context is automatically provided.
 *
 * Note that derived (function) properties can not be set or watched.
 */

//
//
//
function getFocusOffset(tileNumber, defaultOffset, tileSize) {
    return defaultOffset - (tileNumber * tileSize);
}

export default {
    // the current camera perspective
    perspective: 'camDefault',
    // the x and y grid positions the camera is focused on
    focusX: 0,
    focusY: 0,
    // a view that displays the front-row of allied checkers; this isn't a
    // selectable view but is used when the game starts for choosing the
    // checker you wanna control
    camSelectable: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');
        let halfCols = this.get('halfCols');
        let focusY = halfCols + 3;
        let yOffset = (halfCols - 1) * tileSize;

        return Object.assign({}, defaults, {
            rotateX: 45,
            moveX: 0,
            moveY: getFocusOffset(focusY, yOffset, tileSize),
            scaleX: 1,
            scaleY: 1,
        });
    },
    // settings for our default camera perspective; additional camera positions
    // are derived from here
    camDefault: function() {
        let tileSize = this.get('tileSize');
        let scaling = this.get('scaling');
        let halfCols = this.get('halfCols');

        // the offset x/y for a centered 0-0 square; based on the number of tiles
        // and tile size and used in moving the camera proportionally
        let xOffset = halfCols * tileSize - (tileSize / 2);
        let yOffset = (halfCols - 1) * tileSize;

        return {
            perspective: 100,
            rotateX: 60,
            rotateZ: 0,
            moveX: getFocusOffset(this.get('focusX'), xOffset, tileSize),
            moveY: getFocusOffset(this.get('focusY'), yOffset, tileSize),
            moveZ: 0,
            scaleX: scaling,
            scaleY: scaling,
            scaleZ: 1,
        };
    },
    camLeft: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');

        return Object.assign({}, defaults, {
            rotateX: 55,
            rotateZ: 35,
            moveX: defaults.moveX + tileSize,
            moveY: defaults.moveY + (tileSize / 2),
        });
    },
    camRight: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');

        return Object.assign({}, defaults, {
            rotateX: 55,
            rotateZ: -35,
            moveX: defaults.moveX - tileSize,
            moveY: defaults.moveY + (tileSize / 2),
        });
    },
    camUp: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');
        let scaling = this.get('scaling');

        return Object.assign({}, defaults, {
            rotateX: 40,
            moveY: defaults.moveY - (tileSize * 2),
            scaleX: scaling * 0.5,
            scaleY: scaling * 0.5,
        });
    },
};
