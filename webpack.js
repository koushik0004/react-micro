/**
 * Webpack Build file using webpack API.
 */
// Import Utils options
const utils = require('./webpack/_utils');
const chalk = require('chalk');
const _ = require('lodash');
const fse = require('fs-extra');

const UNCAUGHT_EXIT_CODE = 15;
const UNHANDLED_EXIT_CODE = 16;
const HANDLED_EXIT_CODE = 17;
if (global.RM_PROD) {
  // add exit listener to abort the build process if there is error
  process.on('exit', code => {
    if (code === 0) {
    }
    if (code !== 0) {
      process.abort();
    }
  });
  // exit the process if uncaught
  process.on('uncaughtException', err => {
    process.exit(UNCAUGHT_EXIT_CODE);
  });
  // exit the process if unhandled rejection
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    process.exit(UNHANDLED_EXIT_CODE);
  });
}

async function webpackBuild() {
  const timerLabel = chalk.green(`Webpack Build`);
  console.time(timerLabel);
  // Get registry information if you want to compare builds
  if (global.RM_REGISTRY) {
    console.log(chalk.blueBright('Info: Awaiting latest micro app Registry data!'));
    global.RM_APP_REGISTRY = await utils.getMicroAppVersions();
    global.RM_SET_APP_REGISTRY = true;
    if (global.RM_APP_REGISTRY.err) {
      return;
    }
  }
  // Webpack configs for micro app as well as vendor files
  const webpackConfigs = [];
  let microAppConfigs = [];
  let vendorConfigs = [];

  // Get all the micro app configs
  if (!global.RM_VENDORS) {
    microAppConfigs = await utils.createMicroAppConfigs(__dirname, './src/client/micro-apps/**/*.app.js');
  }
  // Get the Vendor configs
  if (!global.RM_APPS) {
    vendorConfigs = await utils.createVendorConfigs(__dirname);
  }
  // create multiple configs instead of multiple instances.
  const mappedWebpackConfigs = [...microAppConfigs, ...vendorConfigs].map(config => config.webpack);
  webpackConfigs.push(utils.createWebpackInstance(mappedWebpackConfigs));

  // Clean up the dist folder
  if (!global.RM_APPS && !global.RM_VENDORS && !global.RM_REGISTRY) {
    await utils.cleanUp(['./dist', './build']);
  }

  // Build all the webpack configs
  await Promise.all(webpackConfigs)
    .then(() => {
      fse.copy('./src/templates', './dist/templates');
    })
    .catch(err => {
      if (global.RM_PROD) {
        process.exit(HANDLED_EXIT_CODE);
      }
    });
}

webpackBuild();
