/**
 * Created by cbuonocore on 6/21/17.
 */
'use strict';
const library = (function () {
    const fs = require('fs');
    const path = require('path');
    const pl = require('pluralize');
    const stringSimilarity = require('string-similarity');
    const helper = require('./helper');

    const CATEGORY_FOLDER = "./wordlists";

    function getFileForCategory(category) {
        return `${CATEGORY_FOLDER}/${category.replace(" ", "_")}.txt`;
    }

    function getRandomCategory() {
        const files = fs.readdirSync(CATEGORY_FOLDER);
        const categoryFile = helper.random(files);
        const category = path.basename(categoryFile, '.txt').replace("_", " "); // return category without extension
        console.log("category", category);
        return category;
    }

    // return 3 random words from the given category.
    function getRandomWordsForCategory(category, numberOfWords) {
        if (numberOfWords === undefined) {
            numberOfWords = 3;
        }

        const categoryFile = getFileForCategory(category);
        if (categoryFile === null) {
            return null;
        }
        const contents = fs.readFileSync(categoryFile, 'utf8');
        const words = contents.split(/\r?\n/);

        const shuffled = words.sort(() => .5 - Math.random()); // random shuffle
        const categoryWords = shuffled.slice(0, numberOfWords); //get sub-array of first n elements AFTER shuffle
        console.log("categoryWords: " + JSON.stringify(categoryWords));
        return categoryWords;
    }

    function getHintForCategory(category, hintNumber) {
        const hints = [
            `The category has ${category.length} letters. `,
            `The category begins with the letter ${category[0]}. `,
            `The category is ${pl('word', category.split(' ').length, true)}.`,
            category.split(' ').length === 1 ?
                `The category ends with the letter ${category[category.length - 1]}. `
                    : `The second word of the category is ${category.split(' ')[1]}. `,
        ];

        if ((hintNumber === undefined || hintNumber >= hints.length)) {
            return helper.random(hints);
        }

        return hints[hintNumber];
    }

    function getSimilarity(category1, category2) {
        const similarity =  stringSimilarity.compareTwoStrings(category1, category2);
        console.log(category1, category2, similarity);
        return similarity;
    }

    return {
        getSimilarity: getSimilarity,
        getFileForCategory: getFileForCategory,
        getHintForCategory: getHintForCategory,
        getRandomCategory: getRandomCategory,
        getRandomWordsForCategory: getRandomWordsForCategory,
        SIMILARITY_THRESHOLD: .75
    };

})();
module.exports = library;

