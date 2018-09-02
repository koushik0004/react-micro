/**
 * Webpack external data configuration for app files.
 */
module.exports = function() {
  return {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React'
    },
    classnames: {
      amd: 'classnames',
      commonjs: 'classnames',
      commonjs2: 'classnames',
      root: 'classNames'
    },
    'react-dom': {
      amd: 'react-dom',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      root: 'ReactDOM'
    },
    'prop-types': {
      amd: 'prop-types',
      commonjs: 'prop-types',
      commonjs2: 'prop-types',
      root: 'PropTypes'
    }
  };
};
