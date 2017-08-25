/**
 * Our click manager. This binds a single click handler to the given element and
 * delegates actions via the .on binding.
 */

function handleClick(e) {
    e.preventDefault();

    let target = e.target;
    let selectors = Object.keys(this.actions);

    if (!selectors) {
        return;
    }

    // check all selectors for matches (set via .on())
    selectors.map((selector) => {
        if (target.matches(selector)) {
            this.actions[selector].map((action) => action(e));
        }
    });
}

class ClickHandler {
    constructor(wrapperEl) {
        if (!wrapperEl || (typeof wrapperEl !== 'object')) {
            /* eslint-disable */
            console.warn(
                `A wrapperEl must be provded to a click-handler: ${wrapperEl}`
            );
            /* eslint-enable */
            return;
        }

        // the record of active click actions/callbacks
        this.actions = {};

        // set our wrapper-level click listener and ensure context
        wrapperEl.addEventListener('click', handleClick.bind(this));
    }

    onClick(selector, action) {
        if (!this.actions[selector]) {
            this.actions[selector] = [];
        }

        this.actions[selector].push(action);
    }
}

export default ClickHandler;
