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
        let {camDefault, tileSize, boardCols, boardScale} = this.get(
            'camDefault',
            'tileSize',
            'boardCols',
            'boardScale'
        );
        let halfCols = boardCols / 2;
        let focusY = halfCols + 1;
        let yOffset = (halfCols - 1) * tileSize;

        return Object.assign({}, camDefault, {
            perspective: boardScale,
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
        let {tileSize, boardCols, focusX, focusY} = this.get(
            'tileSize',
            'boardCols',
            'focusX',
            'focusY'
        );
        let halfCols = boardCols / 2;

        // the offset x/y for a centered 0-0 square; based on the number of tiles
        // and tile size and used in moving the camera proportionally
        let xOffset = halfCols * tileSize - (tileSize / 2);
        let yOffset = halfCols * tileSize - (tileSize * 0.666);

        return {
            perspective: 100,
            rotateX: 40,
            rotateZ: 0,
            moveX: getFocusOffset(focusX, xOffset, tileSize),
            moveY: getFocusOffset(focusY, yOffset, tileSize),
            moveZ: 0,
            scaleX: 1.4,
            scaleY: 1.4,
            scaleZ: 1,
        };
    },
    camDown: function() {
        let {camDefault, tileSize} = this.get('camDefault', 'tileSize');

        return Object.assign({}, camDefault, {
            rotateX: 20,
            moveY: camDefault.moveY - (tileSize * 2.5),
            scaleX: 1.25,
            scaleY: 1.25,
        });
    },
    camLeft: function() {
        let {camDefault, tileSize} = this.get('camDefault', 'tileSize');

        return Object.assign({}, camDefault, {
            rotateX: 55,
            rotateZ: -35,
            moveX: camDefault.moveX - tileSize,
            moveY: camDefault.moveY - tileSize,
        });
    },
    camRight: function() {
        let {camDefault, tileSize} = this.get('camDefault', 'tileSize');

        return Object.assign({}, camDefault, {
            rotateX: 55,
            rotateZ: 35,
            moveX: camDefault.moveX + tileSize,
            moveY: camDefault.moveY - tileSize,
        });
    },
    camUp: function() {
        let {camDefault, tileSize, boardCols, focusY} = this.get(
            'camDefault',
            'tileSize',
            'boardCols',
            'focusY'
        );

        let halfCols = boardCols / 2;
        let yOffset = halfCols * (tileSize * 1.25);

        return Object.assign({}, camDefault, {
            rotateX: 60,
            moveY: getFocusOffset(focusY, yOffset, tileSize),
            scaleX: 1.5,
            scaleY: 1.5,
        });
    },
    camOverview: function() {
        let defaults = this.get('camSelectable');

        return Object.assign({}, defaults, {
            rotateX: 50,
            rotateZ: -5,
        });
    },
}, true);
