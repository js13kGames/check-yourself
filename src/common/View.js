import El from './El';
import ClickHandler from './ClickHandler';

import './View.css';

class View extends El {
    constructor(options={}) {
        let {nodeName, ...attrs} = options;

        nodeName = nodeName || 'div';
        super(nodeName);

        this.attribute(attrs);
        this.classify('+view');
    }

    destructor() {
        this.el.parentNode.removeChild(this.el);
    }

    // a method to bind click events to our View instance's click handler; it's
    // simply a pass-through, so it matches the ClickHandler's API and attaches
    // a single action to a selector
    onClick(selector, action) {

        // activate a new click handler when a click action is assigned
        if (!this.clickHandler) {
            this.clickHandler = new ClickHandler(this.el);
        }

        return this.clickHandler.onClick(selector, action);
    }

    fadeIn(onComplete) {
        let handleTransitionEnd = (e) => {
            // only react to a transitionend on the view element
            if (e.target.isEqualNode(this.el) === false) {
                return;
            }

            this.el.removeEventListener('transitionend', handleTransitionEnd);
            this.classify('-fadeIn -fadeInStart');

            if (onComplete) {
                onComplete();
            }
        };

        this.el.addEventListener('transitionend', handleTransitionEnd);
        this.classify('+fadeInStart');
        setTimeout(() => this.classify('+fadeIn'), 10);

        // return the element so we can .appendChild() the result of this func
        return this.el;
    }

    // a fancy way of removing a view element; it'll fade out and then self-
    // destruct. we can pass a callback that'll trigger when the animation is
    // complete
    fadeOut(onComplete) {
        let handleTransitionEnd = (e) => {
            if (e.target.isEqualNode(this.el) === false) {
                return;
            }

            this.el.removeEventListener('transitionend', handleTransitionEnd);
            this.classify('-fadeOut');
            this.destructor();

            if (onComplete) {
                onComplete();
            }
        };

        this.el.addEventListener('transitionend', handleTransitionEnd);
        this.classify('+fadeOut');
    }
}

export default View;
