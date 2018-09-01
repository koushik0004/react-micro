/**
 * Function to get all the webpack configuration plugins for a component
 */
const fs = require('fs');
const path = require('path');

function getMicroAppWebpackPlugins({ ExtractTextPlugin, CleanWebpackPlugin }, { microAppName, microAppVersion }) {
  const microAppPlugins = [
    new CleanWebpackPlugin([`../dist/micro-apps/${microAppName}/${microAppVersion}`], { allowExternal: true }),
    new ExtractTextPlugin(`${microAppName}.component.css`)
  ];
  return microAppPlugins;
}

/**
 * Function to get all the webpack configuration plugins for vendor files
 */
function getVendorWebpackPlugins({ ExtractTextPlugin, CleanWebpackPlugin }) {
  const vendorPlugins = [new CleanWebpackPlugin([`../dist/vendor`], { allowExternal: true }), new ExtractTextPlugin(`[name].css`)];
  return vendorPlugins;
}

module.exports = {
  getMicroAppWebpackPlugins,
  getVendorWebpackPlugins
};
