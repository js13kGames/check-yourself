import mod from '../../mod';

//
//
function getFocusOffset(tileNumber, defaultOffset, tileSize) {
    return defaultOffset - (tileNumber * tileSize);
}

mod.set({
    // the current camera position ... corresponds to the camWhatever values
    // detailed below
    cameraPosition: '',
    // the x and y grid positions the camera is focused on
    focusX: 0,
    focusY: 0,
    // a view that displays the front-row of allied checkers; this isn't a
    // selectable view but is used when the game starts for choosing the
    // checker you wanna control
    camSelectable: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');
        let halfCols = this.get('boardCols') / 2;
        let focusY = halfCols + 1;
        let yOffset = (halfCols - 1) * tileSize;

        return Object.assign({}, defaults, {
            perspective: mod.get('boardScale'),
            rotateX: 30,
            moveX: 0,
            moveY: getFocusOffset(focusY, yOffset, tileSize),
            scaleX: 0.54,
            scaleY: 0.54,
        });
    },
    // settings for our default camera perspective; additional camera positions
    // are derived from here
    camDefault: function() {
        let tileSize = this.get('tileSize');
        let halfCols = this.get('boardCols') / 2;

        // the offset x/y for a centered 0-0 square; based on the number of tiles
        // and tile size and used in moving the camera proportionally
        let xOffset = halfCols * tileSize - (tileSize / 2);
        let yOffset = halfCols * tileSize;

        return {
            perspective: 100,
            rotateX: 60,
            rotateZ: 0,
            moveX: getFocusOffset(this.get('focusX'), xOffset, tileSize),
            moveY: getFocusOffset(this.get('focusY'), yOffset, tileSize),
            moveZ: 0,
            scaleX: 1.5,
            scaleY: 1.5,
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
            moveY: defaults.moveY - tileSize,
        });
    },
    camRight: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');

        return Object.assign({}, defaults, {
            rotateX: 55,
            rotateZ: -35,
            moveX: defaults.moveX - tileSize,
            moveY: defaults.moveY - tileSize,
        });
    },
    camUp: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');

        return Object.assign({}, defaults, {
            rotateX: 40,
            moveY: defaults.moveY - (tileSize * 2),
            scaleX: 1.5,
            scaleY: 1.5,
        });
    },
    camOverview: function() {
        let defaults = this.get('camSelectable');
        let tileSize = this.get('tileSize');

        return Object.assign({}, defaults, {
            rotateX: 50,
            rotateZ: -5,
        });
    },
    camOverviewSpin: function() {
        let defaults = this.get('camOverview');
        return Object.assign({}, defaults, {
            rotateZ: -60,
        });
    }
}, true);
