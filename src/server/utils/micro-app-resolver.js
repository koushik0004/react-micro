/**
 * Used to resolve a micro-app based on the template provided.
 * This would also contain/reference functions to inline critical styles and concatinate JS to reduce server round trips.
 */
const JSON5 = require('json5');
const jsdom = require('jsdom');
const minify = require('html-minifier').minify;
const rp = require('request-promise');
const requireFromString = require('require-from-string');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { JSDOM } = jsdom;
const { globalScripts, insertScript, globalStyles, insertStyle } = require('./utilities');
const _ = require('lodash');
const baseURL = 'http://localhost:9000';

function createInlineScriptDataObject(dom, data, varName) {
  const scriptEl = dom.window.document.createElement('script');
  if (varName) {
    scriptEl.textContent = `var ${varName} = ${JSON.stringify(data)}`;
  } else {
    scriptEl.textContent = data;
  }
  dom.window.document.body.append(scriptEl);
}

async function microAppResolver(inputTemplate) {
  const dom = new JSDOM(inputTemplate);
  let appScriptPromises = [];
  let scriptsDataObject = {};
  let scriptsURLObject = {};
  const baseMicroAppVersion = '0.0.1';
  dom.window.document.body.querySelectorAll('[data-micro-app]').forEach(el => {
    const appName = el.getAttribute('data-micro-app');
    const appId = el.getAttribute('data-micro-appId');
    let microAppData;
    try {
      microAppData = JSON5.parse(el.getAttribute('data-json'));
    } catch (err) {
      microAppData = {};
    }
    scriptsDataObject[appName] = microAppData || {};
    el.removeAttribute('data-json');
    appScriptPromises.push(
      rp(`${baseURL}/micro-apps/${appName}/${baseMicroAppVersion}/${appName}.app.js`)
        .then(body => {
          return { body, appId, appName };
        })
        .catch(err => {
          return { err, appId, appName };
        })
    );
  });

  const propsPromises = await Promise.all(appScriptPromises).then(scripts => {
    let appPropsPromises = [];
    scripts.forEach(microAppScript => {
      if (microAppScript.err) {
        return;
      }

      const microApp = requireFromString(microAppScript.body).default;
      const appId = microAppScript.appId;
      const appName = microAppScript.appName;
      if (!scriptsURLObject[appName]) {
        scriptsURLObject[appName] = `${baseURL}/micro-apps/${appName}/${baseMicroAppVersion}/${appName}.app.js`;
      }

      if (microApp.getInitialProps) {
        appPropsPromises.push(
          microApp.getInitialProps().then(state => {
            scriptsDataObject[appName] = state;
            const el = dom.window.document.querySelector(`[data-micro-appId=${appId}]`);
            el.innerHTML = ReactDOMServer.renderToString(React.createElement(microApp, { store: { ...scriptsDataObject[appName] } }, null));
          })
        );
      } else {
        const el = dom.window.document.querySelector(`[data-micro-appId=${appId}]`);
        el.innerHTML = ReactDOMServer.renderToString(React.createElement(microApp, { store: { ...scriptsDataObject[appName] } }, null));
      }
    });
    return appPropsPromises;
  });

  await Promise.all(propsPromises);

  createInlineScriptDataObject(dom, scriptsDataObject, 'RMData');

  globalScripts.forEach(src => {
    dom.window.document.body.appendChild(insertScript(dom, src, null));
  });

  globalStyles.forEach(src => {
    dom.window.document.head.appendChild(insertStyle(dom, src, null));
  });

  _.forEach(scriptsURLObject, (value, key) => {
    dom.window.document.body.appendChild(insertScript(dom, value, key, true));
  });

  return dom.serialize();
}

module.exports = microAppResolver;
