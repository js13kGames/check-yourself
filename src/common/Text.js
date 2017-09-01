/**
 * A constructor class for creating text blocks.
 *
 */
import View from './View';

import './Text.css';

class Text extends View {
    constructor(options) {
        let {text, variant, ...textOptions} = options;

        // we'll treat all text as paragraphs; styling and variants on text are
        // handled by CSS
        super(Object.assign(textOptions, {
            nodeName: 'p'
        }));

        if (text) { this.print(text); }
        if (variant) { this.classify(`+${variant}Text`); }
    }

    print(text) {
        this.el.innerText = text;
    }
}

export default Text;
