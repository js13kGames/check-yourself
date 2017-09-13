import ClickHandler from './ClickHandler';

/**
 * A class for creating DOM elements with a unified API for managing class
 * names, attributes, and other goodies. Every visual thing in the game is an
 * El instance.
 */
class El {
    constructor(nodeName='div') {
        this.el = document.createElement(nodeName);
        return this;
    }

    destructor() {
        this.el.parentNode.removeChild(this.el);
    }

    // a method for interacting with our element's className object to add (+),
    // remove (-), or toggle (~) classes
    classify(classOperators) {
        if (classOperators) {
            classOperators.split(' ').map((classNameOp) => {
                let op = classNameOp.charAt(0);
                let className = classNameOp.substr(1, classNameOp.length);

                if (op === '-') {
                    this.el.classList.remove(className);
                } else if (op === '~') {
                    this.el.classList.toggle(className);
                } else if (op === '+'){
                    this.el.classList.add(className);

                // handle everything else as an add of the whole className without
                // filtering the operator.
                } else {
                    this.el.classList.add(classNameOp);
                }
            });
        }

        return this;
    }

    // a method for attributing attributes (redundant?) to the View element; the
    // method name is the verb form ... uh-TRIB-yoot.
    attribute(attributes) {
        let attributeNames = Object.keys(attributes);

        attributeNames.map((name) => {
            this.el[name] = attributes[name];
        });

        return this;
    }

    // a method for appending child nodes; it takes an argument list of N nodes
    // or a single array of nodes
    kids(/* arguments */) {
        let children = Array.from(arguments);

        if ((children.length === 1) && (children[0].length)) {
            children = children[0];
        }

        children.map((child) => {
            this.el.appendChild(child);
        });

        return this;
    }

    // a method for clearing all contents within the element
    gut() {
        while (this.el.lastChild) {
            this.el.removeChild(this.el.lastChild);
        }

        return this;
    }

    // a method for passing style properties to an element; it expects an
    // object of CSS properties (in their JS form) and values
    style(styleObj) {
        let styleNames = Object.keys(styleObj);
        styleNames.map((style) => {
            this.el.style[style] = styleObj[style];
        });

        return this;
    }

    // a method for injecting text into an element instance; it uses innerText
    // and markedly does not support innerHTML ... use .kids() for that.
    text(string) {
        this.el.innerText = string;
        return this;
    }

    // a method to bind click events to our instance's click handler; it's
    // simply a pass-through, so it matches the ClickHandler's API and attaches
    // a single action to a selector
    onClick(selector, action) {

        // activate a new click handler when a click action is assigned
        if (!this.clickHandler) {
            this.clickHandler = new ClickHandler(this.el);
        }

        return this.clickHandler.onClick(selector, action);
    }

    // a method for setting actions after a transition occurs
    onTrans(callback) {
        let onComplete = ({target}) => {
            let isEqual = target.isEqualNode(this.el);
            let isMidTransition = target.classList.contains('transitioning');

            if (isEqual && !isMidTransition) {
                this.el.removeEventListener('transitionend', onComplete);
                callback();
            }
        };

        this.el.addEventListener('transitionend', onComplete);
    }

    // the sister method to the above, for animations instead of transitions. we
    // use both for various effects and subscribe to them separately
    onAnim(callback) {
        let onComplete = ({target}) => {
            if (target.isEqualNode(this.el)) {
                this.el.removeEventListener('animationend', onComplete);
                callback();
            }
        };

        this.el.addEventListener('animationend', onComplete);
    }
}

export default El;
