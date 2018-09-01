/**
 * Function to get all the webpack configuration rules for a component
 */

const path = require('path');

function getMicroAppWebpackRules({ ExtractTextPlugin }) {
  return [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'eslint-loader'
    },
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: 'babel-loader'
    },
    {
      test: /\.css$/i,
      include: [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../node_modules/bulma')],
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      })
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: ['file-loader']
    }
  ];
}
/**
 * Function to get all the webpack configuration rules for vendor files
 */
function getVendorWebpackRules(pluginsObj) {
  return getMicroAppWebpackRules(pluginsObj);
}

module.exports = {
  getMicroAppWebpackRules,
  getVendorWebpackRules
};
