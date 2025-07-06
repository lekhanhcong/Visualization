/**
 * CSS Transform for Jest
 * Transforms CSS imports to empty objects for testing
 */

module.exports = {
  process() {
    return {
      code: 'module.exports = {};'
    }
  },
  getCacheKey() {
    return 'css-transform'
  }
}