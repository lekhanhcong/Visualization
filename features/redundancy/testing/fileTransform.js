/**
 * File Transform for Jest
 * Transforms image and static file imports for testing
 */

const path = require('path')

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename))
    
    if (filename.match(/\.(png|jpg|jpeg|gif|webp|avif|ico|bmp)$/)) {
      return {
        code: `module.exports = ${assetFilename};`
      }
    }
    
    return {
      code: `module.exports = ${assetFilename};`
    }
  },
  getCacheKey() {
    return 'file-transform'
  }
}