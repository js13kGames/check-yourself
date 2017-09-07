import mod from '../mod';

export default (actions) => {
    //console.log('To the AI:', actions);

    function takeRandomAction() {
        let random = Math.floor(Math.random() * actions.length);
        return actions[random];
    }

    return takeRandomAction();
};
