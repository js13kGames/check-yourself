import El from '../../common/El';
import mod from '../../mod';

import './cameraConfig';
import './cameraControls.css';

let cameraOptions = [
    { id: 'camRight', innerHTML: '&laquo;' },
    { id: 'camDefault', innerHTML: '&laquo;' },
    { id: 'camLeft', innerHTML: '&raquo;' },
    { id: 'camUp', innerHTML: '&laquo;' }
];

//
//
function handleSelection(e) {
    mod.set({
        cameraPosition: e.target.id
    });
}

//
//
function renderCameraOptions() {
    let controls = cameraOptions.map((option) => {
        let cameraOption = new El('a');
        cameraOption.attribute(option);
        cameraOption.classify('+cameraOption');

        return cameraOption.el;
    });

    return controls;
}

let cameraControls = new El();
cameraControls.attribute({
    id: 'cameraControls',
});
cameraControls.kids(renderCameraOptions());
cameraControls.onClick('.cameraOption', handleSelection);

export default cameraControls;
