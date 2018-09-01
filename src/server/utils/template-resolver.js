/**
 * Resolve a template based on the URL provided to the node server.
 */
const rp = require('request-promise');
const microAppResolver = require('./micro-app-resolver');
const baseURL = 'http://localhost:9000';
/**
 * Function to get data from a remote source.
 * @param {string} url The URL from which data needs to be fetched.
 */

async function getData(url) {
  const data = await rp({
    url: url,
    // Timeout if the response doesn't come under 2s
    timeout: 2000
  })
    .then(function(body) {
      return {
        body
      };
    })
    .catch(function(err) {
      return {
        err
      };
    });
  return data;
}

async function templateResolver(req, res, next) {
  // Get the request URL
  const requestURL = req.params[0];
  console.log('---------------');
  console.log(requestURL);
  console.log('---------------');
  const urlObj = await getData(`${baseURL}/templates/${requestURL}.html`);

  if (urlObj.err) {
    next(urlObj.err);
  } else {
    let data;
    try {
      data = urlObj.body;
    } catch (err) {
      next(err);
      return;
    }
    const outputTemplate = await microAppResolver(data);
    res.send(outputTemplate);
  }
}

module.exports = templateResolver;
