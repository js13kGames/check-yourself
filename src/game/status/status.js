import El from '../../common/El';
import mod from '../../mod';
import './status.css';

let status = new El('p').attribute({ id: 'status' });

//
//
function update(statusText) {
    if (!statusText) {
        status.onTrans(() => status.text(''));
        status.classify('-show');
        return;
    }

    if (status.el.innerText !== '') {
        status.onTrans(() => {
            status.text(statusText);
            setTimeout(() => status.classify('-fadeText'), 10);
        });
        status.classify('+fadeText');
        return;
    }

    status.text(statusText);
    status.classify('+show');
}

mod.watch('status', update);
export default status;
