import Text from '../common/Text';
import mod from '../mod';

let notice = new Text({
    id: 'notice',
});

//
//
//
function handleNotice(text) {
    if (!text) {
        return;
    }

    notice.print(text);
}

mod.watch('notice', handleNotice);

export default notice;
