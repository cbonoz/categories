const helper = require('./helper');
const categories = require('./categories');

test('testRandomOneElement', () => {
    expect(helper.random([1])).toBe(1);
});

test('testGetCategoryFileName', () => {
    const category = categories.getRandomCategory();
    const catFile = categories.getFileForCategory(category);
    const expected = `./wordlists/${category.replace(" ", "_")}.txt`;
    expect(catFile).toBe(expected)
});

test('testGetHintZeroForCategory', () => {
    const category = categories.getRandomCategory();
    const hint = categories.getHintForCategory(category, 0);
    expect(hint).toBe(`The category has ${category.length} letters.`)
});

test('testGetRandomWordsForCategory', () => {
    const category = categories.getRandomCategory();
    const catWords = categories.getRandomWordsForCategory(category);
    expect(catWords).toHaveLength(3)
});

test('testCategoriesMatchSuccess1', () => {
    const match = categories.getSimilarity("physics", "physics units");
    expect(match >= categories.SIMILARITY_THRESHOLD).toBe(true);
});

test('testCategoriesMatchSuccess2', () => {
    const category = "military navy";
    const match = categories.getSimilarity("military navy", "military");
    expect(match >= categories.SIMILARITY_THRESHOLD).toBe(true);
});

test('testCategoriesMatchFail1', () => {
    const match = categories.getSimilarity("spirits", "alcohol")
    expect(match >= categories.SIMILARITY_THRESHOLD).toBe(false);
});
