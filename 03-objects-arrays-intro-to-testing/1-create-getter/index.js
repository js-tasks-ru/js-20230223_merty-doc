/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const arr = path.split('.');

    return function(obj) {
        let value;

        if (!Object.entries(obj).length) return undefined;

        arr.forEach(item => {
            if (obj[item]) {
                value = obj[item];
            } else if (value[item]) {
                value = value[item];
            } else {
                value = undefined;
            }
        });

        return value;
    }
}
