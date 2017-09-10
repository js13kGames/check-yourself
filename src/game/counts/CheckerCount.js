import El from '../../common/El';
import mod from '../../mod';

function createEl(text) {
    let el = new El();
    el.text(text);
    return el;
}

class CheckerCount extends El {
    constructor(toWatch, label) {
        super();

        this.watching = toWatch;
        this.count = createEl(mod.get(toWatch).length);
        this.count.classify('+checkerCount');

        this.label = createEl(label);
        this.label.classify('+checkerCountLabel');

        this.kids(
            this.count.el,
            this.label.el
        );

        this.classify('+checkerCountWrapper');
        mod.watch('checkers', this.update.bind(this));
    }

    update() {
        this.count.el.innerText = mod.get(this.watching).length;
    }
}

export default CheckerCount;
