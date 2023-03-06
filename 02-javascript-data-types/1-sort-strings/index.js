/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const sortArr = [ ...arr ];
    const compare = (st1, st2) => {
        return st1.localeCompare(st2, 'ru', { caseFirst: 'upper' });
    };

    sortArr.sort((a, b) => {
        if (param === 'asc') {
            return compare(a, b);
        } else if (param === 'desc') {
            return compare(b, a);
        }
    });

    return sortArr;
}
