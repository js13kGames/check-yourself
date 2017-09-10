import El from '../../common/El';
import CheckerCount from './CheckerCount';
import './counts.css';

let allyCount = new CheckerCount('allyCheckers', 'Allies');
let hostileCount = new CheckerCount('hostileCheckers', 'Hostiles');
let counts = new El();
counts.attribute({ id: 'counts' });

allyCount.classify('+allies');
hostileCount.classify('+hostiles');

counts.kids(
    allyCount.el,
    hostileCount.el
);

export default counts;
