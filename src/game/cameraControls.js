import Menu from '../common/Menu';
import mod from '../mod';

import './cameraControls.css';

mod.set({
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
        let halfCols = this.get('columns') / 2;
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
        let halfCols = this.get('columns') / 2;

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
    camOverview: function() {
        let defaults = this.get('camDefault');
        let tileSize = this.get('tileSize');
        let scaling = this.get('scaling');

        return Object.assign({}, defaults, {
            rotateX: 55,
            moveY: defaults.moveY - (tileSize),
            scaleX: scaling * 0.7,
            scaleY: scaling * 0.7,
        });
    },
}, true);

let cameraOptions = [
    { id: 'camRight', innerHTML: '&laquo;' },
    { id: 'camDefault', innerHTML: '&laquo;' },
    { id: 'camLeft', innerHTML: '&raquo;' },
    { id: 'camUp', innerHTML: '&laquo;' }
];

//
//
//
function getFocusOffset(tileNumber, defaultOffset, tileSize) {
    return defaultOffset - (tileNumber * tileSize);
}

//
//
//
function handleSelection(e) {
    mod.set({
        perspective: e.target.id
    });
}

let cameraControls = new Menu({
    id: 'cameraControls',
    options: cameraOptions,
    onSelect: handleSelection,
});

export default cameraControls;
