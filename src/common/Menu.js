import mk from './mk';
import View from './View';
import ClickHandler from './ClickHandler';

import './Menu.css';

//
//
//
function handleSelection(e) {
    let active = this.el.querySelector('.active');

    if (active) {
        active.classList.remove('active');
    }

    e.target.classList.add('active');

    if (this.onSelect) {
        this.onSelect(e);
    }
}

class Menu extends View {
    constructor(props) {
        let {options, className, onSelect, ...theRest} = props;

        className = (className) ? className + ' menu' : 'menu';
        theRest.className = className;

        // we could intercept the props here and make Menu instances render
        // as <ul> or <menu> (limited support) for semantics, but <div> wrappers
        // are fine for now
        super(theRest);

        // this holds a reference to our option instances (Els)
        this.menuOptions = [];

        if (options) {
            this.renderOptions(options);
        }

        this.onSelect = onSelect;
        this.onClick('.menuOption', handleSelection.bind(this));
    }

    // as its clever name suggests, this method renders the given menu options
    renderOptions(options) {
        this.gut();

        options.map((opts) => {
            let {active, ...theRest} = opts;
            let rendered = mk('a', theRest);

            rendered.classify('+menuOption');
            if (active) {
                rendered.classify('+active');
            }

            this.menuOptions.push(rendered);
            this.kids(rendered.el);
        });
    }
}

export default Menu;
