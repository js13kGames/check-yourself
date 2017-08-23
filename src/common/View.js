import ClickHandler from './ClickHandler';
import mk from './mk';

import './View.css';

class View {
    constructor(options={}) {
        let {nodeName, ...attrs} = options;

        if (!nodeName) {
            nodeName = 'div';
        }

        let instance = mk(nodeName, attrs);
        instance.classify('+view');

        // expose some rendering helpers for the underlying View element (from
        // our El constructor class)
        this.el = instance.el;
        this.classify = instance.classify;
        this.attribute = instance.attribute;
        this.kids = instance.kids;
        this.gut = instance.gut;

        this.clickHandler = new ClickHandler(this.el);
    }

    destructor() {
        this.el.parentNode.removeChild(this.el);
    }

    // a method to bind click events to our View instance's click handler; it's
    // simply a pass-through, so it matches the ClickHandler's API and attaches
    // a single action to a selector
    onClick(selector, action) {
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

    // a method for passing style properties to a View element; it expects an
    // object 
    style(styleObj) {
        let styleNames = Object.keys(styleObj);
        styleNames.map((style) => {
            this.el.style[style] = styleObj[style];
        });
    }
}

export default View;
