import Menu from '../common/Menu';
import mod from '../mod';

import './cameraControls.css';

let cameraOptions = [
    { id: 'camRight', innerHTML: '&laquo;' },
    { id: 'camDefault', innerHTML: '&laquo;' },
    { id: 'camLeft', innerHTML: '&raquo;' },
    { id: 'camUp', innerHTML: '&laquo;' }
];

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

mod.watch('playerX', (x) => {
    mod.set({
        focusX: x,
        focusY: mod.get('playerY')
    });
});

export default cameraControls;
