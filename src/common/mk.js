import El from './El';

export default (nodeName, props={}) => {
    if (!nodeName) {
        console.warn(
            `Can not make an element without a nodeName; ${nodeName} given.`
        );

        return;
    }

    let {className, ...attrs} = props;
    let instance = new El(nodeName);

    instance.classify(className);
    instance.attribute(attrs);

    return instance;
};
