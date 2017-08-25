/**
 *
 *
 */
import titleScreen from './views/titleScreen';
import play from './views/play';

import mod from './mod';

import './index.css';

const d = document;
const viewport = d.createElement('main');
viewport.id = 'viewport';

let currentView = titleScreen;

//
function loadView(view) {
    let fadeIn = () => {
        viewport.appendChild(view.fadeIn());
        currentView = view;
    };

    if (currentView) {
        currentView.fadeOut(fadeIn);

    } else {
        fadeIn();
    }
}

// essentially, a light router for determining which top-level view to load
// when mod.view is updated
function changeView(view) {
    switch (view) {
        case 'titleScreen':
            loadView(titleScreen);
            break;

        case 'play':
            loadView(play);
            break;
    }
}

mod.watch('view', changeView);

viewport.appendChild(play.el);
d.body.appendChild(viewport);
