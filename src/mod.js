let watchers = {};
let mod = {};

// a convenience method for checking if a given param is a function
function isFunction(f) {
    return typeof f === 'function';
}

// a convenience method for checking if a given model property is derived
function isDerived(prop) {
    return isFunction(mod[prop]);
}

export default {

    // this method takes N properties and returns an object of key/value pairs.
    // goes without saying here, but we use anonymous functions instead of
    // arrow functions because of the aguments handling.
    get: function(/* arguments */) {
        let props = Array.from(arguments);
        let requested = {};

        // a little wrapper for handling both explicit and derived values; it'll
        // simply return an explicitly set value or execute a function to return
        // the derived value
        let handleValue = (val) => {
            return (isFunction(val)) ? val.bind(this)() : val;
        };

        if (props.length === 1) {
            let val = mod[props[0]];
            return handleValue(val);
        }

        props.map((prop) => {
            let val = mod[prop];
            requested[prop] = handleValue(val);
        });

        return requested;
    },

    // this method takes an object of key/val pairs and updates our model. it'll
    // trigger any watchers of the values. if the second param is passed as true
    // we'll do a stealth update and not trigger any watchers
    set: (data, isSilent=false) => {
        let props = Object.keys(data);
        let actionsToTake = [];

        props.map((prop) => {
            if (isDerived(prop)) {
                console.warn(
                    `'${prop}' is a derived property and can not be explicitly set.`
                );

            } else {
                // no change, no op
                if (mod[prop] === data[prop]) {
                    return mod[prop];
                }

                mod[prop] = data[prop];

                if (watchers[prop] && (isSilent === false)) {
                    let actions = watchers[prop].map((action) => ({
                        action: action,
                        value: data[prop],
                    }));

                    actionsToTake = actionsToTake.concat(actions);
                }
            }
        });

        // execute our actions after all updates have been applied
        actionsToTake.map((a) => a.action(a.value));
    },

    watch: (prop, action) => {
        if (isDerived(prop)) {
            console.warn(
                `'${prop}' is a derived property and can not be watched.`
            );
            return;
        }

        if (!watchers[prop]) {
            watchers[prop] = [];
        }

        watchers[prop].push(action);
    },
};
