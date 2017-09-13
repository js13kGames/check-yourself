import El from '../../common/El';
import mod from '../../mod';

import './cameraConfig';
import './cameraControls.css';

let cameraOptions = [
    { id: 'camRight'},
    { id: 'camDefault'},
    { id: 'camLeft'},
    { id: 'camUp'},
    { id: 'camDown'}
];

//
//
function handleSelection(e) {
    let position = e.target.id;
    mod.set({
        cameraPosition: position,
        playerCameraPosition: position,
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
