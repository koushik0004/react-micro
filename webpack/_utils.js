// require('./_cli');
const rules = require('./_rules');
const plugins = require('./_plugins');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
// const axios = require('axios');
const glob = require('glob');
const Table = require('cli-table');
const del = require('del');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const _ = require('lodash');
const NAMESPACE = 'RM';
const baseURL = 'http://localhost:9000';
const pluginsObj = {
  ExtractTextPlugin,
  CleanWebpackPlugin,
  UglifyJsPlugin
};

/**
 * Function to delete files and folders
 * @param {Array|String} globs Glob patterns to delete
 */
function cleanUp(globs) {
  return del(globs, {
    force: true
  });
}

/**
 * Function to output the micro app information gathered in tabular format
 */
function outputmicroAppData(configs) {
  const table = new Table({
    head: ['Micro App File', 'Micro App Name', 'Version'],
    style: {
      head: ['yellow'],
      border: ['yellow']
    }
  });
  configs.forEach(config => {
    table.push([config.microAppFile, config.microAppName, config.microAppVersion]);
  });
  if (configs.length) {
    // Output the tabular data
    console.log(chalk.blueBright('Info: Awaiting app builds for:'));
    console.log(table.toString());
  } else {
    console.log(chalk.red(`(\u2718) No micro apps to be built!`));
  }
}

function createMicroAppRegistryTable(data, color = 'yellow') {
  const table = new Table({
    head: ['Micro App Name', 'Micro App version'],
    style: {
      head: [color],
      border: [color]
    }
  });
  _.each(data, d => {
    if (d.microAppVersion && d.microAppName) {
      table.push([d.microAppName, d.microAppVersion]);
    }
  });
  console.log(table.toString());
}
/**
 * function to provide configuration for minification/minimizer
 */
function getMinimizerConfig() {
  return global.RM_PROD
    ? [
        new UglifyJsPlugin({
          uglifyOptions: {
            parse: {
              html5_comments: false
            },
            comments: false,
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: true
            }
          },
          extractComments: true
        })
      ]
    : [];
}

/**
 * Function to retrieve the public path of the apps used for chunking and apps specific assets

 */
function getMicroAppPublicPath(microAppName, version) {
  return `${baseURL}/micro-apps/${microAppName}/${version}/`;
}

/**
 * Function to retrieve the public path of the vendor used for chunking and apps specific assets
 */
function getVendorPublicPath() {
  return `${baseURL}/vendor/`;
}
/**
 * Function to create the micro app configs used by webpack for apps builds
 */
function createMicroAppConfigs(root, globString, apps = false) {
  return new Promise(function(resolve, reject) {
    const configs = [];
    const microAppRegistry = global.RM_APP_REGISTRY;
    let buildComps = [];
    if (global.RM_APP) {
      buildComps = global.RM_APP.split(',').map(comp => {
        return comp.trim();
      });
    }
    glob(globString, (err, files) => {
      if (err) {
        reject(err);
        throw new Error(err);
      }
      files.forEach(file => {
        const dirname = path.dirname(file);
        const microAppFile = path.basename(file);
        const microAppName = path.basename(dirname);

        if (buildComps.length) {
          if (_.indexOf(buildComps, microAppName) < 0) {
            return;
          }
        }
        // Get the package version of the apps
        const pkg = JSON.parse(fs.readFileSync(path.join(dirname, 'package.json'), 'utf8'));
        if (microAppRegistry && microAppRegistry.length) {
          // Get registry entry for the apps
          const registryEntry = _.find(microAppRegistry, function(r) {
            return r.microAppName === microAppName;
          });

          if (registryEntry) {
            const registryVersion = registryEntry.microAppVersion;
            if (compareVersions(pkg.version, registryVersion) !== 1) {
              return;
            }
          }
        }
        const microAppData = {
          root,
          dirname,
          microAppFile,
          microAppName,
          microAppVersion: pkg.version,
          isApp: apps //To be put here once node caching strategy is in place
        };
        let webpackConfig = {
          ...microAppData,
          webpack: {
            mode: global.RM_PROD ? 'production' : 'development',
            devtool: global.RM_SOURCEMAP && 'source-map',
            entry: file,
            output: {
              filename: `${microAppFile}`,
              publicPath: getMicroAppPublicPath(microAppName, pkg.version),
              path: path.resolve(root, 'dist', 'micro-apps', microAppName, pkg.version),
              library: [NAMESPACE, microAppName],
              libraryTarget: 'umd',
              globalObject: 'this'
            },
            module: {
              rules: rules.getMicroAppWebpackRules(pluginsObj)
            },
            externals: require('./_externals')(),
            optimization: {
              minimizer: getMinimizerConfig()
            },
            plugins: plugins.getMicroAppWebpackPlugins(pluginsObj, microAppData)
          }
        };
        configs.push(webpackConfig);
      });
      outputmicroAppData(configs);
      resolve(configs);
    });
  });
}
/**
 * Function to create the vendor configs used by webpack for vendor,polyfill file builds
 * @param {String} root The directory root of the application
 */
