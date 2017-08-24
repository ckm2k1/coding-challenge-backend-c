const express = require('express');
const suggestionsRouter = express.Router();
const db = new (require('./db'))();
const cache = require('./cache');
const config = require('./config');
const os = require('os');
db.load();

suggestionsRouter.use((req, res, next) => {
  const {q: query, lat, long, ['use-cache']: useCache = true, limit = config.search.minResults} = req.query;

  if (!query) {
    throw new Error('Empty query');
  }

  Object.assign(res.locals, {query, lat, long, useCache, limit});

  res.locals.cacheKey = cache.genKey(query, lat, long, limit);

  if (useCache === true) {
    req.app.locals.cache.read(res.locals.cacheKey, (err, cachedValue) => {
      // if (cachedValue) console.log('CACHE HIT', res.locals.cacheKey);

      return cachedValue ?
        sendResponse(res, cachedValue).end() :
        next();
    });
  } else return next();
});

suggestionsRouter.get('/suggestions', (req, res, next) => {
  const { query, lat, long, limit, cacheKey } = res.locals;

  const output = searchDB(query, lat, long, limit);

  req.app.locals.cache.store(cacheKey, output);
  sendResponse(res, output).end();
});

function searchDB(query, lat, long, limit) {
  const output = {suggestions: db.search(query, parseFloat(lat), parseFloat(long)).slice(0, limit)};

    output.suggestions = output.suggestions.map((sug) => {
      return {
        id: sug.id,
        name: sug.name,
        lat: sug.latitude,
        lang: sug.longitude,
        stateOrProvince: sug.adminCodeUtf8,
        country: sug.country,
        distance: sug.distance,
        population: sug.population,
        score: sug.score
      }
    });

    return output;
}

function sendResponse(res, output) {
  // Close connections immediately since
  // we won't have any futher interaction with
  // the client and we want to hurry up and move
  // on to the next request.
  res.setHeader('Connection', 'close');

  res.status(output.suggestions.length ? 200 : 404);
  return res.json(output);
}

suggestionsRouter.get('/machine-stats', (req, res) => {
  res.json({
    mem: process.memoryUsage(),
    cpus: config.cpus,
    uptime: process.uptime(),
    cpuUsageTIme: process.cpuUsage(),
    systemMem: {
      freem: os.freemem() / 1e6,
      total: os.totalmem() / 1e6
    },
    load: os.loadavg()
  });
})

module.exports = suggestionsRouter;