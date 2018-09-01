/**
 * This file contains utility functions to help build out the page using micro fronend architecture.
 */
const globalScripts = ['http://localhost:9000/vendor/polyfills.js', 'http://localhost:9000/vendor/vendor.js'];
const globalStyles = ['http://localhost:9000/vendor/vendor.css'];

//load links with rel= Preload for H2 server push
function createLinks(dom, src, id, defer) {
  console.log(`src in createLinks ${src}`);
  const linkTag = dom.window.document.createElement('link');
  linkTag.href = src;
  linkTag.rel = 'preload';

  if (id) {
    styleTag.id = id;
  }
  return styleTag;
}

function insertScript(dom, src, id, defer) {
  const scriptTag = dom.window.document.createElement('script');
  if (typeof src === 'string') {
    scriptTag.src = src;
  } else {
    scriptTag.textContent = `var ${id} = ${JSON.stringify(src)};`;
  }
  if (id) {
    scriptTag.id = id;
  }
  if (defer) {
    scriptTag.setAttribute('async', true);
  }
  return scriptTag;
}

function insertStyle(dom, src, id, defer) {
  const styleTag = dom.window.document.createElement('link');
  styleTag.href = src;
  styleTag.rel = 'stylesheet';

  if (id) {
    styleTag.id = id;
  }
  return styleTag;
}

module.exports = {
  globalScripts,
  insertScript,
  globalStyles,
  insertStyle
};