function createVendorConfigs(root) {
  return new Promise(resolve => {
    const createVendorConfigs = {
      webpack: {
        mode: global.RM_PROD ? 'production' : 'development',
        devtool: global.RM_SOURCEMAP && 'source-map',
        entry: {
          vendor: path.resolve(root, 'src/client/vendor/vendor.js'),
          polyfills: path.resolve(root, 'src/client/vendor/polyfills.js')
        },
        output: {
          filename: `[name].js`,
          path: path.resolve(root, 'dist', 'vendor'),
          libraryTarget: 'umd',
          publicPath: getVendorPublicPath()
        },
        module: {
          rules: rules.getVendorWebpackRules(pluginsObj)
        },
        optimization: {
          minimizer: global.RM_PROD
            ? [
                new UglifyJsPlugin({
                  uglifyOptions: {
                    parse: {
                      html5_comments: false
                    },
                    comments: false,
                    compress: {
                      warnings: false,
                      drop_debugger: true
                      // pure_funcs: ['console.log', 'console.info', 'console.warn']
                    }
                  },
                  extractComments: true
                })
              ]
            : []
        },
        plugins: plugins.getVendorWebpackPlugins(pluginsObj)
      }
    };
    resolve([createVendorConfigs]);
  });
}

/**
 * Function to get the components and versions from the Component registry
 * This would return all the latest versions of the components registered in the regirstry
 */
async function getMicroAppVersions() {
  const compRegistryAPI = global.RM_COMPREGISTRY_URL;
  return fetch(compRegistryAPI)
    .then(res => {
      if (res.data && res.data.length) {
        console.log(chalk.green('Component Registry Data:'));
        createMicroAppRegistryTable(res.data);
      } else {
        console.log(chalk.red(`(\u2718) No components found in registry!`));
      }
      return res.data;
    })
    .catch(err => {
      console.log(chalk.red('Component Registry Error -'));
      console.log(chalk.red(`(\u2718) ${err.toString()}`));
      return { err };
    });
}

/**
 * Function to set lastest versions of micro app in the micro app registry

 */
async function setMicroAppVersions(data) {
  const compRegistryAPI = global.RM_COMPREGISTRY_URL;
  return fetch(compRegistryAPI, data)
    .then(res => {
      console.log(chalk.green('Updated Component Registry Data:'));
      createMicroAppRegistryTable(res.data, 'green');
      return res.data;
    })
    .catch(err => {
      console.log(chalk.red('Component Registry Error -'));
      console.log(chalk.red(`(\u2718) ${err.toString()}`));
      return { err };
    });
}

/**
 * Function to create an async webpack compiler instance and run it
 * @param {Object} config The webpack condig object for the component or file
 * @param {Object} [options] The component config object
 */
function createWebpackInstance(config, options = {}) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);
    const compilerCb = async (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details.toString());
        }
        reject({
          err,
          options
        });
        throw new Error(err);
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors.toString());
        reject({
          err: new Error(`${config.microAppName} build resulted in errors!`),
          options
        });
        throw new Error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings.toString());
      }
      resolve({
        stats,
        options
      });
    };
    if (global.RM_WATCH) {
      compiler.watch({}, compilerCb);
    } else {
      compiler.run(compilerCb);
    }
  });
}

module.exports = {
  cleanUp,
  setMicroAppVersions,
  getMicroAppVersions,
  createMicroAppConfigs,
  createVendorConfigs,
  createWebpackInstance
};
