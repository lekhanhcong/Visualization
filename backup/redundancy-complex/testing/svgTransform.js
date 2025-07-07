/**
 * SVG Transform for Jest
 * Transforms SVG imports to React components for testing
 */

const path = require('path')

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename))
    
    if (filename.match(/\.svg$/)) {
      return {
        code: `
          const React = require('react');
          module.exports = React.forwardRef(function SvgMock(props, ref) {
            return React.createElement('svg', {
              ...props,
              ref,
              'data-testid': props['data-testid'] || 'svg-mock',
              'data-filename': ${assetFilename}
            });
          });
        `
      }
    }
    
    return {
      code: `module.exports = ${assetFilename};`
    }
  },
  getCacheKey() {
    return 'svg-transform'
  }
}