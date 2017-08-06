/**
 * Created by cbuonocore on 6/21/17.
 */
'use strict';
const library = (function () {

    const random = (arr) => {
        return arr[Math.round(Math.random() * (arr.length - 1))];
    };

    return {
        random: random,
    };

})();
module.exports = library;

