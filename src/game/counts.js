import View from '../common/View';
import Text from '../common/Text';
import mk from '../common/mk';
import mod from '../mod';

import './counts.css';

//
//
//
function getCount(team) {
    return mod.get(team).length;
}

let counts = new View({
    id: 'counts',
});

let allyText = new Text({
    className: 'countsText allies',
    text: 'Allies',
});

let hostileText = new Text({
    className: 'countsText hostiles',
    text: 'Hostiles',
});

let allyCount = new Text({
    id: 'allyCount',
    innerText: getCount('allies'),
});

let hostileCount = new Text({
    id: 'hostileCount',
    innerText: getCount('hostiles'),
});

let separator = mk('span', {
    className: 'separator',
});

mod.watch('isTurn', () => {
    allyCount.print(mod.get('allies').length);
    hostileCount.print(mod.get('hostiles').length);
});

counts.kids(
    allyText.el,
    allyCount.el,
    separator.el,
    hostileCount.el,
    hostileText.el
);

export default counts;
