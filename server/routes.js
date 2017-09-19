const db = new (require('./db'))();
const config = require('./config');
const fastJSON = require('fast-json-stringify');
const stringify = fastJSON(require('./response-schema.json'));
const querystring = require('querystring');
const url = require('url');
const crypto = require('crypto');
db.load();



function genKey(...args) {
  const hash = crypto.createHash('sha256');

  return hash.update([...args].join('')).digest('hex');
}

/**
 * Main route handler for /suggestions.
 *
 * Includes the caching layer as an early middleware and
 * basic error handling as a final middleware.
 */
module.exports = async function handler(cache, req, res) {
  const reqUrl = url.parse(req.url);

  if (reqUrl.pathname === '/suggestions') {
    const {
      q: query,
      lat,
      long,
      ['use-cache']: useCache = true,
      limit = config.search.minResults
    } = querystring.parse(reqUrl.query);

    // debug(query, lat, long, useCache);

    if (!query) {
      throw new Error('Empty query');
    }

    const cacheKey = genKey(query, lat, long, limit);

    let output;
    if (useCache) {
        output = await new Promise((resolve, reject) => {
        cache.read(cacheKey, (err, cachedValue) => {
          // debug(cachedValue);
          const result = cachedValue ?
            cachedValue :
            handleSearch(cache, query, lat, long, limit);

          return resolve(result);
        });
      });
    } else {
      output = await handleSearch(cache, query, lat, long, limit);
    }

    return sendResponse(res, output);
  }
}

async function handleSearch(cache, ...args) {
  const cacheKey = genKey(...args);

  const output = await searchDB(...args);
  cache.store(cacheKey, output);

  return output;
}

// function handleError(err, req, res, next) {
//   if (err.message === 'Empty query') {
//     res.status(404);
//     return res.json({
//       error: err.message
//     });
//   }

//   res.status(500);
//   res.end();
// }

/**
 * Perform the search and map the output to our response
 * format.
 *
 * @param {string} query User query.
 * @param {number} lat User latitude coordinate.
 * @param {number} long User longitude coordinate.
 * @param {integer} limit How many rows to return.
 *
 * @return {object} An object with all suggestions relevant to user query.
 */
async function searchDB(query, lat, long, limit) {
  const results = await db.search(query, parseFloat(lat), parseFloat(long));
  const output = { suggestions: results.slice(0, limit) };

    output.suggestions = output.suggestions.map((sug) => {
      return {
        id: sug.id,
        name: sug.name,
        asciiname: sug.asciiname,
        lat: sug.latitude,
        long: sug.longitude,
        stateOrProvince: sug.adminCodeUtf8,
        country: sug.country,
        distance: sug.distance,
        population: sug.population,
        score: sug.score,
        comps: sug.comps
      }
    });

    return output;
}

/**
 * Send out the response, setting appropriate
 * headers.
 *
 * @param {Response} res Response object provided by express.
 * @param {object} output Output object returned from searching DB.
 *
 * @return {undefined}
 */
function sendResponse(res, output) {
  // Close connections immediately since
  // we won't have any futher interaction with
  // the client and we want to hurry up and move
  // on to the next request.
  res.setHeader('Connection', 'close');

  let status;
  if (output.suggestions.length) {
    // we set this header manually because we stringify
    // the data ourselves using fast-json which avoids
    // a trip to the native JSONStrigifier. Suprisingly,
    // this is actually faster when the schema of the
    // object is known in advance.
    output = stringify(output);
    res.setHeader('Content-Type', 'text/html');
    // res.setHeader('Content-Length', output.length);

    status = 200;
  } else {
    status = 404;
  }

  res.statusCode = status;
  return res.end(output, 'utf8');
}
