import El from '../../common/El';
import mod from '../../mod';
import './status.css';

let status = new El('p').attribute({ id: 'status' });

//
//
function update(statusText) {
    if (!statusText) {
        status.onTrans(() => status.el.innerText = '');
        status.classify('-show');
        return;
    }

    status.text(statusText);
    status.classify('+show');
}

mod.watch('status', update);
export default status;
