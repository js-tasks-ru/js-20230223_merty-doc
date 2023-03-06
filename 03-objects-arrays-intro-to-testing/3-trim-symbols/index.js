/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string = '', size) {
    if (size === 0) return '';
    if (!size) return string;

    const arr = string.split('');
    const obj = {};

    return arr.reduce((accumulator, currentValue) => {
        if (accumulator.at(-1) !== currentValue) {
            obj[currentValue] = 1;
            return accumulator + currentValue;
        }

        if (obj[currentValue] !== size) {
            obj[currentValue] += 1;
            return accumulator + currentValue;
        }

        return accumulator;
    }, '');
}
