const express = require('express');
const suggestionsRouter = express.Router();
const db = new (require('./db'))();
const cache = require('./cache');
const config = require('./config');
const fastJSON = require('fast-json-stringify');
const stringify = fastJSON(require('./response-schema.json'));
db.load();

/**
 * Main route handler for /suggestions.
 *
 * Includes the caching layer as an early middleware and
 * basic error handling as a final middleware.
 */
suggestionsRouter.get('/suggestions',
  handleCache,
  handleRequest,
  handleError
);

function handleCache(req, res, next) {
  const {
    q: query,
    lat,
    long,
    ['use-cache']: useCache = true,
    limit = config.search.minResults
  } = req.query;

  if (!query) {
    throw new Error('Empty query');
  }

  Object.assign(res.locals, {query, lat, long, useCache, limit});

  res.locals.cacheKey = cache.genKey(query, lat, long, limit);

  if (useCache === true) {
    req.app.locals.cache.read(res.locals.cacheKey, (err, cachedValue) => {
      return cachedValue ?
        sendResponse(res, cachedValue).end() :
        next();
    });
  } else return next();
}

async function handleRequest(req, res, next) {
  const { query, lat, long, limit, cacheKey } = res.locals;

  const output = await searchDB(query, lat, long, limit);
  req.app.locals.cache.store(cacheKey, output);

  return sendResponse(res, output).end();
}

function handleError(err, req, res, next) {
  if (err.message === 'Empty query') {
    res.status(404);
    return res.json({
      error: err.message
    });
  }

  res.status(500);
  res.end();
}

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
    res.setHeader('Content-Type', 'application/json');
    status = 200;
  } else {
    status = 404;
  }

  res.status(status);
  return res.send(stringify(output));
}

module.exports = suggestionsRouter;